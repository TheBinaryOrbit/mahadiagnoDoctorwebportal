import React, { useState, useEffect } from 'react';
import { useGetDoctor } from '../hooks/useGetDoctor';
import axios from 'axios';
import baseUrl from '../utils/baseUrl';
import { useNavigate } from 'react-router-dom';

const Appointment = ({status}) => {
    const doctor = useGetDoctor();
    const navigate = useNavigate();
    const [appointments, setAppointments] = useState([]);
    const [filteredAppointments, setFilteredAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState(status);

    const statusOptions = [
        { key: 'SCHEDULED', label: 'Scheduled', color: '#6B7280' },
        { key: 'ACCEPTED', label: 'Accepted', color: '#10B981' },
        { key: 'REJECTED', label: 'Rejected', color: '#EF4444' },
        { key: 'IN_PROGRESS', label: 'In Progress', color: '#F59E0B' },
        { key: 'COMPLETED', label: 'Completed', color: '#10B981' },
    ];

    useEffect(() => {
        if (doctor?.id) {
            fetchAppointments();
        }
    }, [doctor?.id , status , selectedStatus]);

    const fetchAppointments = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${baseUrl}/doctorappointment/get/doctor/${doctor.id}?status=${status || undefined}`);

            if (response.data.appointments) {
                setAppointments(response.data.appointments);
            } else {
                setAppointments([]);
            }
        } catch (error) {
            console.error('Error fetching appointments:', error);
            window.alert('Failed to fetch appointments');
            setAppointments([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(()=>{
        console.log(appointments);
    },[appointments])

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchAppointments();
        setRefreshing(false);
    };


    const formatTime = (time) => {
        if (!time) return '';
        const [hours, minutes] = time.split(':');
        const hour12 = parseInt(hours) > 12 ? parseInt(hours) - 12 : parseInt(hours);
        const ampm = parseInt(hours) >= 12 ? 'PM' : 'AM';
        return `${hour12}:${minutes} ${ampm}`;
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'SCHEDULED':
                return 'bg-gray-500';
            case 'ACCEPTED':
                return 'bg-green-600';
            case 'REJECTED':
                return 'bg-red-600';
            case 'IN_PROGRESS':
                return 'bg-yellow-600';
            case 'COMPLETED':
                return 'bg-green-600';
            default:
                return 'bg-gray-500';
        }
    };

    const handleStatusUpdate = (appointmentId, newStatus) => {
        if (window.confirm(`Are you sure you want to mark this appointment as ${newStatus}?`)) {
            updateAppointmentStatus(appointmentId, newStatus);
        }
    };

    const updateAppointmentStatus = async (appointmentId, newStatus) => {
        try {
            // You can implement status update API call here
            window.alert(`Appointment ${newStatus.toLowerCase()}`);
            // Refresh appointments after update
            fetchAppointments();
        } catch (error) {
            console.error('Error updating appointment status:', error);
            window.alert('Failed to update appointment status');
        }
    };

    const renderAppointmentCard = (appointment) => (
        <div key={appointment.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-4 p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">
                        {appointment.patientFirstName} {appointment.patientLastName}
                    </h3>
                    <p className="text-gray-600 text-sm">
                        {appointment.patientAge} years • {appointment.patientGender}
                    </p>
                </div>

                <div className="flex items-end">
                    <div className={`px-3 py-1 rounded-full ${getStatusColor(appointment.status)}`}>
                        <span className="text-white text-xs font-bold tracking-wide">
                            {appointment.status}
                        </span>
                    </div>
                </div>
            </div>

            {/* Booked By Info */}
            <div className="bg-gray-50 rounded-xl p-3 mb-3">
                <div className="flex items-center mb-2">
                    <svg className="w-3.5 h-3.5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700 font-medium ml-2">
                        Booked by: {appointment.bookedBy.first_name} {appointment.bookedBy.last_name}
                    </span>
                </div>
                <div className="flex items-center">
                    <svg className="w-3 h-3 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                    <span className="text-gray-600 text-sm ml-2">
                        {appointment.bookedBy.email}
                    </span>
                </div>
                <div className="flex items-center mt-1">
                    <svg className="w-3 h-3 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                    </svg>
                    <span className="text-gray-600 text-sm ml-2">
                        {appointment.bookedBy.phoneNumber}
                    </span>
                </div>
            </div>

            {/* Appointment Details */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center flex-1">
                    <svg className="w-4 h-4 text-[#009e92]" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700 font-medium ml-2">
                        {formatTime(appointment.slot.startTime)} - {formatTime(appointment.slot.endTime)}
                    </span>
                </div>

                <div className="flex items-center">
                    <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                    </svg>
                    <span className="font-medium ml-2 text-green-600">
                        ONLINE
                    </span>
                </div>
            </div>

            <div className="border-t border-gray-100 pt-3">
                <button
                    onClick={() => navigate(`/appointment/${appointment.id}`)}
                    className="w-full bg-[#009e92] rounded-lg px-4 py-2 text-white font-medium text-sm hover:bg-[#018177] transition-colors"
                >
                    See More
                </button>
            </div>
        </div>
    );

    if (loading && !refreshing) {
        return (
            <div className="flex-1 bg-gray-50 min-h-screen flex flex-col justify-center items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#009e92]"></div>
                <p className="text-gray-500 mt-2">Loading appointments...</p>
            </div>
        );
    }

    return (
        <div className="flex-1 bg-gray-50 min-h-screen">
        
            {/* Appointments List */}
            <div className="max-w-7xl">
                <div className="mb-4 flex justify-end">
                    <button
                        onClick={onRefresh}
                        disabled={refreshing}
                        className="flex items-center gap-2 px-4 py-2 text-[#009e92] hover:bg-[#009e92]/10 rounded-lg transition-colors disabled:opacity-50"
                    >
                        <svg className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                        </svg>
                        <span className="font-medium">Refresh</span>
                    </button>
                </div>

                {appointments.length === 0 ? (
                    <div className="flex flex-col justify-center items-center py-20">
                        <svg className="w-16 h-16 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                        </svg>
                        <p className="text-gray-500 text-lg font-medium mt-4">
                            {selectedStatus === 'ALL' ? 'No appointments found' : `No ${selectedStatus.toLowerCase()} appointments`}
                        </p>
                        <p className="text-gray-400 text-center mt-2 px-8 max-w-md">
                            Your appointments will appear here once patients book consultations
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {appointments.map(renderAppointmentCard)}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Appointment;
