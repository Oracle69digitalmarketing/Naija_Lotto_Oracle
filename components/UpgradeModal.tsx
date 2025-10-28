import React from 'react';

interface UpgradeModalProps {
    isVisible: boolean;
    onClose: () => void;
    onUpgrade: () => void;
    isTrialOver: boolean;
}

const UpgradeModal: React.FC<UpgradeModalProps> = ({ isVisible, onClose, onUpgrade, isTrialOver }) => {
    if (!isVisible) {
        return null;
    }
    
    let title = "Go PRO!";
    let subtitle = "Unlock the full power of the Naija Lotto Oracle.";

    if (isTrialOver) {
        title = "Your Free Trial Has Ended";
        subtitle = "Upgrade to continue getting expert predictions and analysis.";
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-md w-full border border-yellow-500/50 transform transition-all duration-300 scale-100"
                 style={{ animation: 'zoomIn 0.3s ease-out' }}>
                <div className="text-center">
                    <i className="fas fa-rocket text-5xl text-yellow-400 mb-4"></i>
                    <h2 className="text-3xl font-extrabold text-white mb-2">{title}</h2>
                    <p className="text-gray-300 mb-6">{subtitle}</p>
                </div>
                <ul className="space-y-3 text-lg text-gray-200 mb-8">
                    <li className="flex items-center">
                        <i className="fas fa-check-circle text-green-400 mr-3"></i>
                        <span>Analyze <span className="font-bold">All Lotto Games</span></span>
                    </li>
                    <li className="flex items-center">
                        <i className="fas fa-check-circle text-green-400 mr-3"></i>
                        <span>Unlock <span className="font-bold">"All-Time"</span> Data Analysis</span>
                    </li>
                    <li className="flex items-center">
                        <i className="fas fa-check-circle text-green-400 mr-3"></i>
                        <span>Access the Personal <span className="font-bold">Lucky Number Analyzer</span></span>
                    </li>
                     <li className="flex items-center">
                        <i className="fas fa-check-circle text-green-400 mr-3"></i>
                        <span>Get an <span className="font-bold">Ad-Free</span> Experience</span>
                    </li>
                </ul>
                <div className="text-center text-gray-400 text-sm mb-4">
                    Billed monthly. Cancel anytime.
                </div>
                <div className="flex flex-col gap-3">
                     <button
                        onClick={onUpgrade}
                        className="w-full px-6 py-4 bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 font-bold text-lg rounded-full shadow-lg transform hover:scale-105 transition-transform duration-300"
                    >
                        Upgrade Now - $4.99 / Month
                    </button>
                    <button onClick={onClose} className="w-full text-gray-400 hover:text-white transition-colors duration-200 py-2">
                        Maybe Later
                    </button>
                </div>
            </div>
             <style>
                {`
                @keyframes zoomIn {
                    from { transform: scale(0.9); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
                `}
            </style>
        </div>
    );
};

export default UpgradeModal;
