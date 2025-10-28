import React from 'react';
import { AnalysisMode } from '../App';
import ProBadge from './ProBadge';

interface AnalysisModeSelectorProps {
    selectedMode: AnalysisMode;
    onSelectMode: (mode: AnalysisMode) => void;
    isProUser: boolean;
    onLockClick: () => void;
}

const AnalysisModeSelector: React.FC<AnalysisModeSelectorProps> = ({ selectedMode, onSelectMode, isProUser, onLockClick }) => {
    const isAllYearsLocked = !isProUser;

    const handleModeClick = (mode: AnalysisMode) => {
        if (mode === 'allYears' && isAllYearsLocked) {
            onLockClick();
        } else {
            onSelectMode(mode);
        }
    }
    
    return (
        <div className="flex justify-center bg-gray-700 p-1 rounded-full mb-8 max-w-sm mx-auto">
            <button
                onClick={() => handleModeClick('singleYear')}
                className={`w-1/2 py-2 text-sm sm:text-base font-bold rounded-full transition-colors duration-300 focus:outline-none ${
                    selectedMode === 'singleYear' ? 'bg-green-500 text-white' : 'text-gray-300 hover:bg-gray-600'
                }`}
            >
                Single Year
            </button>
            <button
                onClick={() => handleModeClick('allYears')}
                disabled={isAllYearsLocked && selectedMode !== 'allYears'}
                className={`relative w-1/2 py-2 text-sm sm:text-base font-bold rounded-full transition-colors duration-300 focus:outline-none flex items-center justify-center gap-2 ${
                    selectedMode === 'allYears' ? 'bg-green-500 text-white' : 'text-gray-300 hover:bg-gray-600'
                } ${isAllYearsLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
                All Years {isAllYearsLocked && <ProBadge />}
            </button>
        </div>
    );
};

export default AnalysisModeSelector;