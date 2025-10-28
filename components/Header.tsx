import React from 'react';
import { AuthUser } from 'aws-amplify/auth';

interface HeaderProps {
    user?: AuthUser;
    onLogoutClick?: () => void;
    isProUser: boolean;
    trialUsesLeft: number;
}

const Header: React.FC<HeaderProps> = ({ user, onLogoutClick, isProUser, trialUsesLeft }) => {
    return (
        <header className="w-full flex justify-between items-center">
            <div className="w-48 text-left">
                 {user && !isProUser && (
                    <div className="bg-gray-700 text-yellow-300 text-sm font-bold p-2 rounded-lg shadow-md">
                        Trial Uses Left: {trialUsesLeft}
                    </div>
                )}
            </div>
            <div className="text-center">
                <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-500">
                    <i className="fas fa-star-of-life mr-3"></i>
                    Naija Lotto Oracle
                </h1>
                <p className="mt-2 text-lg text-green-300">Your AI-powered guide to lucky numbers</p>
            </div>
            <div className="w-48 text-right flex flex-col items-end gap-2">
                {user && (
                    <>
                        <span className="text-sm text-gray-400 truncate" title={user.signInDetails?.loginId}>{user.signInDetails?.loginId}</span>
                        <button onClick={onLogoutClick} className="px-4 py-2 bg-gray-700 text-white font-bold rounded-full hover:bg-gray-600 transition-colors text-sm">
                            Logout
                        </button>
                    </>
                )}
            </div>
        </header>
    );
};

export default Header;
