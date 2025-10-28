import React from 'react';
import { ProBadge } from './ProBadge';

// Define the expected props, including the user object from Amplify
interface HeaderProps {
    user: { username?: string };
    signOut?: () => void;
    isPro: boolean;
}

export const Header: React.FC<HeaderProps> = ({ user, signOut, isPro }) => {
    return (
        <header className="bg-gray-800 text-white p-4 flex justify-between items-center shadow-lg">
            <h1 className="text-xl md:text-2xl font-bold text-yellow-400">🎯 Naija Lotto Oracle</h1>
            {user && (
                <div className="flex items-center space-x-4">
                    <div className="text-right">
                        <p className="text-sm hidden sm:block">Welcome, {user.username}</p>
                         {isPro && <span className="text-xs text-yellow-400 font-bold">PRO Member</span>}
                    </div>
                    <button
                        onClick={signOut}
                        className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition duration-300"
                    >
                        Sign Out
                    </button>
                </div>
            )}
        </header>
    );
};