import React, { useEffect, useState } from 'react';
import axios from 'axios';
import baseUrl from '../utils/baseUrl';
import { useGetDoctor } from '../hooks/useGetDoctor';

const Wallet = () => {
    const doctor = useGetDoctor();
    const [amount, setAmount] = useState(0);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [showWithdrawModal, setShowWithdrawModal] = useState(false);
    const [withdrawAmount, setWithdrawAmount] = useState('');

    const fetchWalletData = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${baseUrl}/doctor/get/wallet/${doctor.id}`);
            console.log('Wallet data:', res.data);
            setAmount(res.data.amount || 0);
            setHistory(res.data.history || []);
        } catch (error) {
            console.error('Error fetching wallet data:', error);
            window.alert('Failed to fetch wallet data');
        } finally {
            setLoading(false);
        }
    };

    const handleWithdrawal = () => {
        if (amount <= 0) {
            window.alert('Insufficient balance for withdrawal');
            return;
        }
        setShowWithdrawModal(true);
    };

    const processWithdrawal = async () => {
        const withdrawAmountNum = parseInt(withdrawAmount);

        if (!withdrawAmount || withdrawAmountNum <= 0 || isNaN(withdrawAmountNum)) {
            window.alert('Please enter a valid withdrawal amount');
            return;
        }

        if (withdrawAmountNum > amount) {
            window.alert('Withdrawal amount cannot exceed available balance');
            return;
        }

        setLoading(true);
        try {
            const withdrawalData = {
                doctorId: doctor.id,
                amount: withdrawAmountNum
            };

            const res = await axios.post(`${baseUrl}/withdraw/add`, withdrawalData);

            if (res.status === 201 || res.status === 200) {
                window.alert('Withdrawal request submitted successfully');
                setShowWithdrawModal(false);
                setWithdrawAmount('');
                fetchWalletData();
            } else {
                window.alert('Failed to submit withdrawal request');
            }
        } catch (error) {
            console.error('Error processing withdrawal:', error);
            window.alert('Failed to process withdrawal request');
        } finally {
            setLoading(false);
        }
    };

    const handleWithdrawAmountChange = (text) => {
        const numericText = text.replace(/[^0-9]/g, '');
        setWithdrawAmount(numericText);
    };

    const handleQuickAmount = (quickAmount) => {
        setWithdrawAmount(quickAmount.toString());
    };

    const closeModal = () => {
        setShowWithdrawModal(false);
        setWithdrawAmount('');
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchWalletData();
        setRefreshing(false);
    };

    useEffect(() => {
        if (doctor?.id) {
            fetchWalletData();
        }
    }, [doctor?.id]);

    const getStatusBadge = (status) => {
        switch (status?.toUpperCase()) {
            case 'SUCCESS':
                return {
                    bgColor: 'bg-emerald-100',
                    textColor: 'text-emerald-700',
                    dotColor: 'bg-emerald-500'
                };
            case 'PENDING':
                return {
                    bgColor: 'bg-amber-100',
                    textColor: 'text-amber-700',
                    dotColor: 'bg-amber-500'
                };
            case 'REJECTED':
                return {
                    bgColor: 'bg-red-100',
                    textColor: 'text-red-700',
                    dotColor: 'bg-red-500'
                };
            default:
                return {
                    bgColor: 'bg-gray-100',
                    textColor: 'text-gray-700',
                    dotColor: 'bg-gray-500'
                };
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="max-w-7xl mx-auto">
                {/* Balance Card */}
                <div className="bg-gradient-to-r from-[#009e92] to-[#00c9b7] rounded-2xl p-6 text-white shadow-lg mb-6">
                    <p className="text-sm opacity-90 mb-2">Available Balance</p>
                    <h2 className="text-4xl font-bold mb-4">₹{amount.toLocaleString('en-IN')}</h2>
                    <div className="flex gap-3">
                        <button
                            onClick={handleWithdrawal}
                            disabled={loading || amount <= 0}
                            className="bg-white text-[#009e92] px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Withdraw
                        </button>
                        <button
                            onClick={onRefresh}
                            disabled={refreshing}
                            className="bg-white/20 backdrop-blur-sm text-white px-6 py-2 rounded-lg font-semibold hover:bg-white/30 transition-colors disabled:opacity-50"
                        >
                            {refreshing ? 'Refreshing...' : 'Refresh'}
                        </button>
                    </div>
                </div>

                {/* Transaction History */}
                <div className="bg-white rounded-2xl shadow-sm p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Transaction History</h3>
                    
                    {loading && history.length === 0 ? (
                        <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#009e92] mx-auto"></div>
                            <p className="text-gray-500 mt-4">Loading...</p>
                        </div>
                    ) : history.length === 0 ? (
                        <div className="text-center py-12">
                            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                            </svg>
                            <p className="text-gray-500 mt-4">No transactions yet</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {history.map((item, index) => {
                                const badge = getStatusBadge(item.status);
                                return (
                                    <div key={index} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <p className="font-semibold text-gray-800">
                                                    {item.type === 'withdrawal' ? 'Withdrawal' : 'Credit'}
                                                </p>
                                                <p className="text-sm text-gray-500">{formatDate(item.createdAt)}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className={`text-lg font-bold ${item.type === 'withdrawal' ? 'text-red-600' : 'text-green-600'}`}>
                                                    {item.type === 'withdrawal' ? '-' : '+'}₹{item.amount.toLocaleString('en-IN')}
                                                </p>
                                                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${badge.bgColor} ${badge.textColor}`}>
                                                    <span className={`w-2 h-2 rounded-full ${badge.dotColor}`}></span>
                                                    {item.status}
                                                </span>
                                            </div>
                                        </div>
                                        {item.note && (
                                            <p className="text-sm text-gray-600 mt-2">{item.note}</p>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Withdrawal Modal */}
            {showWithdrawModal && (
                <div className="fixed inset-0 bg-black/30 bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-gray-800">Withdraw Funds</h3>
                            <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="mb-4">
                            <p className="text-sm text-gray-600 mb-2">Available Balance</p>
                            <p className="text-2xl font-bold text-[#009e92]">₹{amount.toLocaleString('en-IN')}</p>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Withdrawal Amount
                            </label>
                            <input
                                type="text"
                                inputMode="numeric"
                                value={withdrawAmount}
                                onChange={(e) => handleWithdrawAmountChange(e.target.value)}
                                placeholder="Enter amount"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#009e92] text-lg"
                            />
                        </div>

                        <div className="mb-6">
                            <p className="text-sm text-gray-600 mb-2">Quick Select</p>
                            <div className="grid grid-cols-3 gap-2">
                                {[1000, 5000, 10000].map((quickAmt) => (
                                    <button
                                        key={quickAmt}
                                        onClick={() => handleQuickAmount(quickAmt)}
                                        disabled={quickAmt > amount}
                                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-gray-700"
                                    >
                                        ₹{quickAmt.toLocaleString('en-IN')}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={closeModal}
                                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={processWithdrawal}
                                disabled={loading}
                                className="flex-1 px-4 py-3 bg-[#009e92] text-white rounded-lg font-semibold hover:bg-[#018177] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Processing...' : 'Confirm'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Wallet;
