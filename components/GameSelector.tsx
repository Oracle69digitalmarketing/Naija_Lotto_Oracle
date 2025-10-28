import React from 'react';
import { ProBadge } from './ProBadge';

interface Game {
    name: string;
    isPro: boolean;
}

interface GameSelectorProps {
    selectedGame: string;
    setSelectedGame: (game: string) => void;
    games: Game[];
    isProUser: boolean;
    onLockClick: () => void;
}

export const GameSelector: React.FC<GameSelectorProps> = ({ selectedGame, setSelectedGame, games, isProUser, onLockClick }) => {
    return (
        <div className="mb-6">
            <h2 className="text-xl font-semibold text-yellow-300 mb-3 text-center">Select a Game</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {games.map(game => {
                    const isLocked = game.isPro && !isProUser;
                    return (
                        <button
                            key={game.name}
                            onClick={() => (isLocked ? onLockClick() : setSelectedGame(game.name))}
                            disabled={selectedGame === game.name && !isLocked}
                            className={`p-3 rounded-lg font-semibold transition duration-300 flex items-center justify-center relative ${
                                selectedGame === game.name && !isLocked
                                    ? 'bg-yellow-500 text-gray-900 ring-2 ring-yellow-300'
                                    : 'bg-gray-700 hover:bg-gray-600 text-white'
                            } ${isLocked ? 'cursor-not-allowed opacity-60' : ''}`}
                        >
                            {game.name}
                            {isLocked && <ProBadge />}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};