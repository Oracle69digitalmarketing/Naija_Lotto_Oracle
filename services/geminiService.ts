import { GoogleGenAI, Type } from "@google/genai";
import { PredictionResponse, NumberAnalysisResponse } from '../types';

// FIX: Initialize GoogleGenAI with apiKey from environment variables.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const model = 'gemini-2.5-pro'; // Use a powerful model for analysis

const systemInstruction = "You are the Naija Lotto Oracle, an expert AI that analyzes Nigerian lottery data to predict lucky numbers. You provide your analysis in the persona of a seasoned Lagos bookmaker, using insightful and slightly mysterious language. Your predictions are for entertainment purposes only. Do not reveal you are an AI. Only return the specified JSON object.";

export const getPredictions = async (
    game: string,
    mode: 'singleYear' | 'allYears',
    year: number
): Promise<PredictionResponse> => {
    
    const analysisPeriod = mode === 'singleYear' ? `the year ${year}` : 'all available historical data';
    const prompt = `Analyze the '${game}' lotto game. Considering data from ${analysisPeriod}, predict the 5 most likely numbers to be drawn next. Provide a deep analysis of why these numbers were chosen, considering patterns, frequency, and any other mystical insights you have. The numbers should be between 1 and 90.`;

    try {
        // FIX: Use ai.models.generateContent to call the Gemini API.
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                systemInstruction,
                responseMimeType: "application/json",
                // FIX: Define responseSchema to get structured JSON output.
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        predictions: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    number: { type: Type.INTEGER },
                                    probability: { type: Type.NUMBER }
                                },
                                required: ['number', 'probability']
                            }
                        },
                        analysis: {
                            type: Type.STRING
                        }
                    },
                    required: ['predictions', 'analysis']
                }
            }
        });
        
        // FIX: Access the 'text' property of the response for the JSON string.
        const jsonText = response.text;
        const data = JSON.parse(jsonText);
        
        if (!data.predictions || !data.analysis) {
            throw new Error("Invalid response structure from API.");
        }
        
        return data as PredictionResponse;

    } catch (error) {
        console.error("Error fetching predictions from Gemini API:", error);
        throw new Error("The Oracle is silent... Could not fetch predictions. Please try again later.");
    }
};


export const analyzeNumber = async (
    game: string,
    number: number,
    mode: 'singleYear' | 'allYears',
    year: number
): Promise<NumberAnalysisResponse> => {

    const analysisPeriod = mode === 'singleYear' ? `the year ${year}` : 'all available historical data';
    const prompt = `Analyze the number ${number} for the '${game}' lotto game, considering data from ${analysisPeriod}. Is this number currently 'Hot' (appearing frequently), 'Cold' (not appearing for a while), 'Overdue' (based on its historical frequency, it should have appeared recently), or 'Neutral'? Provide its total frequency and a bookmaker's insight into its potential.`;

    try {
        // FIX: Use ai.models.generateContent for the analysis call.
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                systemInstruction,
                responseMimeType: "application/json",
                // FIX: Define responseSchema for number analysis.
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        analysis: { type: Type.STRING },
                        status: { type: Type.STRING, enum: ['Hot', 'Cold', 'Neutral', 'Overdue'] },
                        frequency: { type: Type.INTEGER }
                    },
                    required: ['analysis', 'status', 'frequency']
                }
            }
        });
        
        // FIX: Access the 'text' property of the response for the JSON string.
        const jsonText = response.text;
        const data = JSON.parse(jsonText);

        if (!data.analysis || !data.status || data.frequency === undefined) {
             throw new Error("Invalid response structure from API for number analysis.");
        }

        return data as NumberAnalysisResponse;

    } catch (error) {
        console.error("Error fetching number analysis from Gemini API:", error);
        throw new Error("The Oracle is contemplating... Could not analyze the number. Please try again later.");
    }
};
