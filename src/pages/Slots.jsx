import React, { useEffect, useState } from 'react';
import axios from 'axios';
import baseUrl from '../utils/baseUrl';
import { useGetDoctor } from '../hooks/useGetDoctor';

const Slots = () => {
    const doctor = useGetDoctor();
    const [statusOptions, setStatusOptions] = useState([]);
    const [activeStatus, setActiveStatus] = useState(null);
    const [isModalVisible, setModalVisible] = useState(false);
    const [isFetching, setIsFetching] = useState(false);
    const [error, setError] = useState('');
    const [slots, setSlots] = useState([]);
    const [isLoadingSlots, setIsLoadingSlots] = useState(false);
    const [isAddingSlot, setIsAddingSlot] = useState(false);
    const [newSlot, setNewSlot] = useState({
        startTime: '',
        endTime: '',
        timeFrame: '30'
    });

    const fetchSchedules = async () => {
        setIsFetching(true);
        setError('');
        try {
            const res = await axios.get(`${baseUrl}/timing/get/available/${doctor.id}`);
            if (res.status === 200 || res.status === 201) {
                console.log('Fetched schedules:', res.data);
                setStatusOptions(res.data);
            } else {
                setError('Failed to fetch schedules');
                window.alert('Failed to fetch schedules');
            }
        } catch (error) {
            const errorMessage = error.response?.data?.error || error.message || 'Something went wrong';
            setError(errorMessage);
            window.alert(errorMessage);
        } finally {
            setIsFetching(false);
        }
    };

    const fetchSlots = async (timingId) => {
        if (!timingId) return;

        setIsLoadingSlots(true);
        try {
            const res = await axios.get(`${baseUrl}/slot/get/${timingId}`);
            if (res.status === 200 || res.status === 201) {
                setSlots(res.data.slots || res.data || []);
            } else {
                setSlots([]);
                window.alert('Failed to fetch slots');
            }
        } catch (error) {
            console.log('Error fetching slots:', error);
            setSlots([]);
        } finally {
            setIsLoadingSlots(false);
        }
    };

    const handleAddSlot = async () => {
        if (!activeStatus?.id) {
            window.alert('Please select a day first');
            return;
        }

        if (!newSlot.startTime.trim() || !newSlot.endTime.trim()) {
            window.alert('Please fill all fields');
            return;
        }

        const timeToMinutes = (timeStr) => {
            const [hours, minutes] = timeStr.split(':').map(num => parseInt(num));
            return hours * 60 + minutes;
        };

        const startMinutes = timeToMinutes(newSlot.startTime);
        const endMinutes = timeToMinutes(newSlot.endTime);

        if (startMinutes >= endMinutes) {
            window.alert('Start time must be before end time');
            return;
        }

        const dayStartMinutes = timeToMinutes(activeStatus.startTime);
        const dayEndMinutes = timeToMinutes(activeStatus.endTime);

        if (startMinutes < dayStartMinutes || endMinutes > dayEndMinutes) {
            window.alert(`Time must be between ${activeStatus.startTime} - ${activeStatus.endTime}`);
            return;
        }

        setIsAddingSlot(true);
        try {
            const slotData = {
                timingId: activeStatus.id,
                startTime: newSlot.startTime,
                endTime: newSlot.endTime,
                timeFrame: parseInt(newSlot.timeFrame)
            };

            const res = await axios.post(`${baseUrl}/slot/add`, slotData);

            if (res.status === 200 || res.status === 201) {
                window.alert('Slot added successfully');
                fetchSlots(activeStatus.id);

                setNewSlot({
                    startTime: '',
                    endTime: '',
                    timeFrame: '30'
                });
                setModalVisible(false);
            } else {
                window.alert('Failed to add slot');
            }
        } catch (error) {
            const errorMessage = error.response?.data?.error || error.message || 'Failed to add slot';
            window.alert(errorMessage);
        } finally {
            setIsAddingSlot(false);
        }
    };

    const handleDeleteSlot = async (slotId) => {
        if (!window.confirm('Are you sure you want to delete this slot?')) {
            return;
        }

        try {
            const res = await axios.delete(`${baseUrl}/slot/delete/${slotId}`);

            if (res.status === 200 || res.status === 201) {
                window.alert('Slot deleted successfully');
                setSlots(prevSlots => prevSlots.filter(slot => slot.id !== slotId));
            } else {
                window.alert('Failed to delete slot');
            }
        } catch (error) {
            const errorMessage = error.response?.data?.error || error.message || 'Failed to delete slot';
            window.alert(errorMessage);
        }
    };

    const sortDays = (data) => {
        const dayOrder = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
        return data.sort((a, b) => {
            return dayOrder.indexOf(a?.key.toLowerCase()) - dayOrder.indexOf(b?.key.toLowerCase());
        });
    };

    const handleStatusChange = (status) => {
        setActiveStatus(status);
        fetchSlots(status.id);
    };

    useEffect(() => {
        if (statusOptions.length > 0) {
            setActiveStatus(statusOptions[0]);
        }
    }, [statusOptions]);

    useEffect(() => {
        if (activeStatus?.id) {
            fetchSlots(activeStatus.id);
        }
    }, [activeStatus]);

    useEffect(() => {
        if (doctor?.id) {
            fetchSchedules();
        }
    }, [doctor?.id]);

    const calculateDuration = (startTime, endTime) => {
        const timeToMinutes = (timeStr) => {
            const [hours, minutes] = timeStr.split(':').map(num => parseInt(num));
            return hours * 60 + minutes;
        };
        const startMinutes = timeToMinutes(startTime);
        const endMinutes = timeToMinutes(endTime);
        const duration = endMinutes - startMinutes;

        if (duration >= 60) {
            const hours = Math.floor(duration / 60);
            const mins = duration % 60;
            return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
        } else {
            return `${duration}min`;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 relative">
            <div className='flex  justify-end'>
                <button
                    onClick={() => setModalVisible(true)}
                    className="bg-[#009e92] text-white px-10 py-2 rounded-lg font-semibold hover:bg-[#018177] transition-colors flex items-center gap-2 mb-4 cursor-pointer"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Slot
                </button>
            </div>
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
                    </div>
                ) : (
                    <>
                        {/* Day Tabs */}
                        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
                            <div className="flex gap-2 overflow-x-auto pb-2">
                                {sortDays(statusOptions).map((option) => (
                                    <button
                                        key={option?.id}
                                        onClick={() => handleStatusChange(option)}
                                        className={`px-6 py-3 rounded-lg font-medium whitespace-nowrap transition-all ${activeStatus?.key === option?.key
                                            ? 'bg-[#009e92] text-white shadow-md'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                            }`}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Slots Content */}
                        {isLoadingSlots ? (
                            <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#009e92] mx-auto"></div>
                                <p className="text-gray-500 mt-4">Loading slots...</p>
                            </div>
                        ) : !activeStatus ? (
                            <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
                                <p className="text-gray-400">Please select a day to view slots</p>
                            </div>
                        ) : slots.length === 0 ? (
                            <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
                                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p className="text-gray-500 mt-4 text-lg font-medium">No slots available for {activeStatus?.label}</p>
                                <p className="text-gray-400 mt-2">Click "Add Slot" to create your first appointment slot</p>
                            </div>
                        ) : (
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {slots.map((slot, index) => (
                                    <div
                                        key={slot.id || `slot-${index}`}
                                        className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow"
                                    >
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex-1">
                                                <div className="flex items-center text-gray-800 mb-2">
                                                    <svg className="w-5 h-5 text-[#009e92] mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    <span className="text-lg font-bold">
                                                        {slot.startTime} - {slot.endTime}
                                                    </span>
                                                </div>
                                                <div className="flex items-center text-gray-600">
                                                    <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                    <span className="text-sm">
                                                        Duration: {calculateDuration(slot.startTime, slot.endTime)}
                                                    </span>
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => handleDeleteSlot(slot.id)}
                                                className="bg-red-50 p-2 rounded-lg hover:bg-red-100 transition-colors"
                                            >
                                                <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Add Slot Modal */}
            {isModalVisible && (
                <div className="fixed inset-0 bg-black/40 bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-hidden">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold text-gray-800">Add New Slot</h2>
                                <button onClick={() => setModalVisible(false)} className="text-gray-400 hover:text-gray-600">
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
                            {/* Selected Day */}
                            <div className="mb-4">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Selected Day</label>
                                <input
                                    type="text"
                                    className="w-full border border-gray-300 px-4 py-3 rounded-xl text-gray-700 bg-gray-50 uppercase font-medium"
                                    value={activeStatus?.label || ''}
                                    readOnly
                                />
                            </div>

                            {/* Available Time Range */}
                            <div className="mb-4">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Available Time Range</label>
                                <div className="bg-green-50 border border-green-200 p-3 rounded-xl">
                                    <p className="text-green-800 text-center font-medium">
                                        {activeStatus?.startTime} - {activeStatus?.endTime}
                                    </p>
                                </div>
                            </div>

                            {/* Slot Timing */}
                            <div className="mb-4">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Slot Timing</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1">Start Time</label>
                                        <input
                                            type="time"
                                            className="w-full border border-gray-300 px-4 py-3 rounded-xl text-gray-700 focus:outline-none focus:border-[#009e92] focus:ring-2 focus:ring-[#009e92]/20"
                                            value={newSlot.startTime}
                                            onChange={(e) => setNewSlot({ ...newSlot, startTime: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1">End Time</label>
                                        <input
                                            type="time"
                                            className="w-full border border-gray-300 px-4 py-3 rounded-xl text-gray-700 focus:outline-none focus:border-[#009e92] focus:ring-2 focus:ring-[#009e92]/20"
                                            value={newSlot.endTime}
                                            onChange={(e) => setNewSlot({ ...newSlot, endTime: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <p className='text-red-600 text-sm mt-2 italic'>*The slot timing should be within the available time range.</p>
                            </div>

                            {/* Appointment Duration */}
                            <div className="mb-4">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Appointment Duration</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        className={`p-3 rounded-xl border-2 font-medium transition-all ${newSlot.timeFrame === '15'
                                            ? 'bg-[#009e92] border-[#009e92] text-white'
                                            : 'bg-white border-gray-300 text-gray-600 hover:border-gray-400'
                                            }`}
                                        onClick={() => setNewSlot({ ...newSlot, timeFrame: '15' })}
                                    >
                                        15 Minutes
                                    </button>

                                    <button
                                        className={`p-3 rounded-xl border-2 font-medium transition-all ${newSlot.timeFrame === '30'
                                            ? 'bg-[#009e92] border-[#009e92] text-white'
                                            : 'bg-white border-gray-300 text-gray-600 hover:border-gray-400'
                                            }`}
                                        onClick={() => setNewSlot({ ...newSlot, timeFrame: '30' })}
                                    >
                                        30 Minutes
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-gray-200">
                            <button
                                className="w-full bg-[#009e92] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#018177] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                onClick={handleAddSlot}
                                disabled={isAddingSlot}
                            >
                                {isAddingSlot ? (
                                    <div className="flex items-center justify-center">
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                        Adding...
                                    </div>
                                ) : (
                                    'Add Slot'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Slots;
