import React from 'react';
import ProBadge from './ProBadge';

interface GameSelectorProps {
    games: string[];
    selectedGame: string;
    onSelectGame: (game: string) => void;
    isProUser: boolean;
}

const GameSelector: React.FC<GameSelectorProps> = ({ games, selectedGame, onSelectGame, isProUser }) => {
    return (
        <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-8">
            {games.map((game, index) => {
                const isProGame = index > 0; // The first game is free
                const isLocked = isProGame && !isProUser;

                return (
                    <button
                        key={game}
                        onClick={() => onSelectGame(game)}
                        disabled={isLocked}
                        className={`relative px-4 py-2 text-sm sm:text-base font-semibold rounded-full transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 ${
                            selectedGame === game
                                ? 'bg-green-500 text-white shadow-lg ring-2 ring-green-400'
                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        } ${isLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {game}
                        {isLocked && <div className="absolute -top-2 -right-2"><ProBadge /></div>}
                    </button>
                );
            })}
        </div>
    );
};

export default GameSelector;