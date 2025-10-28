import React, { useState } from 'react';

interface LoginModalProps {
    isVisible: boolean;
    onClose: () => void;
    onLoginSuccess: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isVisible, onClose, onLoginSuccess }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    if (!isVisible) {
        return null;
    }

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) {
            setError('Please enter both email and password.');
            return;
        }
        // Mock login success
        setError('');
        onLoginSuccess();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-sm w-full border border-green-500/50 transform transition-all duration-300 scale-100"
                 style={{ animation: 'zoomIn 0.3s ease-out' }}>
                <div className="text-center">
                    <i className="fas fa-user-circle text-5xl text-green-400 mb-4"></i>
                    <h2 className="text-3xl font-extrabold text-white mb-2">Login</h2>
                    <p className="text-gray-300 mb-6">Access your account or create a new one.</p>
                </div>
                
                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-gray-400 mb-1" htmlFor="email">Email</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500"
                            placeholder="you@example.com"
                        />
                    </div>
                     <div>
                        <label className="block text-gray-400 mb-1" htmlFor="password">Password</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500"
                            placeholder="••••••••"
                        />
                    </div>

                    {error && <p className="text-red-400 text-sm">{error}</p>}

                    <button
                        type="submit"
                        className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-teal-500 text-white font-bold text-lg rounded-full shadow-lg transform hover:scale-105 transition-transform duration-300"
                    >
                        Login / Sign Up
                    </button>
                </form>

                <button onClick={onClose} className="w-full text-gray-400 hover:text-white transition-colors duration-200 py-2 mt-4">
                    Cancel
                </button>
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

export default LoginModal;
