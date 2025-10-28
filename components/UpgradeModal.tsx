import React from 'react';

interface UpgradeModalProps {
    onUpgrade: () => void;
    onClose: () => void;
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({ onUpgrade, onClose }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-lg shadow-2xl max-w-md w-full p-8 border-2 border-yellow-400">
                <h2 className="text-3xl font-bold text-yellow-400 text-center mb-4">Unlock PRO Access!</h2>
                <p className="text-gray-300 text-center mb-6">Upgrade to PRO to unlock all features and get the ultimate winning edge.</p>
                <ul className="space-y-3 text-gray-200 mb-8">
                    <li className="flex items-center"><i className="fas fa-check-circle text-yellow-400 mr-3"></i>Access All Lotto Games</li>
                    <li className="flex items-center"><i className="fas fa-check-circle text-yellow-400 mr-3"></i>Enable "All Years" Analysis Mode</li>
                    <li className="flex items-center"><i className="fas fa-check-circle text-yellow-400 mr-3"></i>Use the Lucky Number Analyzer</li>
                    <li className="flex items-center"><i className="fas fa-check-circle text-yellow-400 mr-3"></i>Ad-Free Experience</li>
                </ul>
                <button
                    onClick={onUpgrade}
                    className="w-full bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold py-3 px-6 rounded-lg transition duration-300 text-lg"
                >
                    Upgrade Now for $4.99/month
                </button>
                <button
                    onClick={onClose}
                    className="w-full mt-3 text-gray-400 hover:text-white transition duration-300"
                >
                    Maybe Later
                </button>
            </div>
        </div>
    );
};
