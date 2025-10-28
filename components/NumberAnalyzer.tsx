import React, { useState } from 'react';
import { Loader } from './Loader';
import { ProBadge } from './ProBadge';
import type { NumberAnalysisResponse, AnalysisMode } from '../types';

interface NumberAnalyzerProps {
    analyzeNumberService: (game: string, mode: AnalysisMode, year: number, number: number) => Promise<NumberAnalysisResponse>;
    isProUser: boolean;
    onLockClick: () => void;
    game: string;
    mode: AnalysisMode;
    year: number;
}

export const NumberAnalyzer: React.FC<NumberAnalyzerProps> = ({ analyzeNumberService, isProUser, onLockClick, game, mode, year }) => {
    const [number, setNumber] = useState('');
    const [analysis, setAnalysis] = useState<NumberAnalysisResponse | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleAnalyze = async () => {
        if (!isProUser) {
            onLockClick();
            return;
        }
        const num = parseInt(number);
        if (isNaN(num) || num < 1 || num > 90) {
            setError('Please enter a valid number between 1 and 90.');
            return;
        }
        setError('');
        setIsLoading(true);
        setAnalysis(null);
        try {
            const result = await analyzeNumberService(game, mode, year, num);
            setAnalysis(result);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusColor = (status?: string) => {
        switch (status?.toLowerCase()) {
            case 'hot': return 'bg-red-500 text-red-100';
            case 'cold': return 'bg-blue-500 text-blue-100';
            case 'overdue': return 'bg-green-500 text-green-100';
            default: return 'bg-gray-600 text-gray-200';
        }
    };

    return (
        <div className="w-full">
            <div className="bg-gray-800 p-6 rounded-lg shadow-2xl">
                <h3 className="text-2xl font-bold text-yellow-400 text-center mb-4 flex items-center justify-center">
                    Lucky Number Analyzer
                    {!isProUser && <ProBadge />}
                </h3>
                <div className="flex flex-col sm:flex-row gap-3 mb-4">
                    <input
                        type="number"
                        value={number}
                        onChange={e => setNumber(e.target.value)}
                        placeholder="Enter a number (1-90)"
                        className="flex-grow p-3 bg-gray-700 text-white rounded-lg focus:ring-yellow-500 focus:border-yellow-500 disabled:opacity-50"
                        disabled={!isProUser}
                    />
                    <button
                        onClick={handleAnalyze}
                        className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold py-3 px-6 rounded-lg transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isLoading || !number || !isProUser}
                    >
                        {isLoading ? 'Analyzing...' : 'Analyze Number'}
                    </button>
                </div>
                {error && <p className="text-red-400 text-center mb-4">{error}</p>}
                {isLoading && <Loader text="Consulting the Oracle..." />}
                {analysis && (
                    <div className="bg-gray-900 p-4 rounded-lg mt-4">
                        <div className="flex justify-between items-start mb-3">
                            <h4 className="text-lg font-semibold text-yellow-300">Bookmaker's Insight</h4>
                            <span className={`px-3 py-1 text-sm font-bold rounded-full ${getStatusColor(analysis.status)}`}>
                                {analysis.status}
                            </span>
                        </div>
                        <p className="text-gray-300 text-sm mb-3">{analysis.analysis}</p>
                        <p className="text-xs text-gray-400">Frequency in data: {analysis.frequency} time(s)</p>
                    </div>
                )}
            </div>
        </div>
    );
};