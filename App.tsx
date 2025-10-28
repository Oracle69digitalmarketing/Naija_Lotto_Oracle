import React, { useState, useEffect } from 'react';
import { withAuthenticator, WithAuthenticatorProps } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';

import Header from './components/Header';
import GameSelector from './components/GameSelector';
import AnalysisModeSelector from './components/AnalysisModeSelector';
import YearSelector from './components/YearSelector';
import PredictionDisplay from './components/PredictionDisplay';
import NumberAnalyzer from './components/NumberAnalyzer';
import Loader from './components/Loader';
import UpgradeModal from './components/UpgradeModal';
import { getPredictions, analyzeNumber } from './services/aiService';
import { PredictionResponse, NumberAnalysisResponse } from './types';

export type AnalysisMode = 'singleYear' | 'allYears';

const App: React.FC<WithAuthenticatorProps> = ({ signOut, user }) => {
    // State management
    // In a real app, isProUser and trialUsesLeft would be fetched from a backend DB like DynamoDB
    const [isProUser, setIsProUser] = useState(false); 
    const [trialUsesLeft, setTrialUsesLeft] = useState(3);
    
    const games = ['Golden Chance', 'Premier Star', 'Western Lotto', 'Green Lotto'];
    const [selectedGame, setSelectedGame] = useState(games[0]);
    const [analysisMode, setAnalysisMode] = useState<AnalysisMode>('singleYear');
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    const [isLoadingPredictions, setIsLoadingPredictions] = useState(false);
    const [predictionData, setPredictionData] = useState<PredictionResponse | null>(null);
    const [predictionError, setPredictionError] = useState<string | null>(null);

    const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);
    const [analysisData, setAnalysisData] = useState<NumberAnalysisResponse | null>(null);
    const [analysisError, setAnalysisError] = useState<string | null>(null);

    const [isUpgradeModalVisible, setUpgradeModalVisible] = useState(false);
    
    // Guest users don't exist in this model; they are unauthenticated.
    // The trial is for newly signed-up, non-pro users.
    const isTrialOver = !isProUser && trialUsesLeft <= 0;

    useEffect(() => {
        setPredictionData(null);
        setPredictionError(null);
    }, [selectedGame, selectedYear, analysisMode]);

    const handleGeneratePredictions = async () => {
        if (!isProUser && isTrialOver) {
            setUpgradeModalVisible(true);
            return;
        }

        setIsLoadingPredictions(true);
        setPredictionError(null);
        setPredictionData(null);

        try {
            const data = await getPredictions(selectedGame, analysisMode, selectedYear);
            setPredictionData(data);
            if (!isProUser) {
                setTrialUsesLeft(prev => Math.max(0, prev - 1));
            }
        } catch (error) {
            setPredictionError(error instanceof Error ? error.message : 'An unknown error occurred.');
        } finally {
            setIsLoadingPredictions(false);
        }
    };

    const handleAnalyzeNumber = async (num: number) => {
        if (!isProUser) {
            setUpgradeModalVisible(true);
            return;
        }
        setIsLoadingAnalysis(true);
        setAnalysisError(null);
        setAnalysisData(null);

        try {
            const data = await analyzeNumber(selectedGame, num, analysisMode, selectedYear);
            setAnalysisData(data);
        } catch (error) {
            setAnalysisError(error instanceof Error ? error.message : 'An unknown error occurred.');
        } finally {
            setIsLoadingAnalysis(false);
        }
    };
    
    const handleUpgrade = () => {
        // In a real app, this would trigger a payment flow (e.g., Stripe)
        // On success, the backend would update the user's status in DynamoDB
        alert("This would open a real payment form (e.g., Stripe). Simulating successful payment.");
        setIsProUser(true);
        setUpgradeModalVisible(false);
    };

    const handleLockedFeatureClick = () => {
        setUpgradeModalVisible(true);
    }

    return (
        <div className="bg-gray-900 text-white min-h-screen font-sans">
            <div className="container mx-auto px-4 py-8 flex flex-col items-center">
                
                <Header 
                    user={user}
                    onLogoutClick={signOut}
                    isProUser={isProUser}
                    trialUsesLeft={trialUsesLeft}
                />

                <main className="w-full max-w-4xl mt-12 flex flex-col items-center">
                    <GameSelector 
                        games={games}
                        selectedGame={selectedGame}
                        onSelectGame={setSelectedGame}
                        isProUser={isProUser}
                    />
                    
                    <div className="w-full max-w-2xl bg-gray-800 bg-opacity-30 p-6 rounded-2xl shadow-xl border border-gray-700">
                        <AnalysisModeSelector
                            selectedMode={analysisMode}
                            onSelectMode={setAnalysisMode}
                            isProUser={isProUser}
                            onLockClick={handleLockedFeatureClick}
                        />
                        {analysisMode === 'singleYear' && (
                           <YearSelector selectedYear={selectedYear} onSelectYear={setSelectedYear} />
                        )}

                        <div className="mt-8 text-center">
                            <button
                                onClick={handleGeneratePredictions}
                                disabled={isLoadingPredictions}
                                className="px-10 py-4 bg-gradient-to-r from-green-500 to-teal-500 text-white font-bold text-xl rounded-full shadow-lg transform hover:scale-105 transition-transform duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center mx-auto"
                            >
                                {isLoadingPredictions ? (
                                    <><div className="w-6 h-6 border-2 border-dashed rounded-full animate-spin border-white mr-3"></div> Revealing Fate...</>
                                ) : (
                                    <><i className="fas fa-magic mr-3"></i> Get Lucky Numbers</>
                                )}
                            </button>
                        </div>
                    </div>
                    
                    {isLoadingPredictions && <div className="mt-10"><Loader /></div>}
                    {predictionError && <p className="mt-10 text-red-400 text-center">{predictionError}</p>}
                    <PredictionDisplay predictionData={predictionData} analysisMode={analysisMode} year={selectedYear} />

                    <div className="w-full border-t border-gray-700 my-16"></div>

                    <h2 className="text-3xl font-bold text-center text-yellow-300 mb-4">Personal Number Analyzer <span className="text-sm align-super">(PRO)</span></h2>
                    <p className="text-center text-gray-400 mb-8 max-w-xl">Got a gut feeling about a number? See what the Oracle thinks about its chances for the selected game and period.</p>

                    <NumberAnalyzer
                        onAnalyze={handleAnalyzeNumber}
                        analysisData={analysisData}
                        isLoading={isLoadingAnalysis}
                        error={analysisError}
                        analysisMode={analysisMode}
                        setAnalysisMode={setAnalysisMode}
                        selectedYear={selectedYear}
                        setSelectedYear={setSelectedYear}
                        isProUser={isProUser}
                        onLockClick={handleLockedFeatureClick}
                    />
                </main>

                <UpgradeModal 
                    isVisible={isUpgradeModalVisible}
                    onClose={() => setUpgradeModalVisible(false)}
                    onUpgrade={handleUpgrade}
                    isTrialOver={isTrialOver}
                />
            </div>
        </div>
    );
};

export default withAuthenticator(App);