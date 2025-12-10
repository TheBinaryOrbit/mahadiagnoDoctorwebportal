import React, { useState, useEffect } from 'react';
import axios from 'axios';
import baseUrl from '../utils/baseUrl';
import { useGetDoctor } from '../hooks/useGetDoctor';

const PaymentMethod = () => {
    const doctor = useGetDoctor();
    const [paymentDetails, setPaymentDetails] = useState(null);
    const [isFetching, setIsFetching] = useState(false);
    const [error, setError] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const [showAddForm, setShowAddForm] = useState(false);
    
    const [bankForm, setBankForm] = useState({
        bankName: '',
        accountNumber: '',
        ifscCode: '',
        bankeeName: ''
    });

    useEffect(() => {
        if (doctor?.id) {
            fetchPaymentDetails();
        }
    }, [doctor?.id]);

    const fetchPaymentDetails = async () => {
        setIsFetching(true);
        setError('');
        try {
            const res = await axios.get(`${baseUrl}/paymentmethod/get/doctor/${doctor.id}`);
            if (res.status === 200 || res.status === 201) {
                setPaymentDetails(res.data);
                setShowAddForm(false);
            } else {
                setPaymentDetails(null);
                setShowAddForm(true);
            }
        } catch (error) {
            if (error.response?.status === 404) {
                setPaymentDetails(null);
                setShowAddForm(true);
            } else {
                const errorMessage = error.response?.data?.error || error.message || 'Something went wrong';
                setError(errorMessage);
                window.alert(errorMessage);
            }
        } finally {
            setIsFetching(false);
        }
    };

    const handleAddPaymentMethod = async () => {
        // Validation
        if (!bankForm.bankName.trim() || !bankForm.accountNumber.trim() || !bankForm.ifscCode.trim() || !bankForm.bankeeName.trim()) {
            window.alert('Please fill all fields');
            return;
        }

        // Basic IFSC validation
        const ifscPattern = /^[A-Z]{4}[0][A-Z0-9]{6}$/;
        if (!ifscPattern.test(bankForm.ifscCode.toUpperCase())) {
            window.alert('Please enter a valid IFSC code');
            return;
        }

        // Account number validation
        if (!/^\d{9,18}$/.test(bankForm.accountNumber)) {
            window.alert('Please enter a valid account number (9-18 digits)');
            return;
        }

        setIsAdding(true);
        try {
            const paymentData = {
                doctorId: doctor.id,
                bankName: bankForm.bankName.trim(),
                accountNumber: bankForm.accountNumber.trim(),
                ifscCode: bankForm.ifscCode.trim().toUpperCase(),
                bankeeName: bankForm.bankeeName.trim()
            };

            const res = await axios.post(`${baseUrl}/paymentmethod/add`, paymentData);

            if (res.status === 200 || res.status === 201) {
                window.alert('Payment method added successfully');
                
                setBankForm({
                    bankName: '',
                    accountNumber: '',
                    ifscCode: '',
                    bankeeName: ''
                });
                
                fetchPaymentDetails();
            } else {
                window.alert('Failed to add payment method');
            }
        } catch (error) {
            const errorMessage = error.response?.data?.error || error.message || 'Failed to add payment method';
            window.alert(errorMessage);
        } finally {
            setIsAdding(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl">
                {isFetching ? (
                    // Loading state
                    <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#009e92] mx-auto"></div>
                        <p className="text-gray-500 mt-4">Loading payment details...</p>
                    </div>
                ) : error ? (
                    // Error state
                    <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
                        <svg className="mx-auto h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-red-500 mt-4">{error}</p>
                        <button 
                            className="mt-4 bg-[#009e92] text-white px-6 py-2 rounded-lg font-semibold hover:bg-[#018177] transition-colors"
                            onClick={fetchPaymentDetails}
                        >
                            Retry
                        </button>
                    </div>
                ) : paymentDetails ? (
                    // Show existing payment details
                    <div className="space-y-6">
                        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                            <div className="flex items-center mb-2">
                                <svg className="w-5 h-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                <p className="text-green-800 font-semibold">Payment Method Added</p>
                            </div>
                            <p className="text-green-700 text-sm">
                                Your bank details have been successfully added and verified.
                            </p>
                        </div>

                        {/* Bank Details Card */}
                        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                            <h2 className="text-xl font-bold text-gray-800 mb-6">Bank Details</h2>
                            
                            <div className="space-y-5">
                                <div className="flex items-start">
                                    <svg className="w-5 h-5 text-gray-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                    </svg>
                                    <div className="ml-4 flex-1">
                                        <p className="text-sm text-gray-500 mb-1">Bank Name</p>
                                        <p className="text-gray-800 font-medium text-lg">{paymentDetails.bankName}</p>
                                    </div>
                                </div>
                                
                                <div className="flex items-start">
                                    <svg className="w-5 h-5 text-gray-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                    </svg>
                                    <div className="ml-4 flex-1">
                                        <p className="text-sm text-gray-500 mb-1">Account Number</p>
                                        <p className="text-gray-800 font-medium text-lg font-mono">
                                            ****{paymentDetails.accountNumber.slice(-4)}
                                        </p>
                                    </div>
                                </div>
                                
                                <div className="flex items-start">
                                    <svg className="w-5 h-5 text-gray-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                                    </svg>
                                    <div className="ml-4 flex-1">
                                        <p className="text-sm text-gray-500 mb-1">IFSC Code</p>
                                        <p className="text-gray-800 font-medium text-lg font-mono">{paymentDetails.ifscCode}</p>
                                    </div>
                                </div>
                                
                                <div className="flex items-start">
                                    <svg className="w-5 h-5 text-gray-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    <div className="ml-4 flex-1">
                                        <p className="text-sm text-gray-500 mb-1">Account Holder Name</p>
                                        <p className="text-gray-800 font-medium text-lg">{paymentDetails.bankeeName}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Support Contact Card */}
                        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                            <div className="flex items-center mb-2">
                                <svg className="w-5 h-5 text-gray-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                                <p className="text-gray-700 font-semibold">Need to Update?</p>
                            </div>
                            <p className="text-gray-600 text-sm">
                                To change your bank details, please contact our support team at{' '}
                                <a href="mailto:support@mahadiagno.com" className="text-[#009e92] font-medium hover:underline">
                                    support@mahadiagno.com
                                </a>
                                . We'll help you update your information securely.
                            </p>
                        </div>
                    </div>
                ) : showAddForm ? (
                    // Show add payment form
                    <div className="space-y-6">
                        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                            <div className="flex items-center mb-2">
                                <svg className="w-5 h-5 text-yellow-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                <p className="text-yellow-800 font-semibold">Add Payment Method</p>
                            </div>
                            <p className="text-yellow-700 text-sm">
                                Please add your bank details to receive payments. This information can only be added once.
                            </p>
                        </div>

                        {/* Add Payment Form */}
                        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                            <h2 className="text-xl font-bold text-gray-800 mb-6">Bank Details</h2>
                            
                            <div className="space-y-5">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Bank Name *
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full border border-gray-300 px-4 py-3 rounded-xl text-gray-700 focus:outline-none focus:border-[#009e92] focus:ring-2 focus:ring-[#009e92]/20"
                                        placeholder="e.g. State Bank of India"
                                        value={bankForm.bankName}
                                        onChange={(e) => setBankForm({...bankForm, bankName: e.target.value})}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Account Number *
                                    </label>
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        className="w-full border border-gray-300 px-4 py-3 rounded-xl text-gray-700 focus:outline-none focus:border-[#009e92] focus:ring-2 focus:ring-[#009e92]/20 font-mono"
                                        placeholder="Enter account number"
                                        value={bankForm.accountNumber}
                                        onChange={(e) => setBankForm({...bankForm, accountNumber: e.target.value.replace(/[^0-9]/g, '')})}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        IFSC Code *
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full border border-gray-300 px-4 py-3 rounded-xl text-gray-700 focus:outline-none focus:border-[#009e92] focus:ring-2 focus:ring-[#009e92]/20 font-mono uppercase"
                                        placeholder="e.g. SBIN0001234"
                                        maxLength={11}
                                        value={bankForm.ifscCode}
                                        onChange={(e) => setBankForm({...bankForm, ifscCode: e.target.value.toUpperCase()})}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Account Holder Name *
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full border border-gray-300 px-4 py-3 rounded-xl text-gray-700 focus:outline-none focus:border-[#009e92] focus:ring-2 focus:ring-[#009e92]/20"
                                        placeholder="Enter account holder name"
                                        value={bankForm.bankeeName}
                                        onChange={(e) => setBankForm({...bankForm, bankeeName: e.target.value})}
                                    />
                                </div>
                            </div>

                            <button
                                className="w-full bg-[#009e92] text-white px-6 py-3 rounded-xl font-bold text-md mt-6 hover:bg-[#018177] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                onClick={handleAddPaymentMethod}
                                disabled={isAdding}
                            >
                                {isAdding ? (
                                    <div className="flex items-center justify-center">
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                        Adding...
                                    </div>
                                ) : (
                                    'Add Payment Method'
                                )}
                            </button>
                        </div>

                        {/* Security Note */}
                        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                            <div className="flex items-center mb-2">
                                <svg className="w-5 h-5 text-gray-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                                <p className="text-gray-700 font-semibold">Security Note</p>
                            </div>
                            <p className="text-gray-600 text-sm">
                                Your bank details are encrypted and stored securely. This information is only used for payment processing and can only be added once for security reasons.
                            </p>
                        </div>
                    </div>
                ) : null}
            </div>
        </div>
    );
};

export default PaymentMethod;
