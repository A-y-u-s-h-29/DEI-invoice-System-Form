import React, { useState } from 'react';
import axios from 'axios';
import LoadingSpinner from './LoadingSpinner';

const OrderSearch = () => {
    const [orderId, setOrderId] = useState('');
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSearch = async () => {
        if (!orderId.trim()) {
            setError('Please enter an order ID');
            return;
        }

        try {
            setLoading(true);
            setError('');
            setOrder(null);

            const res = await axios.get(`http://localhost:3000/api/orders/${orderId}`);
            setOrder(res.data.data);
        } catch (err) {
            setError('Order not found. Please check the order ID and try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-8 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-6">
                        <h2 className="text-3xl font-bold text-white">Search Order</h2>
                        <p className="text-purple-100 mt-2">Enter the order ID to view invoice details</p>
                    </div>

                    {/* Search Section */}
                    <div className="p-8">
                        <div className="relative">
                            <div className="flex flex-col sm:flex-row gap-4">
                                <div className="flex-1 relative">
                                    <input
                                        placeholder="Enter Order ID (e.g., ORD-2024-001)"
                                        value={orderId}
                                        onChange={(e) => {
                                            setOrderId(e.target.value);
                                            setError('');
                                        }}
                                        onKeyPress={handleKeyPress}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200 pl-10"
                                    />
                                    <svg className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                                <button
                                    onClick={handleSearch}
                                    disabled={loading}
                                    className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transform transition-all duration-200 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? <LoadingSpinner /> : 'Search'}
                                </button>
                            </div>
                            {error && (
                                <p className="mt-2 text-sm text-red-600 flex items-center">
                                    <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    {error}
                                </p>
                            )}
                        </div>

                        {/* Loading State */}
                        {loading && (
                            <div className="mt-8 text-center">
                                <LoadingSpinner />
                                <p className="mt-2 text-gray-600">Searching for order...</p>
                            </div>
                        )}

                        {/* Order Details */}
                        {order && !loading && (
                            <div className="mt-8 border-t border-gray-200 pt-8">
                                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-2xl font-bold text-gray-800">Invoice Details</h3>
                                        <span className="bg-green-100 text-green-800 px-4 py-1 rounded-full text-sm font-semibold">
                                            Active
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                            <DetailItem label="Order Number" value={order.orderNumber} icon="📋" />
                                            <DetailItem label="Business Name" value={order.businessName} icon="🏢" />
                                            <DetailItem label="Contact Person" value={order.contactPerson} icon="👤" />
                                            <DetailItem label="Phone" value={order.phoneMobile} icon="📱" />
                                        </div>
                                        <div className="space-y-4">
                                            <DetailItem label="Email" value={order.email} icon="📧" />
                                            <DetailItem label="Amount" value={`₹${order.amount}`} icon="💰" highlight />
                                            <DetailItem label="Date" value={new Date(order.date).toLocaleDateString('en-IN', { 
                                                year: 'numeric', 
                                                month: 'long', 
                                                day: 'numeric' 
                                            })} icon="📅" />
                                            <DetailItem label="Subscription" value={order.subscriptionService} icon="⭐" />
                                        </div>
                                    </div>

                                    {order.address && (
                                        <div className="mt-6 p-4 bg-white rounded-lg border border-gray-200">
                                            <p className="text-sm text-gray-500 mb-1">📍 Address</p>
                                            <p className="text-gray-800">{order.address}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Action Buttons */}
                                <div className="mt-6 flex gap-4 justify-end">
                                    <button className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition duration-200">
                                        Print Invoice
                                    </button>
                                    <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition duration-200">
                                        Download PDF
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Empty State */}
                        {!order && !loading && !error && (
                            <div className="mt-8 text-center py-12">
                                <div className="text-6xl mb-4">🔍</div>
                                <h3 className="text-xl font-semibold text-gray-700 mb-2">No Order Selected</h3>
                                <p className="text-gray-500">Enter an order ID above to view the invoice details</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// Helper component for detail items
const DetailItem = ({ label, value, icon, highlight }) => (
    <div className="flex items-start">
        <span className="text-xl mr-3">{icon}</span>
        <div>
            <p className="text-sm text-gray-500">{label}</p>
            <p className={`font-medium ${highlight ? 'text-2xl text-green-600 font-bold' : 'text-gray-800'}`}>
                {value}
            </p>
        </div>
    </div>
);

export default OrderSearch;