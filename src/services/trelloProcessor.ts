import type { TrelloBoard, TrelloCard, TaskReport, TaskStatus, ReportSummary, DateRange, CollaboratorReport } from '../types/trello';
import { isAfter, isBefore, format } from 'date-fns';

// Mapeamento das listas do Trello para status
const LIST_STATUS_MAP: Record<string, TaskStatus> = {
  'PLANEJANDO ESTRATÉGIAS': 'Planejamento',
  'ATIVIDADES RECORRENTES': 'Recorrente',
  'EM PROCESSO DE CONTEÚDO': 'Em Andamento',
  'EM PROCESSO DE QUALIDADE': 'Em Andamento',
  'EM PROCESSO DE EDIÇÃO E REVISÃO': 'Em Andamento',
  'EM PROCESSO DE MONTAGEM': 'Em Andamento',
  'EM PROCESSO DE REVISÃO': 'Em Andamento',
  'AGUARDANDO RETORNO DE CORREÇÕES': 'Bloqueada',
  'EM PROCESSO DE ENVIO': 'Em Andamento',
  'FEITO': 'Concluída',
  'FEITOS': 'Concluída' // Adicionando variação plural
};

export class TrelloProcessor {
  private board: TrelloBoard;
  constructor(board: TrelloBoard) {
    this.board = board;
    
    // Debug: Listar todas as listas disponíveis
    console.log('Listas disponíveis no board:');
    this.board.lists.forEach(list => {
      console.log(`- "${list.name}" (ID: ${list.id})`);
    });
  }  // Filtrar cards por período (incluindo cards concluídos)
  filterCardsByDateRange(dateRange: DateRange): TrelloCard[] {
    console.log('=== FILTRO POR DATA ===');
    console.log('Período:', format(dateRange.startDate, 'dd/MM/yyyy'), 'até', format(dateRange.endDate, 'dd/MM/yyyy'));
    console.log('Total de cards no board:', this.board.cards.length);
    
    const allCards = this.board.cards.filter(card => {
      const lastActivity = new Date(card.dateLastActivity);
      const isInDateRange = !isBefore(lastActivity, dateRange.startDate) && 
                           !isAfter(lastActivity, dateRange.endDate);
      
      console.log(`Card "${card.name}": última atividade ${format(lastActivity, 'dd/MM/yyyy')} - No período: ${isInDateRange}`);
      
      return isInDateRange;
    });
    
    console.log(`Total de cards no período: ${allCards.length}`);
    
    // Debug: Log para verificar cards e seus status
    allCards.forEach(card => {
      const status = this.getTaskStatus(card);
      console.log(`📋 Card: "${card.name}" - Status: ${status} - Fechado: ${card.closed} - Lista: ${this.getCurrentListName(card)}`);
    });
    
    console.log('=====================');
    return allCards;
  }// Obter status da tarefa baseado na lista
  getTaskStatus(card: TrelloCard): TaskStatus {
    const list = this.board.lists.find(l => l.id === card.idList);
    if (!list) {
      console.log('Lista não encontrada para card:', card.name);
      return 'Em Andamento';
    }

    const listNameUpper = list.name.toUpperCase().trim();

    // Considerar 'AGUARDANDO l RETORNO DE TERCEIROS' como concluída
    if (listNameUpper.includes('AGUARDANDO') && listNameUpper.includes('RETRONO') && listNameUpper.includes('TERCEIRO')) {
      return 'Concluída';
    }

    // Verificação mais flexível para listas de "concluído"
    if (listNameUpper.includes('FEITO') || 
        listNameUpper.includes('CONCLUÍ') || 
        listNameUpper.includes('FINALIZADO') ||
        listNameUpper.includes('COMPLETO') ||
        listNameUpper.includes('DONE') ||
        listNameUpper === 'FEITO' ||
        listNameUpper === 'FEITOS') {
      console.log(`✅ TAREFA CONCLUÍDA detectada: "${card.name}" na lista "${list.name}"`);
      return 'Concluída';
    }
    
    const status = LIST_STATUS_MAP[listNameUpper];
    console.log(`Status mapeado para "${card.name}": ${status || 'Em Andamento'}`);
    
    // Verificar se está atrasada (exceto se concluída)
    if (status !== 'Concluída' && card.due) {
      const dueDate = new Date(card.due);
      const now = new Date();
      if (isBefore(dueDate, now)) {
        console.log(`⚠️ Tarefa ATRASADA: "${card.name}" (prazo: ${card.due})`);
        return 'Atrasada';
      }
    }
    
    return status || 'Em Andamento';
  }

  // Calcular dias de atraso
  calculateDaysLate(card: TrelloCard): number {
    if (!card.due) return 0;
    
    const dueDate = new Date(card.due);
    const now = new Date();
    
    if (this.getTaskStatus(card) === 'Concluída') return 0;
    if (!isBefore(dueDate, now)) return 0;
    
    const diffTime = now.getTime() - dueDate.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  // Obter nome do colaborador
  getCollaboratorName(card: TrelloCard): string {
    if (card.idMembers.length === 0) return 'Não atribuído';
    
    const member = this.board.members.find(m => m.id === card.idMembers[0]);
    return member ? member.fullName : 'Não atribuído';
  }

  // Gerar relatório de tarefas
  generateTaskReports(dateRange: DateRange): TaskReport[] {
    const filteredCards = this.filterCardsByDateRange(dateRange);
    const reports: TaskReport[] = [];
    filteredCards.forEach(card => {
      // Para cada colaborador atribuído, gera um relatório
      if (card.idMembers.length === 0) {
        reports.push({
          collaboratorName: 'Não atribuído',
          taskName: card.name,
          dueDate: card.due ? format(new Date(card.due), 'dd/MM/yyyy') : 'Não definida',
          status: this.getTaskStatus(card),
          daysLate: this.calculateDaysLate(card),
          observations: card.desc || this.getCurrentListName(card)
        });
      } else {
        card.idMembers.forEach(memberId => {
          const member = this.board.members.find(m => m.id === memberId);
          reports.push({
            collaboratorName: member ? member.fullName : 'Não atribuído',
            taskName: card.name,
            dueDate: card.due ? format(new Date(card.due), 'dd/MM/yyyy') : 'Não definida',
            status: this.getTaskStatus(card),
            daysLate: this.calculateDaysLate(card),
            observations: card.desc || this.getCurrentListName(card)
          });
        });
      }
    });
    return reports;
  }

  // Obter nome da lista atual
  private getCurrentListName(card: TrelloCard): string {
    const list = this.board.lists.find(l => l.id === card.idList);
    return list ? list.name : 'Lista não encontrada';
  }  // Gerar resumo do relatório
  generateReportSummary(taskReports: TaskReport[]): ReportSummary {
    const totalTasks = taskReports.length;
    const completedTasks = taskReports.filter(t => t.status === 'Concluída').length;
    const inProgressTasks = taskReports.filter(t => t.status === 'Em Andamento').length;
    const lateTasks = taskReports.filter(t => t.status === 'Atrasada').length;
    const blockedTasks = taskReports.filter(t => t.status === 'Bloqueada').length;

    // Debug detalhado dos status
    console.log('=== DEBUG SUMMARY ===');
    console.log('Total tasks:', totalTasks);
    console.log('Completed tasks:', completedTasks);
    console.log('Status breakdown:');
    taskReports.forEach(task => {
      console.log(`- "${task.taskName}" -> Status: ${task.status} (Colaborador: ${task.collaboratorName})`);
    });
    console.log('===================');

    return {
      totalTasks,
      completedTasks,
      inProgressTasks,
      lateTasks,
      blockedTasks
    };
  }

  // Gerar relatórios individuais por colaborador
  generateCollaboratorReports(taskReports: TaskReport[]): CollaboratorReport[] {
    const collaboratorMap = new Map<string, TaskReport[]>();
    
    // Agrupar tarefas por colaborador
    taskReports.forEach(task => {
      const collaborator = task.collaboratorName;
      if (!collaboratorMap.has(collaborator)) {
        collaboratorMap.set(collaborator, []);
      }
      collaboratorMap.get(collaborator)!.push(task);
    });

    // Gerar relatório para cada colaborador
    return Array.from(collaboratorMap.entries()).map(([collaboratorName, tasks]) => {
      const totalTasks = tasks.length;
      const completedTasks = tasks.filter(t => t.status === 'Concluída').length;
      const inProgressTasks = tasks.filter(t => t.status === 'Em Andamento').length;
      const lateTasks = tasks.filter(t => t.status === 'Atrasada').length;
      const blockedTasks = tasks.filter(t => t.status === 'Bloqueada').length;
      
      const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
      
      const lateDays = tasks.filter(t => t.daysLate > 0).map(t => t.daysLate);
      const averageDaysLate = lateDays.length > 0 
        ? lateDays.reduce((sum, days) => sum + days, 0) / lateDays.length 
        : 0;

      return {
        collaboratorName,
        totalTasks,
        completedTasks,
        inProgressTasks,
        lateTasks,
        blockedTasks,
        completionRate: Math.round(completionRate),
        averageDaysLate: Math.round(averageDaysLate),
        tasks: tasks.sort((a, b) => {
          // Ordenar por status (concluídas primeiro) e depois por nome
          if (a.status === 'Concluída' && b.status !== 'Concluída') return -1;
          if (a.status !== 'Concluída' && b.status === 'Concluída') return 1;
          return a.taskName.localeCompare(b.taskName);
        })
      };
    }).sort((a, b) => b.completionRate - a.completionRate); // Ordenar por taxa de conclusão
  }

  // Validar estrutura do JSON do Trello
  static validateTrelloData(data: any): boolean {
    return (
      data &&
      Array.isArray(data.cards) &&
      Array.isArray(data.lists) &&
      Array.isArray(data.members) &&
      typeof data.name === 'string'
    );
  }
}
