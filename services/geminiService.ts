// Fix: Import 'post' from 'aws-amplify/api' instead of 'API' from 'aws-amplify' for Amplify v6+.
import { post } from 'aws-amplify/api';
import { PredictionResponse, NumberAnalysisResponse } from '../types';

// This is the name you gave your API in `amplify add api`
const apiName = 'NaijaLottoOracleAPI';

/**
 * These functions now make secure, authenticated calls to your AWS Amplify backend.
 * The backend consists of an API Gateway endpoint that triggers a Lambda function.
 * The Lambda function is where the actual call to the AI service (Gemini or Bedrock) happens.
 * Your sensitive API keys are stored securely on the backend, never in the frontend code.
 */

export const getPredictions = async (
    game: string,
    mode: 'singleYear' | 'allYears',
    year: number
): Promise<PredictionResponse> => {
    const path = '/predictions';
    const request = {
        headers: {
            'Content-Type': 'application/json',
            // Amplify automatically adds the user's auth token
        },
        body: { game, mode, year },
    };
    try {
        console.log(`Making live API call to POST ${path} with body:`, request.body);
        // Fix: Use the new 'post' function syntax from Amplify v6+
        const restOperation = post({
            apiName,
            path,
            options: request,
        });
        const { body } = await restOperation.response;
        const response = await body.json();
        return response as PredictionResponse;
    } catch (error) {
        console.error("Error calling backend API for predictions:", error);
        // Fix: Handle the new error response structure from Amplify v6+
        let errorMessage = "The connection to the Oracle is weak. Please try again.";
        if ((error as any).response) {
            try {
                const errorBody = await (error as any).response.body.json();
                errorMessage = errorBody.message || errorMessage;
            } catch (e) {
                console.error("Failed to parse error response body for predictions:", e);
            }
        }
        throw new Error(errorMessage);
    }
};


export const analyzeNumber = async (
    game: string,
    number: number,
    mode: 'singleYear' | 'allYears',
    year: number
): Promise<NumberAnalysisResponse> => {
    const path = '/analyze';
     const request = {
        headers: {
            'Content-Type': 'application/json',
        },
        body: { game, number, mode, year },
    };
    try {
        console.log(`Making live API call to POST ${path} with body:`, request.body);
        // Fix: Use the new 'post' function syntax from Amplify v6+
        const restOperation = post({
            apiName,
            path,
            options: request,
        });
        const { body } = await restOperation.response;
        const response = await body.json();
        return response as NumberAnalysisResponse;
    } catch (error) {
        console.error("Error calling backend API for number analysis:", error);
        // Fix: Handle the new error response structure from Amplify v6+
        let errorMessage = "The Oracle is contemplating... Could not analyze the number.";
        if ((error as any).response) {
            try {
                const errorBody = await (error as any).response.body.json();
                errorMessage = errorBody.message || errorMessage;
            } catch (e) {
                console.error("Failed to parse error response body for number analysis:", e);
            }
        }
        throw new Error(errorMessage);
    }
};
