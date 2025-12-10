import React, { useState, useEffect } from 'react';
import { useGetDoctor } from '../hooks/useGetDoctor';
import axios from 'axios';
import baseUrl from '../utils/baseUrl';
import { useNavigate } from 'react-router-dom';
import { User, Clock, Wallet, DollarSign } from 'lucide-react';
// Sample data for quick actions
const quickActions = [
    { id: 1, name: 'Profile', icon: User, color: '#3B82F6', route: '/profile' },
    { id: 2, name: 'Slots', icon: Clock, color: '#10B981', route: '/slots' },
    { id: 3, name: 'Wallet', icon: Wallet, color: '#F59E0B', route: '/wallet' },
    { id: 4, name: 'Payment', icon: DollarSign, color: '#8B5CF6', route: '/payment-method' },
];

const Dashboard = () => {
    const doctor = useGetDoctor();
    const navigate = useNavigate();
    const [profileData, setProfileData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (doctor?.id) {
            fetchProfileStatus();
        }
    }, [doctor?.id]);

    const fetchProfileStatus = async () => {
        setIsLoading(true);
        setError('');
        try {
            const res = await axios.get(`${baseUrl}/doctor/checkprofile/${doctor.id}`);
            if (res.status === 200 || res.status === 201) {
                setProfileData(res.data);
            } else {
                setError('Failed to fetch profile status');
            }
        } catch (error) {
            const errorMessage = error.response?.data?.error || error.message || 'Something went wrong';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const renderProfileChecks = () => {
        if (!profileData?.profileChecks) return null;

        const { isVerified, isEducationAdded, isExperienceAdded, isPaymentMethodAdded } = profileData.profileChecks;

        return (
            <div className="space-y-3">
                {/* Verification Status */}
                {!isVerified && (
                    <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl">
                        <div className="flex items-center">
                            <svg className="w-4 h-4 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                            </svg>
                            <span className="text-yellow-800 font-semibold ml-2">Verification Pending</span>
                        </div>
                        <p className="text-yellow-700 text-sm mt-1">
                            Your account verification is pending. You'll be notified once approved.
                        </p>
                    </div>
                )}

                {/* Education Status */}
                {!isEducationAdded && (
                    <button
                        className="w-full bg-blue-50 border border-blue-200 p-4 rounded-xl hover:bg-blue-100 transition-colors text-left"
                        onClick={() => navigate('/profile')}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center flex-1">
                                <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                                </svg>
                                <div className="ml-3 flex-1">
                                    <p className="text-blue-800 font-semibold">Add Education Details</p>
                                    <p className="text-blue-600 text-sm">Complete your profile by adding education</p>
                                </div>
                            </div>
                            <svg className="w-3 h-3 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                            </svg>
                        </div>
                    </button>
                )}

                {/* Experience Status */}
                {!isExperienceAdded && (
                    <button
                        className="w-full bg-green-50 border border-green-200 p-4 rounded-xl hover:bg-green-100 transition-colors text-left"
                        onClick={() => navigate('/profile')}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center flex-1">
                                <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
                                    <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
                                </svg>
                                <div className="ml-3 flex-1">
                                    <p className="text-green-800 font-semibold">Add Experience Details</p>
                                    <p className="text-green-600 text-sm">Add your professional experience</p>
                                </div>
                            </div>
                            <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                            </svg>
                        </div>
                    </button>
                )}

                {/* Payment Method Status */}
                {!isPaymentMethodAdded && (
                    <button
                        className="w-full bg-purple-50 border border-purple-200 p-4 rounded-xl hover:bg-purple-100 transition-colors text-left"
                        onClick={() => navigate('/payment-method')}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center flex-1">
                                <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                                    <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
                                </svg>
                                <div className="ml-3 flex-1">
                                    <p className="text-purple-800 font-semibold">Add Payment Method</p>
                                    <p className="text-purple-600 text-sm">Add bank details to receive payments</p>
                                </div>
                            </div>
                            <svg className="w-3 h-3 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                            </svg>
                        </div>
                    </button>
                )}
            </div>
        );
    };

    const renderTimingStatus = () => {
        if (!profileData?.timings) return null;

        const availableDays = profileData.timings.filter(timing => timing.isAvailable);
        const daysNeedingSlots = availableDays.filter(timing => timing.slotsCount === 0 || timing.fee === 0);

        if (daysNeedingSlots.length === 0) return null;

        return (
            <div className="space-y-3">
                <p className="text-base font-semibold text-gray-800">Schedule Setup Required</p>
                {daysNeedingSlots.map((timing, index) => (
                    <button
                        key={index}
                        className="w-full bg-orange-50 border border-orange-200 p-4 rounded-xl hover:bg-orange-100 transition-colors text-left"
                        onClick={() => navigate('/slots')}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center flex-1">
                                <svg className="w-4 h-4 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                                </svg>
                                <div className="ml-3 flex-1">
                                    <p className="text-orange-800 font-semibold">{timing.day}</p>
                                    <p className="text-orange-600 text-sm">
                                        {timing.slotsCount === 0 && timing.fee === 0
                                            ? 'Add slots and set consultation fee'
                                            : timing.slotsCount === 0
                                                ? 'Add time slots'
                                                : 'Set consultation fee'
                                        }
                                    </p>
                                </div>
                            </div>
                            <svg className="w-3 h-3 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                            </svg>
                        </div>
                    </button>
                ))}
            </div>
        );
    };

    return (
        <div className="flex-1 bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto px-5 py-6">
                {/* Quick Actions */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Quick Actions</h2>
                            <p className="text-gray-600 text-sm mt-1">Access frequently used features</p>
                        </div>
                        <div className="hidden md:block">
                            <span className="text-xs font-medium text-[#009e92] bg-[#009e92]/10 px-3 py-1.5 rounded-full">
                                {quickActions.length} actions
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {quickActions.map((action) => {
                            
                            return (
                                <button
                                    key={action.id}
                                    onClick={() => navigate(action.route)}
                                    className="group relative bg-white rounded-2xl p-6 border border-gray-200 hover:border-[#009e92]/30 hover:shadow-lg transition-all duration-300 overflow-hidden"
                                >
                                    
                                    <div className="absolute inset-0 bg-gradient-to-br from-white to-gray-50 group-hover:from-[#009e92]/5 group-hover:to-[#66C9C1]/5 transition-all duration-300"></div>

                                    
                                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#009e92] to-[#66C9C1] transform -translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>

                                    <div className="relative z-10">
                                        
                                        <div className={`relative w-14 h-14 mb-4 rounded-xl flex items-center justify-center ${action.gradient || 'bg-gradient-to-br from-[#009e92] to-[#66C9C1]'} shadow-md group-hover:shadow-lg transition-shadow duration-300`}>
                                            <action.icon className="text-white" size={24} />
                                            
                                            
                                            {action.notificationCount && (
                                                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                                                    {action.notificationCount}
                                                </span>
                                            )}
                                        </div>

                                        <div className="text-left">
                                            <p className="text-base font-semibold text-gray-900 group-hover:text-[#009e92] transition-colors duration-200">
                                                {action.name}
                                            </p>
                                            <p className="text-sm text-gray-500 mt-1 group-hover:text-gray-600 transition-colors duration-200">
                                                {action.description || `Manage ${action.name.toLowerCase()}`}
                                            </p>
                                        </div>

                                        <div className="absolute right-4 bottom-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 -translate-x-2 transition-all duration-300">
                                            <svg className="w-5 h-5 text-[#009e92]" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Profile Status */}
                <div className="mt-6 mb-8">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold text-gray-900">Profile Status</h2>
                        <button onClick={fetchProfileStatus} className="hover:opacity-70 transition-opacity">
                            <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </div>

                    {isLoading ? (
                        <div className="bg-white rounded-xl shadow-sm p-8 flex flex-col items-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#009e92]"></div>
                            <p className="text-gray-500 mt-2">Loading profile status...</p>
                        </div>
                    ) : error ? (
                        <div className="bg-white rounded-xl shadow-sm p-4">
                            <div className="flex flex-col items-center">
                                <svg className="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                <p className="text-red-500 mt-2 text-center">{error}</p>
                                <button
                                    className="mt-3 bg-[#009e92] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[#018177] transition-colors"
                                    onClick={fetchProfileStatus}
                                >
                                    Retry
                                </button>
                            </div>
                        </div>
                    ) : profileData ? (
                        <div className="space-y-4">
                            {/* Profile Completion Cards */}
                            {renderProfileChecks()}

                            {/* Timing Setup Cards */}
                            {profileData.timings && renderTimingStatus()}

                            {/* All Complete Message */}
                            {profileData.profileChecks?.isVerified &&
                                profileData.profileChecks?.isEducationAdded &&
                                profileData.profileChecks?.isExperienceAdded &&
                                profileData.profileChecks?.isPaymentMethodAdded &&
                                (!profileData.timings || profileData.timings.filter(t => t.isAvailable && (t.slotsCount === 0 || t.fee === 0)).length === 0) && (
                                    <div className="bg-green-50 border border-green-200 p-4 rounded-xl">
                                        <div className="flex items-center">
                                            <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                            <span className="text-green-800 font-semibold ml-2">Profile Complete!</span>
                                        </div>
                                        <p className="text-green-600 text-sm mt-1">
                                            Your profile is complete and ready to receive appointments.
                                        </p>
                                    </div>
                                )}
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;