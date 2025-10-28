import React, { useState } from 'react';

interface PaymentFormProps {
    isVisible: boolean;
    onClose: () => void;
    onPaymentSuccess: () => void;
}

const PaymentForm: React.FC<PaymentFormProps> = ({ isVisible, onClose, onPaymentSuccess }) => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState('');
    const [cardDetails, setCardDetails] = useState({
        number: '',
        expiry: '',
        cvc: ''
    });

    if (!isVisible) {
        return null;
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setCardDetails(prev => ({...prev, [name]: value}));
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!cardDetails.number || !cardDetails.expiry || !cardDetails.cvc) {
            setError('Please fill in all card details.');
            return;
        }
        setError('');
        setIsProcessing(true);
        // Mock payment processing
        setTimeout(() => {
            setIsProcessing(false);
            onPaymentSuccess();
        }, 2000);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-md w-full border border-yellow-500/50 transform transition-all duration-300 scale-100"
                 style={{ animation: 'zoomIn 0.3s ease-out' }}>
                <div className="text-center">
                    <i className="fas fa-credit-card text-5xl text-yellow-400 mb-4"></i>
                    <h2 className="text-3xl font-extrabold text-white mb-2">Upgrade to PRO</h2>
                    <p className="text-gray-300 mb-6">Secure payment for full access.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-gray-400 mb-1" htmlFor="card-number">Card Number</label>
                        <input
                            id="card-number"
                            name="number"
                            type="text"
                            value={cardDetails.number}
                            onChange={handleInputChange}
                            className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                            placeholder="•••• •••• •••• ••••"
                        />
                    </div>
                    <div className="flex gap-4">
                        <div className="w-1/2">
                            <label className="block text-gray-400 mb-1" htmlFor="expiry">Expiry (MM/YY)</label>
                            <input
                                id="expiry"
                                name="expiry"
                                type="text"
                                value={cardDetails.expiry}
                                onChange={handleInputChange}
                                className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                placeholder="MM/YY"
                            />
                        </div>
                        <div className="w-1/2">
                            <label className="block text-gray-400 mb-1" htmlFor="cvc">CVC</label>
                            <input
                                id="cvc"
                                name="cvc"
                                type="text"
                                value={cardDetails.cvc}
                                onChange={handleInputChange}
                                className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                placeholder="•••"
                            />
                        </div>
                    </div>

                    {error && <p className="text-red-400 text-sm">{error}</p>}

                    <button
                        type="submit"
                        disabled={isProcessing}
                        className="w-full px-6 py-3 bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 font-bold text-lg rounded-full shadow-lg transform hover:scale-105 transition-transform duration-300 disabled:opacity-50"
                    >
                        {isProcessing ? 'Processing...' : 'Pay $4.99'}
                    </button>
                </form>

                 <button onClick={onClose} className="w-full text-gray-400 hover:text-white transition-colors duration-200 py-2 mt-4 disabled:opacity-50" disabled={isProcessing}>
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

export default PaymentForm;
