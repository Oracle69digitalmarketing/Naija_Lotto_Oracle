import React, { useState } from 'react';
import { useAuthenticator } from '@aws-amplify/ui-react';

import { Header } from './components/Header';
import { GameSelector } from './components/GameSelector';
import { AnalysisModeSelector } from './components/AnalysisModeSelector';
import { YearSelector } from './components/YearSelector';
import { PredictionDisplay } from './components/PredictionDisplay';
import { NumberAnalyzer } from './components/NumberAnalyzer';
import { Loader } from './components/Loader';
import { UpgradeModal } from './components/UpgradeModal';
import * as aiService from './services/aiService';
import type { PredictionResponse, AnalysisMode } from './types';

export default function App() {
  const { user, signOut } = useAuthenticator((context) => [context.user]);
  
  const [viewMode, setViewMode] = useState('predictor');
  
  // Predictor State
  const [selectedGame, setSelectedGame] = useState('Premier Star');
  const [games] = useState([
    { name: 'Premier Star', isPro: false },
    { name: 'Golden Empire', isPro: true },
    { name: 'Western Star', isPro: true },
    { name: 'Emerald Lotto', isPro: true },
  ]);
  const [selectedYear, setSelectedYear] = useState(2024);
  const [analysisMode, setAnalysisMode] = useState<AnalysisMode>('singleYear');
  const [prediction, setPrediction] = useState<PredictionResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Monetization State
  const [isProUser, setIsProUser] = useState(false); // Default to free user
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const handleGetNumbers = async () => {
    setIsLoading(true);
    setError('');
    setPrediction(null);
    try {
      const result = await aiService.getLuckyNumbers(selectedGame, analysisMode, selectedYear);
      setPrediction(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleLockClick = () => {
    setShowUpgradeModal(true);
  };

  // The Authenticator wrapper handles the UI when no user is signed in.
  // The component will only render when `user` is defined.

  return (
    <div className="bg-gray-900 min-h-screen text-white font-sans">
      <Header user={user} signOut={signOut} isPro={isProUser} />
      <main className="p-4 md:p-8 max-w-4xl mx-auto">
        <div className="flex bg-gray-800 rounded-lg p-1 mb-8">
          <button
            onClick={() => setViewMode('predictor')}
            className={`w-full p-2 rounded-md font-semibold transition duration-300 ${viewMode === 'predictor' ? 'bg-yellow-500 text-gray-900' : 'text-gray-300 hover:bg-gray-700'}`}
          >
            Number Predictor
          </button>
          <button
            onClick={() => setViewMode('analyzer')}
            className={`w-full p-2 rounded-md font-semibold transition duration-300 ${viewMode === 'analyzer' ? 'bg-yellow-500 text-gray-900' : 'text-gray-300 hover:bg-gray-700'}`}
          >
            Number Analyzer
          </button>
        </div>
        
        {viewMode === 'predictor' ? (
          <div>
            <GameSelector selectedGame={selectedGame} setSelectedGame={setSelectedGame} games={games} isProUser={isProUser} onLockClick={handleLockClick} />
            <AnalysisModeSelector analysisMode={analysisMode} setAnalysisMode={setAnalysisMode} isProUser={isProUser} onLockClick={handleLockClick} />
            {analysisMode === 'singleYear' && <YearSelector selectedYear={selectedYear} setSelectedYear={setSelectedYear} />}
            <button
              onClick={handleGetNumbers}
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold py-4 px-6 rounded-lg transition duration-300 text-xl disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? 'Thinking...' : 'Get Lucky Numbers'}
            </button>
            {error && <p className="text-red-400 text-center mt-4">{error}</p>}
            {isLoading && <div className="mt-8"><Loader text="Analyzing the Odds..." /></div>}
            {prediction && <PredictionDisplay prediction={prediction} year={selectedYear} mode={analysisMode} />}
          </div>
        ) : (
          <NumberAnalyzer 
              analyzeNumberService={aiService.analyzeSingleNumber} 
              isProUser={isProUser} 
              onLockClick={handleLockClick}
              game={selectedGame}
              mode={analysisMode}
              year={selectedYear}
            />
        )}

        {showUpgradeModal && <UpgradeModal 
            onUpgrade={() => {
                // In a real app, this would trigger a payment flow.
                setIsProUser(true);
                setShowUpgradeModal(false);
            }}
            onClose={() => setShowUpgradeModal(false)} 
        />}
      </main>
      <footer className="text-center p-4 text-gray-500 text-xs">
        © 2024 Naija Lotto Oracle. All rights reserved.
      </footer>
    </div>
  );
}