import type { TrelloBoard, TrelloCard, TaskReport, TaskStatus, ReportSummary, DateRange } from '../types/trello';
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
  'FEITO': 'Concluída'
};

export class TrelloProcessor {
  private board: TrelloBoard;

  constructor(board: TrelloBoard) {
    this.board = board;
  }

  // Filtrar cards por período
  filterCardsByDateRange(dateRange: DateRange): TrelloCard[] {
    return this.board.cards.filter(card => {
      if (card.closed) return false;
      
      const lastActivity = new Date(card.dateLastActivity);
      return !isBefore(lastActivity, dateRange.startDate) && 
             !isAfter(lastActivity, dateRange.endDate);
    });
  }

  // Obter status da tarefa baseado na lista
  getTaskStatus(card: TrelloCard): TaskStatus {
    const list = this.board.lists.find(l => l.id === card.idList);
    if (!list) return 'Em Andamento';
    
    const status = LIST_STATUS_MAP[list.name.toUpperCase()];
    
    // Verificar se está atrasada (exceto se concluída)
    if (status !== 'Concluída' && card.due) {
      const dueDate = new Date(card.due);
      const now = new Date();
      if (isBefore(dueDate, now)) {
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
    
    return filteredCards.map(card => ({
      collaboratorName: this.getCollaboratorName(card),
      taskName: card.name,
      dueDate: card.due ? format(new Date(card.due), 'dd/MM/yyyy') : 'Não definida',
      status: this.getTaskStatus(card),
      daysLate: this.calculateDaysLate(card),
      observations: card.desc || this.getCurrentListName(card)
    }));
  }

  // Obter nome da lista atual
  private getCurrentListName(card: TrelloCard): string {
    const list = this.board.lists.find(l => l.id === card.idList);
    return list ? list.name : 'Lista não encontrada';
  }

  // Gerar resumo do relatório
  generateReportSummary(taskReports: TaskReport[]): ReportSummary {
    const totalTasks = taskReports.length;
    const completedTasks = taskReports.filter(t => t.status === 'Concluída').length;
    const inProgressTasks = taskReports.filter(t => t.status === 'Em Andamento').length;
    const lateTasks = taskReports.filter(t => t.status === 'Atrasada').length;
    const blockedTasks = taskReports.filter(t => t.status === 'Bloqueada').length;

    return {
      totalTasks,
      completedTasks,
      inProgressTasks,
      lateTasks,
      blockedTasks
    };
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
