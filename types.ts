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
  status: 'Hot' | 'Cold' | 'Overdue' | 'Neutral';
  frequency: number;
}

export type AnalysisMode = 'singleYear' | 'allYears';
