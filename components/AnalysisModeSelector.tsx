import React from 'react';
import { ProBadge } from './ProBadge.tsx';
import type { AnalysisMode } from '../types.ts';

interface AnalysisModeSelectorProps {
    analysisMode: AnalysisMode;
    setAnalysisMode: (mode: AnalysisMode) => void;
    isProUser: boolean;
    onLockClick: () => void;
}

export const AnalysisModeSelector: React.FC<AnalysisModeSelectorProps> = ({ analysisMode, setAnalysisMode, isProUser, onLockClick }) => {
    const modes = [
        { id: 'singleYear', label: 'Single Year', isPro: false },
        { id: 'allYears', label: 'All Years', isPro: true }
    ];

    return (
        <div className="mb-6">
            <h2 className="text-xl font-semibold text-yellow-300 mb-3 text-center">Analysis Mode</h2>
            <div className="flex bg-gray-800 rounded-lg p-1">
                {modes.map(mode => {
                    const isLocked = mode.isPro && !isProUser;
                    return (
                        <button
                            key={mode.id}
                            onClick={() => (isLocked ? onLockClick() : setAnalysisMode(mode.id as AnalysisMode))}
                            className={`w-full p-2 rounded-md font-semibold transition duration-300 flex items-center justify-center ${
                                analysisMode === mode.id && !isLocked
                                    ? 'bg-yellow-500 text-gray-900'
                                    : 'text-gray-300 hover:bg-gray-700'
                            } ${isLocked ? 'cursor-not-allowed opacity-60' : ''}`}
                        >
                            {mode.label}
                            {isLocked && <ProBadge />}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
