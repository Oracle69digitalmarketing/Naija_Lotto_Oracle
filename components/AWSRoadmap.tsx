import React from 'react';

const AWSRoadmap: React.FC = () => {
    return (
        <div className="w-full max-w-2xl bg-gray-800 bg-opacity-50 backdrop-blur-sm rounded-2xl shadow-2xl p-6 sm:p-8 border border-blue-500/30 mt-16">
            <h2 className="text-2xl sm:text-3xl font-bold text-center text-blue-300 mb-6">
                <i className="fas fa-road mr-3"></i>
                The Oracle's Future Sight
            </h2>
            <p className="text-center text-gray-400 mb-8">
                We're constantly gazing into the future to bring you more powerful features. Here's what's on the horizon:
            </p>
            <ul className="space-y-4 text-lg text-gray-200">
                <li className="flex items-start p-3 bg-gray-700/50 rounded-lg">
                    <i className="fas fa-satellite-dish text-blue-400 mr-4 mt-1"></i>
                    <div>
                        <h3 className="font-bold">Live Draw Tracking & Alerts</h3>
                        <p className="text-sm text-gray-400">Get real-time notifications as draws happen and see how your numbers performed instantly.</p>
                    </div>
                </li>
                <li className="flex items-start p-3 bg-gray-700/50 rounded-lg">
                    <i className="fas fa-users text-blue-400 mr-4 mt-1"></i>
                    <div>
                        <h3 className="font-bold">Community Syndicate Play</h3>
                        <p className="text-sm text-gray-400">Pool your numbers with other Oracle users to increase your chances of winning big prizes.</p>
                    </div>
                </li>
                <li className="flex items-start p-3 bg-gray-700/50 rounded-lg">
                    <i className="fas fa-moon text-blue-400 mr-4 mt-1"></i>
                    <div>
                        <h3 className="font-bold">Personalized Number Astrology</h3>
                        <p className="text-sm text-gray-400">Combine the power of AI with celestial alignments to find numbers that are truly yours.</p>
                    </div>
                </li>
            </ul>
        </div>
    );
};

export default AWSRoadmap;
