import { post } from 'aws-amplify/api';
import type { PredictionResponse, NumberAnalysisResponse, AnalysisMode } from './types';

const apiName = 'NaijaLottoOracleAPI';

export async function getLuckyNumbers(
    game: string,
    mode: AnalysisMode,
    year: number
): Promise<PredictionResponse> {
    try {
        const restOperation = post({
            apiName,
            path: '/predictions',
            options: {
                body: { game, mode, year }
            }
        });

        const { body } = await restOperation.response;
        // FIX: Explicitly type `json` as `any` to allow property access for validation.
        const json: any = await body.json();
        
        // Basic validation
        if (!json.predictions || !json.analysis) {
             throw new Error("Invalid response structure from AI service.");
        }
        
        return json as PredictionResponse;
    } catch (error: any) {
        console.error('Error fetching predictions from backend:', error);
        throw new Error(error.response?.data?.message || 'Failed to get predictions from the Oracle.');
    }
}

export async function analyzeSingleNumber(
    game: string,
    mode: AnalysisMode,
    year: number,
    number: number
): Promise<NumberAnalysisResponse> {
    try {
        const restOperation = post({
            apiName,
            path: '/analyze',
            options: {
                body: { game, mode, year, number }
            }
        });

        const { body } = await restOperation.response;
        // FIX: Explicitly type `json` as `any` to allow property access for validation.
        const json: any = await body.json();

        // Basic validation
        if (!json.analysis || !json.status || json.frequency === undefined) {
             throw new Error("Invalid response structure from AI service for analysis.");
        }
        
        return json as NumberAnalysisResponse;
    } catch (error: any) {
        console.error('Error fetching analysis from backend:', error);
        throw new Error(error.response?.data?.message || 'Failed to get analysis from the Oracle.');
    }
}