import React from 'react';
import { PredictionResponse } from '../types';
import { AnalysisMode } from '../App';

interface PredictionDisplayProps {
    predictionData: PredictionResponse | null;
    analysisMode: AnalysisMode;
    year: number;
}

const PredictionDisplay: React.FC<PredictionDisplayProps> = ({ predictionData, analysisMode, year }) => {
    if (!predictionData) {
        return null;
    }

    const { predictions, analysis } = predictionData;
    
    const insightTitle = analysisMode === 'singleYear'
        ? `Bookmaker's Insight (Analysis of ${year} Data):`
        : "Bookmaker's Insight (All-Time Analysis):";

    return (
        <div className="mt-10 w-full max-w-2xl bg-gray-800 bg-opacity-50 backdrop-blur-sm rounded-2xl shadow-2xl p-6 sm:p-8 border border-green-500/30">
            <h2 className="text-2xl sm:text-3xl font-bold text-center text-green-300 mb-6">
                Your Lucky Numbers
            </h2>

            <div className="flex justify-center items-center gap-2 sm:gap-4 mb-8">
                {predictions.map((p, index) => (
                    <div
                        key={index}
                        className="flex flex-col items-center justify-center bg-yellow-400 text-gray-900 rounded-full w-16 h-16 sm:w-20 sm:h-20 shadow-lg transform transition-transform duration-500 hover:scale-110"
                        style={{ animation: `fadeInUp 0.5s ease-out ${index * 0.1}s forwards`, opacity: 0 }}
                    >
                        <span className="text-2xl sm:text-3xl font-extrabold">{p.number}</span>
                        <span className="text-xs sm:text-sm opacity-80">
                            {Math.round(p.probability * 100)}%
                        </span>
                    </div>
                ))}
            </div>

            <div className="text-left">
                <h3 className="text-lg sm:text-xl font-semibold text-yellow-300 mb-2">{insightTitle}</h3>
                <p className="text-gray-300 leading-relaxed">{analysis}</p>
            </div>
        </div>
    );
};

// Add keyframes for animation in a style tag or CSS file if preferred
const style = document.createElement('style');
style.innerHTML = `
@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}
`;
document.head.appendChild(style);


export default PredictionDisplay;