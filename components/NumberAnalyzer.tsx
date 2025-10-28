import React, { useState } from 'react';
import { NumberAnalysisResponse } from '../types';
import AnalysisModeSelector from './AnalysisModeSelector';
import YearSelector from './YearSelector';
import { AnalysisMode } from '../App';
import Loader from './Loader';

interface NumberAnalyzerProps {
    onAnalyze: (number: number) => void;
    analysisData: NumberAnalysisResponse | null;
    isLoading: boolean;
    error: string | null;
    analysisMode: AnalysisMode;
    setAnalysisMode: (mode: AnalysisMode) => void;
    selectedYear: number;
    setSelectedYear: (year: number) => void;
    isProUser: boolean;
    onLockClick: () => void;
}

const NumberAnalyzer: React.FC<NumberAnalyzerProps> = ({ onAnalyze, analysisData, isLoading, error, analysisMode, setAnalysisMode, selectedYear, setSelectedYear, isProUser, onLockClick }) => {
    const [numberInput, setNumberInput] = useState<string>('');
    const [validationError, setValidationError] = useState<string>('');

    const handleAnalyzeClick = () => {
        if (!isProUser) {
            onLockClick();
            return;
        }
        const num = parseInt(numberInput, 10);
        if (isNaN(num) || num < 1 || num > 90) { // Assuming lotto numbers are between 1 and 90
            setValidationError('Please enter a valid number between 1 and 90.');
            return;
        }
        setValidationError('');
        onAnalyze(num);
    };
    
    const getStatusChipColor = (status: string) => {
        switch (status) {
            case 'Hot': return 'bg-red-500 text-white';
            case 'Cold': return 'bg-blue-500 text-white';
            case 'Overdue': return 'bg-yellow-500 text-gray-900';
            default: return 'bg-gray-500 text-white';
        }
    };

    return (
        <div className="w-full max-w-2xl flex flex-col items-center">
            <AnalysisModeSelector selectedMode={analysisMode} onSelectMode={setAnalysisMode} isProUser={isProUser} onLockClick={onLockClick}/>
            {analysisMode === 'singleYear' && (
                <YearSelector selectedYear={selectedYear} onSelectYear={setSelectedYear} />
            )}

            <div className="mt-8 flex flex-col sm:flex-row items-center gap-4 w-full justify-center">
                <input
                    type="number"
                    value={numberInput}
                    onChange={(e) => setNumberInput(e.target.value)}
                    placeholder="Enter your lucky number"
                    className="w-full sm:w-64 bg-gray-700 text-white text-center text-lg py-3 px-4 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500"
                    min="1"
                    max="90"
                />
                <button
                    onClick={handleAnalyzeClick}
                    disabled={isLoading}
                    className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 font-bold text-lg rounded-full shadow-lg transform hover:scale-105 transition-transform duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                    {isLoading ? (
                        <><div className="w-6 h-6 border-2 border-dashed rounded-full animate-spin border-gray-800 mr-3"></div> Analyzing...</>
                    ) : (
                        <><i className="fas fa-search mr-3"></i> Analyze</>
                    )}
                </button>
            </div>
            {validationError && <p className="mt-4 text-red-400">{validationError}</p>}
            
            {isLoading && <div className="mt-10"><Loader /></div>}
            {error && <p className="mt-10 text-red-400 text-center">{error}</p>}
            
            {analysisData && (
                <div className="mt-10 w-full bg-gray-800 bg-opacity-50 backdrop-blur-sm rounded-2xl shadow-2xl p-6 sm:p-8 border border-yellow-500/30">
                     <h2 className="text-2xl sm:text-3xl font-bold text-center text-yellow-300 mb-6">
                        Analysis for Number: <span className="text-white">{numberInput}</span>
                    </h2>
                    <div className="flex justify-around items-center mb-6 text-center">
                        <div>
                            <p className="text-sm text-gray-400">Status</p>
                            <span className={`px-4 py-1 text-lg font-bold rounded-full ${getStatusChipColor(analysisData.status)}`}>
                                {analysisData.status}
                            </span>
                        </div>
                         <div>
                            <p className="text-sm text-gray-400">Frequency</p>
                            <p className="text-2xl font-bold text-white">{analysisData.frequency}</p>
                        </div>
                    </div>
                     <div className="text-left">
                        <h3 className="text-lg sm:text-xl font-semibold text-green-300 mb-2">Bookmaker's Insight:</h3>
                        <p className="text-gray-300 leading-relaxed">{analysisData.analysis}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NumberAnalyzer;