export interface Prediction {
    number: number;
    probability: number;
}

export interface PredictionResponse {
    predictions: Prediction[];
    analysis: string;
}

export interface NumberAnalysisResponse {
    analysis: string;
    status: 'Hot' | 'Cold' | 'Neutral' | 'Overdue';
    frequency: number;
}

export type AuthState = 'guest' | 'loggedIn';
