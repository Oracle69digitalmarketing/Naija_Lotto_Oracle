import React, { useEffect } from 'react';
import type { PredictionResponse, AnalysisMode } from '../types.ts';

interface PredictionDisplayProps {
    prediction: PredictionResponse;
    year: number;
    mode: AnalysisMode;
}

export const PredictionDisplay: React.FC<PredictionDisplayProps> = ({ prediction, year, mode }) => {
    useEffect(() => {
        const styleId = 'prediction-ball-animation';
        if (!document.getElementById(styleId)) {
            const style = document.createElement('style');
            style.id = styleId;
            style.innerHTML = `
                @keyframes pop-in {
                    0% { transform: scale(0); opacity: 0; }
                    60% { transform: scale(1.1); opacity: 1; }
                    100% { transform: scale(1); }
                }
                .prediction-ball {
                    animation: pop-in 0.5s ease-out forwards;
                }
            `;
            document.head.appendChild(style);
        }
    }, []);

    if (!prediction) return null;

    return (
        <div className="mt-8 w-full">
            <div className="bg-gray-800 p-6 rounded-lg shadow-2xl">
                <h3 className="text-2xl font-bold text-yellow-400 text-center mb-4">Oracle's Prediction</h3>
                <p className="text-center text-gray-400 mb-6">
                    Based on {mode === 'allYears' ? 'All-Time' : `Single Year (${year})`} Data
                </p>
                <div className="flex justify-center space-x-2 md:space-x-4 mb-6">
                    {prediction.predictions.map((p, index) => (
                        <div
                            key={p.number}
                            className="prediction-ball bg-yellow-400 text-gray-900 rounded-full w-14 h-14 md:w-16 md:h-16 flex flex-col items-center justify-center font-bold text-2xl shadow-lg"
                            style={{ animationDelay: `${index * 100}ms` }}
                        >
                            <span>{p.number}</span>
                        </div>
                    ))}
                </div>
                <div className="bg-gray-900 p-4 rounded-lg">
                    <h4 className="text-lg font-semibold text-yellow-300 mb-2">Bookmaker's Insight</h4>
                    <p className="text-gray-300 text-sm">{prediction.analysis}</p>
                </div>
                <p className="text-xs text-gray-500 mt-4 text-center">*For entertainment purposes only. Play responsibly.</p>
            </div>
        </div>
    );
};
