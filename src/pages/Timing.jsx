import React, { useState, useEffect } from 'react';
import axios from 'axios';
import baseUrl from '../utils/baseUrl';
import { useGetDoctor } from '../hooks/useGetDoctor';

const Timing = () => {
    const doctor = useGetDoctor();
    const [timings, setTimings] = useState([]);
    const [isFetching, setIsFetching] = useState(false);
    const [error, setError] = useState('');
    const [isModalVisible, setModalVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedTiming, setSelectedTiming] = useState(null);
    const [updatedTiming, setUpdatedTiming] = useState({
        day: '',
        startTime: '',
        endTime: '',
        isAvailable: true,
        fee: 0
    });

    useEffect(() => {
        if (doctor?.id) {
            fetchTimings();
        }
    }, [doctor?.id]);

    const fetchTimings = async () => {
        setIsFetching(true);
        setError('');
        try {
            const res = await axios.get(`${baseUrl}/timing/get/${doctor.id}`);
            if (res.status === 200 || res.status === 201) {
                const timingData = res.data || [];
                const validTimings = Array.isArray(timingData) ? timingData : [];
                setTimings(validTimings);
            } else {
                setError('Failed to fetch timings');
                window.alert('Failed to fetch timings');
            }
        } catch (error) {
            const errorMessage = error.response?.data?.error || error.message || 'Something went wrong';
            setError(errorMessage);
            window.alert(errorMessage);
            setTimings([]);
        } finally {
            setIsFetching(false);
        }
    };

    const handleUpdateTiming = async () => {
        setIsLoading(true);

        if (updatedTiming.isAvailable) {
            if (!updatedTiming.startTime.trim() || !updatedTiming.endTime.trim()) {
                window.alert('Please fill start and end time for available days');
                setIsLoading(false);
                return;
            }
        }

        try {
            const timingData = {
                day: updatedTiming.day,
                isAvailable: updatedTiming.isAvailable,
                fee: parseFloat(updatedTiming.fee) || 0
            };

            if (updatedTiming.isAvailable) {
                timingData.startTime = updatedTiming.startTime;
                timingData.endTime = updatedTiming.endTime;
            }

            const res = await axios.put(`${baseUrl}/timing/update/${doctor.id}`, timingData);

            if (res.status === 200 || res.status === 201) {
                window.alert('Timing updated successfully');

                setTimings(prevTimings =>
                    prevTimings.map(timing =>
                        timing.id === selectedTiming.id
                            ? { ...timing, ...timingData }
                            : timing
                    )
                );

                setModalVisible(false);
                setSelectedTiming(null);
            } else {
                window.alert('Failed to update timing');
            }
        } catch (error) {
            const errorMessage = error.response?.data?.error || error.message || 'Failed to update timing';
            window.alert(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const openUpdateModal = (timing) => {
        setSelectedTiming(timing);
        setUpdatedTiming({
            day: timing.day,
            startTime: timing.startTime || '',
            endTime: timing.endTime || '',
            isAvailable: timing.isAvailable,
            fee: timing.fee || 0
        });
        setModalVisible(true);
    };

    const sortDays = (data) => {
        const dayOrder = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
        return data.sort((a, b) => {
            return dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day);
        });
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Content Area */}
            <div className="max-w-7xl">
                {isFetching ? (
                    <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#009e92] mx-auto"></div>
                        <p className="text-gray-500 mt-4">Loading schedules...</p>
                    </div>
                ) : error ? (
                    <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
                        <svg className="mx-auto h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-red-500 mt-4">{error}</p>
                        <button 
                            className="mt-4 bg-[#009e92] text-white px-6 py-2 rounded-lg font-semibold hover:bg-[#018177] transition-colors"
                            onClick={fetchTimings}
                        >
                            Retry
                        </button>
                    </div>
                ) : !timings || timings.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="text-gray-500 mt-4">No schedules found</p>
                        <p className="text-gray-400 mt-2">Contact support to set up your schedule</p>
                    </div>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {sortDays(timings).map((timing, index) => (
                            <div
                                key={timing.id || `timing-${index}`}
                                className={`p-5 rounded-xl border-2 shadow-sm transition-all hover:shadow-md ${
                                    timing.isAvailable
                                        ? 'bg-green-50 border-green-200'
                                        : 'bg-gray-50 border-gray-200'
                                }`}
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-800 mb-2">
                                            {timing.day}
                                        </h3>
                                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                                            timing.isAvailable
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-gray-100 text-gray-600'
                                        }`}>
                                            {timing.isAvailable ? 'Available' : 'Not Available'}
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => openUpdateModal(timing)}
                                        className="bg-[#009e92] p-2.5 rounded-full hover:bg-[#018177] transition-colors"
                                    >
                                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                    </button>
                                </div>

                                {timing.isAvailable ? (
                                    <div className="space-y-2 mt-4">
                                        <div className="flex items-center text-gray-700">
                                            <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <span className="text-sm font-medium">
                                                {timing.startTime} - {timing.endTime}
                                            </span>
                                        </div>
                                        <div className="flex items-center text-gray-700">
                                            <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <span className="text-sm font-medium">
                                                Fee: ₹{timing.fee || 0}
                                            </span>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-gray-500 text-sm mt-4">
                                        Day off - No appointments available
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Update Modal */}
            {isModalVisible && (
                <div className="fixed inset-0 bg-black/40 bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-hidden">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold text-gray-800">
                                    Update Schedule - {updatedTiming.day}
                                </h2>
                                <button onClick={() => setModalVisible(false)} className="text-gray-400 hover:text-gray-600">
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
                            {/* Availability Toggle */}
                            <div className="flex items-center justify-between mb-6 p-4 bg-gray-50 rounded-xl">
                                <span className="text-base font-semibold text-gray-800">
                                    Available on {updatedTiming.day}
                                </span>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={updatedTiming.isAvailable}
                                        onChange={(e) => setUpdatedTiming({
                                            ...updatedTiming,
                                            isAvailable: e.target.checked,
                                            startTime: e.target.checked ? updatedTiming.startTime : '',
                                            endTime: e.target.checked ? updatedTiming.endTime : ''
                                        })}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#009e92]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#009e92]"></div>
                                </label>
                            </div>

                            {updatedTiming.isAvailable ? (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Start Time *
                                        </label>
                                        <input
                                            type="time"
                                            className="w-full border border-gray-300 px-4 py-3 rounded-xl text-gray-700 focus:outline-none focus:border-[#009e92] focus:ring-2 focus:ring-[#009e92]/20"
                                            value={updatedTiming.startTime}
                                            onChange={(e) => setUpdatedTiming({ ...updatedTiming, startTime: e.target.value })}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            End Time *
                                        </label>
                                        <input
                                            type="time"
                                            className="w-full border border-gray-300 px-4 py-3 rounded-xl text-gray-700 focus:outline-none focus:border-[#009e92] focus:ring-2 focus:ring-[#009e92]/20"
                                            value={updatedTiming.endTime}
                                            onChange={(e) => setUpdatedTiming({ ...updatedTiming, endTime: e.target.value })}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Consultation Fee
                                        </label>
                                        <input
                                            type="number"
                                            inputMode="numeric"
                                            className="w-full border border-gray-300 px-4 py-3 rounded-xl text-gray-700 focus:outline-none focus:border-[#009e92] focus:ring-2 focus:ring-[#009e92]/20"
                                            placeholder="e.g. 500"
                                            value={updatedTiming.fee}
                                            onChange={(e) => setUpdatedTiming({ ...updatedTiming, fee: e.target.value })}
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-gray-100 p-4 rounded-xl">
                                    <p className="text-gray-600 text-center">
                                        This day will be marked as unavailable. No appointments can be booked.
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="p-6 border-t border-gray-200">
                            <button
                                className="w-full bg-[#009e92] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#018177] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                onClick={handleUpdateTiming}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <div className="flex items-center justify-center">
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                        Updating...
                                    </div>
                                ) : (
                                    'Update Schedule'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Timing;
