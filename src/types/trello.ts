// Tipos para dados do Trello
export interface TrelloCard {
  id: string;
  name: string;
  desc: string;
  due: string | null;
  dateLastActivity: string;
  idList: string;
  idMembers: string[];
  closed: boolean;
}

export interface TrelloList {
  id: string;
  name: string;
  closed: boolean;
}

export interface TrelloMember {
  id: string;
  fullName: string;
  username: string;
}

export interface TrelloBoard {
  name: string;
  cards: TrelloCard[];
  lists: TrelloList[];
  members: TrelloMember[];
}

// Tipos para relatórios
export interface TaskReport {
  collaboratorName: string;
  taskName: string;
  dueDate: string;
  status: TaskStatus;
  daysLate: number;
  observations: string;
}

export interface ReportSummary {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  lateTasks: number;
  blockedTasks: number;
}

export type TaskStatus = 
  | 'Concluída' 
  | 'Em Andamento' 
  | 'Atrasada' 
  | 'Bloqueada' 
  | 'Planejamento' 
  | 'Recorrente';

export interface DateRange {
  startDate: Date;
  endDate: Date;
}
