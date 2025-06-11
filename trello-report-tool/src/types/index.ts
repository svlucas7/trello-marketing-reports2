export interface TrelloCard {
    id: string;
    name: string;
    description: string;
    due: string | null;
    labels: string[];
    members: string[];
    listId: string;
    createdAt: string;
    updatedAt: string;
}

export interface TrelloList {
    id: string;
    name: string;
    cards: TrelloCard[];
}

export interface TrelloBoard {
    id: string;
    name: string;
    lists: TrelloList[];
}

export interface ReportData {
    totalCards: number;
    completedCards: number;
    overdueCards: number;
    metrics: {
        [key: string]: number;
    };
}

export interface MonthlyReport {
    month: string;
    year: number;
    reportData: ReportData;
}