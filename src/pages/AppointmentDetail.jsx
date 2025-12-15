import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import baseUrl from '../utils/baseUrl';
import { useGetDoctor } from '../hooks/useGetDoctor';
import { Phone } from 'lucide-react';

const AppointmentDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const doctor = useGetDoctor();
    const [appointment, setAppointment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [prescriptionModal, setPrescriptionModal] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogContent, setDialogContent] = useState('');
    const [dialogFunction, setDialogFunction] = useState(null);
    const [dialogTitle, setDialogTitle] = useState('');
    const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
    const [availableSlots, setAvailableSlots] = useState([]);
    const [selectedSlot, setSelectedSlot] = useState('');
    const [loadingSlots, setLoadingSlots] = useState(false);

    useEffect(() => {
        fetchAppointmentDetails();
    }, []);

    useEffect(() => {
        if (rescheduleModalOpen && appointment) {
            fetchAvailableSlots();
        }
    }, [rescheduleModalOpen, appointment]);

    const fetchAppointmentDetails = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${baseUrl}/doctorappointment/get/${id}`);

            if (response.status === 200 || response.status === 201) {
                setAppointment(response.data);
            }
        } catch (error) {
            console.error('Error fetching appointment details:', error);
            toast.error('Failed to fetch appointment details');
        } finally {
            setLoading(false);
        }
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
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatDateTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    };

    const getStatusConfig = (status) => {
        switch (status) {
            case 'SCHEDULED':
                return {
                    bg: 'bg-blue-100',
                    text: 'text-blue-800',
                    icon: 'calendar-check',
                    label: 'Scheduled',
                    action: 'Accept Appointment'
                };
            case 'ACCEPTED':
                return {
                    bg: 'bg-green-100',
                    text: 'text-green-800',
                    icon: 'check-circle',
                    label: 'Accepted',
                    action: 'Start Consultation'
                };
            case 'REJECTED':
                return {
                    bg: 'bg-red-100',
                    text: 'text-red-800',
                    icon: 'times-circle',
                    label: 'Rejected',
                    action: null
                };
            case 'IN_PROGRESS':
                return {
                    bg: 'bg-yellow-100',
                    text: 'text-yellow-800',
                    icon: 'clock',
                    label: 'In Progress',
                    action: 'Waiting for Patient to complete...'
                };
            case 'COMPLETED':
                return {
                    bg: 'bg-green-100',
                    text: 'text-green-800',
                    icon: 'check-circle',
                    label: 'Completed',
                    action: null
                };
            default:
                return {
                    bg: 'bg-gray-100',
                    text: 'text-gray-800',
                    icon: 'info-circle',
                    label: status,
                    action: null
                };
        }
    };

    const handleStatusUpdate = async (newStatus) => {
        setDialogOpen(true);

        switch (newStatus) {
            case 'ACCEPTED':
                setDialogTitle('Accept Appointment');
                setDialogContent(`Are you sure you want to accept this appointment?`);
                setDialogFunction(() => handleAccept);
                break;
            case 'REJECTED':
                setDialogTitle('Reject Appointment');
                setDialogContent(`Are you sure you want to reject this appointment?`);
                setDialogFunction(() => handleReject);
                break;
            case 'COMPLETED':
                setDialogTitle('Complete Appointment');
                setDialogContent(`Are you sure you want to complete this appointment?`);
                setDialogFunction(() => handleComplete);
                break;
            case 'IN_PROGRESS':
                setDialogTitle('Start Consultation');
                setDialogContent(`Are you sure you want to start this appointment?`);
                setDialogFunction(() => handleStartConsultation);
                break;
        }
    };

    const handleAccept = async () => {
        setDialogOpen(false);
        try {
            const date = new Date();
            const videoCallId = `${id}MED-${date.getTime()}`;
            setUpdating(true);
            const response = await axios.patch(`${baseUrl}/doctorappointment/accept/${id}/${doctor.id}`, {
                videoCallId: videoCallId
            });

            if (response.status === 200) {
                toast.success('Appointment Accepted successfully');
                fetchAppointmentDetails();
            }
        } catch (error) {
            console.error('Error Accepting appointment status:', error);
            toast.error('Failed to Accept appointment status');
        } finally {
            setUpdating(false);
        }
    };

    const handleReject = async () => {
        setDialogOpen(false);
        try {
            setUpdating(true);
            const response = await axios.patch(`${baseUrl}/doctorappointment/reject/${id}/${doctor.id}`);

            if (response.status === 200) {
                toast.success('Appointment Rejected successfully');
                fetchAppointmentDetails();
            }
        } catch (error) {
            console.error('Error Rejected appointment status:', error);
            toast.error('Failed to Rejected appointment status');
        } finally {
            setUpdating(false);
        }
    };

    const handleInProgress = async () => {
        setDialogOpen(false);
        try {
            setUpdating(true);
            const response = await axios.patch(`${baseUrl}/doctorappointment/in-progress/${id}/${doctor.id}`);

            if (response.status === 200) {
                toast.success('Appointment In Progress successfully');
                fetchAppointmentDetails();
            }
        } catch (error) {
            console.error('Error In Progress appointment status:', error);
            toast.error('Failed to In Progress appointment status');
        } finally {
            setUpdating(false);
        }
    };

    const handleComplete = async () => {
        setDialogOpen(false);
        try {
            setUpdating(true);
            const response = await axios.patch(`${baseUrl}/doctorappointment/complete/${id}/${doctor.id}`);

            if (response.status === 200) {
                toast.success('Appointment Completed successfully');
                fetchAppointmentDetails();
            }
        } catch (error) {
            console.error('Error Completing appointment status:', error);
            toast.error('Failed to Complete appointment status');
        } finally {
            setUpdating(false);
        }
    };

    const handleStartConsultation = async () => {
        await handleInProgress();
        
        if (appointment.videoCallId) {
            navigate(`/video-call/${appointment.videoCallId}`, {
                state: {
                    appointmentId: appointment.id,
                    patientName: `${appointment.patientFirstName} ${appointment.patientLastName}`
                }
            });
        } else {
            toast.error('Video call not available for this appointment');
        }
    };

    const handleCall = (phoneNumber) => {
        window.location.href = `tel:${phoneNumber}`;
    };

    const handleUploadPrescription = async () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (file) {
                uploadPrescriptionImage(file);
            }
        };
        input.click();
    };

    const uploadPrescriptionImage = async (file) => {
        try {
            setUploading(true);

            const formData = new FormData();
            formData.append('prescription', file);

            const response = await axios.patch(
                `${baseUrl}/doctorappointment/upload/prescription/${id}`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            if (response.status === 200 || response.status === 201) {
                toast.success('Prescription uploaded successfully');
                setPrescriptionModal(false);
                fetchAppointmentDetails();
            } else {
                toast.error('Failed to upload prescription');
            }
        } catch (error) {
            console.error('Error uploading prescription:', error);
            toast.error('Failed to upload prescription');
        } finally {
            setUploading(false);
        }
    };

    const fetchAvailableSlots = async () => {
        if (!appointment?.slot?.timingsId || !appointment?.date) return;

        try {
            setLoadingSlots(true);
            const response = await axios.get(`${baseUrl}/slot/getfreeslots/${appointment.slot.timingsId}/${appointment.date}`);
            
            if (response.data && Array.isArray(response.data)) {
                const availableSlots = response.data.filter(slot => slot.isAvailable);
                setAvailableSlots(availableSlots);
            } else {
                setAvailableSlots([]);
            }
        } catch (error) {
            console.error('Error fetching slots:', error);
            toast.error('Failed to load available slots');
        } finally {
            setLoadingSlots(false);
        }
    };

    const handleReschedule = async () => {
        if (!selectedSlot) {
            toast.error('Please select a time slot');
            return;
        }

        try {
            setUpdating(true);
            const response = await axios.patch(
                `${baseUrl}/doctorappointment/reschedule/${id}`,
                {
                    doctorId: doctor.id,
                    slotId: selectedSlot
                }
            );

            if (response.status === 200 || response.status === 201) {
                toast.success('Appointment rescheduled successfully');
                setRescheduleModalOpen(false);
                setSelectedSlot('');
                fetchAppointmentDetails();
            } else {
                toast.error('Failed to reschedule appointment');
            }
        } catch (error) {
            console.error('Error rescheduling appointment:', error);
            toast.error('Failed to reschedule appointment');
        } finally {
            setUpdating(false);
        }
    };

    const handleSelectSlot = (slot) => {
        setSelectedSlot(slot.id);
    };

    const closeRescheduleModal = () => {
        setRescheduleModalOpen(false);
        setSelectedSlot('');
    };

    const getNextStatus = (currentStatus) => {
        switch (currentStatus) {
            case 'SCHEDULED':
                return 'ACCEPTED';
            case 'ACCEPTED':
                return 'IN_PROGRESS';
            case 'IN_PROGRESS':
                return 'COMPLETED';
            default:
                return null;
        }
    };

    if (loading) {
        return (
            <div className="flex-1 bg-gray-50 min-h-screen">
                <div className="px-4 py-4 border-b border-gray-100">
                    <div className="flex items-center max-w-7xl mx-auto">
                        {/* <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-gray-100 rounded-lg">
                            <svg className="w-5 h-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <h1 className="text-lg font-medium text-gray-900 ml-2">Appointment Details</h1> */}
                    </div>
                </div>

                <div className="flex-1 flex flex-col justify-center items-center py-20 h-screen">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#009e92]"></div>
                    <p className="text-gray-500 mt-3">Loading appointment details...</p>
                </div>
            </div>
        );
    }

    if (!appointment) {
        return (
            <div className="flex-1 bg-gray-50 min-h-screen flex flex-col justify-center items-center">
                <svg className="w-12 h-12 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <p className="text-lg font-medium text-gray-500 mt-4">Appointment not found</p>
                <button
                    className="mt-4 bg-blue-500 px-6 py-2 rounded-lg text-white font-medium hover:bg-blue-600"
                    onClick={() => navigate(-1)}
                >
                    Go Back
                </button>
            </div>
        );
    }

    const statusConfig = getStatusConfig(appointment.status);
    const nextStatus = getNextStatus(appointment.status);

    return (
        <div className="flex-1 bg-gray-50 min-h-screen pb-24">
            {/* Dialog Box */}
            {dialogOpen && (
                <div className="fixed inset-0 bg-black/40 bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-2">{dialogTitle}</h2>
                        <p className="text-gray-600 mb-6">{dialogContent}</p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setDialogOpen(false)}
                                className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={dialogFunction}
                                className="flex-1 bg-[#009e92] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#018177] transition-colors"
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Prescription Upload Modal */}
            {prescriptionModal && (
                <div className="fixed inset-0 bg-black/40 bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl w-full max-w-md p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-1 text-center">Upload Prescription</h2>
                        <p className="text-gray-500 text-center mb-6">
                            Upload the image of the prescription for this appointment.
                        </p>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setPrescriptionModal(false)}
                                className="flex-1 bg-gray-100 rounded-lg py-3 text-gray-700 font-medium hover:bg-gray-200"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={handleUploadPrescription}
                                disabled={uploading}
                                className="flex-1 bg-[#009e92] rounded-lg py-3 text-white font-medium hover:bg-[#018177] disabled:opacity-50"
                            >
                                {uploading ? 'Uploading...' : 'Upload'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Reschedule Modal */}
            {rescheduleModalOpen && (
                <div 
                    className="fixed inset-0 bg-black/40 bg-opacity-60 flex items-center justify-center p-4 z-50"
                    onClick={closeRescheduleModal}
                >
                    <div 
                        className="bg-white rounded-2xl w-full max-w-md max-h-96 flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="p-4 border-b border-gray-200">
                            <h2 className="text-lg font-bold text-[#009e92] text-center">Reschedule Appointment</h2>
                            <p className="text-sm text-gray-600 text-center mt-1">Select an available time slot</p>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto max-h-80">
                            {loadingSlots ? (
                                <div className="p-8 flex flex-col items-center justify-center">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#009e92]"></div>
                                    <p className="text-gray-500 mt-2">Loading available slots...</p>
                                </div>
                            ) : availableSlots.length === 0 ? (
                                <div className="p-8 flex items-center justify-center">
                                    <p className="text-gray-500 text-center">No available slots for this date</p>
                                </div>
                            ) : (
                                availableSlots.map((slot) => (
                                    <button
                                        key={slot.id}
                                        className={`w-full p-4 border-b border-gray-100 text-left hover:bg-gray-50 transition-colors ${
                                            selectedSlot === slot.id ? 'bg-blue-50' : ''
                                        }`}
                                        onClick={() => handleSelectSlot(slot)}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className={`text-base ${
                                                    selectedSlot === slot.id ? 'text-[#009e92] font-medium' : 'text-gray-700'
                                                }`}>
                                                    {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-1">Available Slot</p>
                                            </div>
                                            {selectedSlot === slot.id && (
                                                <svg className="w-4.5 h-4.5 text-[#009e92]" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                            )}
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>

                        {/* Footer */}
                        <div className="flex gap-3 p-4 border-t border-gray-200">
                            <button
                                onClick={closeRescheduleModal}
                                className="flex-1 p-3 border border-gray-300 rounded-lg text-gray-600 font-medium hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleReschedule}
                                disabled={!selectedSlot || updating}
                                className={`flex-1 p-3 rounded-lg font-medium transition-colors ${
                                    selectedSlot ? 'bg-[#009e92] text-white hover:bg-[#018177]' : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                }`}
                            >
                                {updating ? (
                                    <div className="flex items-center justify-center">
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                    </div>
                                ) : (
                                    'Reschedule'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="max-w-7xl mx-auto">
                {/* Status Banner */}
                <div className={`rounded-lg px-5 py-4 mb-6 ${statusConfig.bg} ${statusConfig.text}`}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span className="text-base font-medium ml-3">Status: {statusConfig.label}</span>
                        </div>
                        {appointment.isRescheduled && (
                            <div className="bg-white rounded-full px-3 py-1">
                                <span className="text-[#009e92] text-xs font-bold">RESCHEDULED</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Grid Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left Column */}
                    <div className="space-y-6">
                        {/* Appointment Info Card */}
                        <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-100">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-base font-semibold text-gray-900">Appointment Details</h2>
                                <div className={`px-2 py-1 rounded-md ${statusConfig.bg}`}>
                                    <span className={`text-xs font-medium ${statusConfig.text}`}>ONLINE</span>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center">
                                    <svg className="w-4.5 h-4.5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <span className="text-gray-700 ml-3">{formatDate(appointment.date)}</span>
                                </div>

                                <div className="flex items-center">
                                    <svg className="w-4.5 h-4.5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span className="text-gray-700 ml-3">
                                        {formatTime(appointment.slot.startTime)} - {formatTime(appointment.slot.endTime)}
                                    </span>
                                </div>

                                <div className="flex items-center">
                                    <svg className="w-4.5 h-4.5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    <span className="text-gray-700 ml-3">Booked on {formatDateTime(appointment.createdAt)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Patient Info Card */}
                        <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-100">
                            <h2 className="text-base font-semibold text-gray-900 mb-4">Patient Information</h2>

                            <div className="flex items-center">
                                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                    <span className="text-[#009e92] font-bold text-lg">
                                        {appointment.patientFirstName[0]}{appointment.patientLastName[0]}
                                    </span>
                                </div>
                                <div className="flex-1 ml-4">
                                    <p className="text-base font-medium text-gray-900">
                                        {appointment.patientFirstName} {appointment.patientLastName}
                                    </p>
                                    <p className="text-gray-500 text-sm mt-1">
                                        {appointment.patientAge} years • {appointment.patientGender}
                                    </p>
                                </div>

                                <div className='flex items-center justify-center gap-2 '>
                                    <Phone className="w-4 h-4 text-blue-600 cursor-pointer" onClick={() => handleCall(appointment.patientPhoneNumber)} />
                                    <span className='text-sm'>+91 {appointment.patientPhoneNumber}</span>
                                </div>

                                {/* <button
                                    onClick={() => handleCall(appointment.patientPhoneNumber)}
                                    className="bg-blue-50 rounded-full p-2 hover:bg-blue-100 transition-colors"
                                >
                                    <svg className="w-3.5 h-3.5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                                        <p>{appointment.patientPhoneNumber}</p>
                                    </svg>
                                </button> */}
                            </div>
                        </div>

                        {/* Booked By Card */}
                        <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-100">
                            <h2 className="text-base font-semibold text-gray-900 mb-4">Booked By</h2>

                            <div className="flex items-center">
                                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                                    <span className="text-gray-600 font-bold text-lg">
                                        {(appointment.bookedBy?.first_name ? appointment.bookedBy.first_name[0] : 'N') +
                                         (appointment.bookedBy?.last_name ? appointment.bookedBy.last_name[0] : 'A')}
                                    </span>
                                </div>
                                <div className="flex-1 ml-4">
                                    <p className="text-base font-medium text-gray-900">
                                        {appointment.bookedBy?.last_name === null ? 'N/A' : appointment.bookedBy?.last_name}
                                    </p>
                                    <p className="text-gray-500 text-sm mt-1">{appointment.bookedBy?.email || 'N/A'}</p>
                                </div>
                               <div className='flex items-center justify-center gap-2 '>
                                    <Phone className="w-4 h-4 text-blue-600 cursor-pointer" onClick={() => handleCall(appointment.bookedBy?.phoneNumber)} />
                                    <span className='text-sm'>+91 {appointment.bookedBy?.phoneNumber}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">
                        {/* Payment Info Card */}
                        <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-100">
                            <h2 className="text-base font-semibold text-gray-900 mb-4">Payment Information</h2>

                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Payment Status</span>
                                    <span className={`font-medium ${appointment.status === 'COMPLETED' ? 'text-green-600' : 'text-yellow-600'}`}>
                                        {appointment.status === 'COMPLETED' ? 'Completed' : 'Pending'}
                                    </span>
                                </div>

                                <div className="flex justify-between">
                                    <span className="text-gray-500">Amount</span>
                                    <span className="text-gray-900 font-mono text-sm">₹{appointment.orderData.amount}</span>
                                </div>

                                {appointment.refundData && (
                                    <>
                                        <div className="flex justify-between mt-3">
                                            <span className="text-gray-500">Refund Amount</span>
                                            <span className="text-red-600 font-medium">₹{appointment.refundData.amount}</span>
                                        </div>

                                        <div className="flex justify-between mt-3">
                                            <span className="text-gray-500">Refund Status</span>
                                            <span className="text-red-600 font-medium">{appointment.refundData.status}</span>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Prescription Section */}
                        {appointment.status === 'COMPLETED' && (
                            <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-100">
                                <h2 className="text-base font-semibold text-gray-900 mb-4">Prescription</h2>

                                {appointment.prescriptionUrl ? (
                                    <button
                                        className="w-full bg-green-50 border border-green-100 rounded-lg p-4 flex items-center hover:bg-green-100 transition-colors"
                                        onClick={() => window.open(`https://api.mahadiagno.com/${appointment.prescriptionUrl}`, '_blank')}
                                    >
                                        <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                                        </svg>
                                        <div className="ml-3 flex-1 text-left">
                                            <p className="text-green-800 font-medium">Prescription Uploaded</p>
                                            <p className="text-green-600 text-xs mt-1">Tap to view</p>
                                        </div>
                                        <svg className="w-4.5 h-4.5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => setPrescriptionModal(true)}
                                        className="w-full border-2 border-dashed border-blue-200 rounded-lg p-5 flex flex-col items-center bg-blue-50 hover:bg-blue-100 transition-colors"
                                    >
                                        <svg className="w-7 h-7 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                        </svg>
                                        <p className="text-[#009e92] font-medium mt-2">Upload Prescription</p>
                                        <p className="text-gray-500 text-xs mt-1">PDF or image files</p>
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Reschedule Button */}
                        {appointment.status === 'SCHEDULED' && !appointment.isRescheduled && (
                            <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-100">
                                <button
                                    onClick={() => setRescheduleModalOpen(true)}
                                    disabled={updating}
                                    className="w-full bg-[#009e92] rounded-lg py-3 text-white font-medium hover:bg-[#018177] transition-colors disabled:opacity-50"
                                >
                                    {updating ? 'Processing...' : 'Reschedule Appointment'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Action Buttons - Fixed at Bottom */}
            {nextStatus && (
                <div className="bg-white px-4 py-4 border-t border-gray-100 shadow-lg mt-6">
                    <div className="max-w-7xl mx-auto">
                        {appointment.status === 'SCHEDULED' && (
                            <div className="flex gap-3">
                                <button
                                    onClick={() => handleStatusUpdate('REJECTED')}
                                    disabled={updating}
                                    className="flex-1 bg-white border border-gray-300 rounded-lg py-3 text-[#009e92] font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
                                >
                                    {updating ? 'Processing...' : 'Reject'}
                                </button>

                                <button
                                    onClick={() => handleStatusUpdate(nextStatus)}
                                    disabled={updating}
                                    className="flex-1 bg-[#009e92] rounded-lg py-3 text-white font-medium hover:bg-[#018177] transition-colors disabled:opacity-50"
                                >
                                    {updating ? 'Processing...' : 'Accept'}
                                </button>
                            </div>
                        )}

                        {(appointment.status === 'ACCEPTED' || appointment.status === 'IN_PROGRESS') && (
                            <button
                                onClick={() => handleStatusUpdate(nextStatus)}
                                disabled={updating || appointment.status === 'IN_PROGRESS'}
                                className="w-full bg-[#009e92] rounded-lg py-3 text-white font-medium hover:bg-[#018177] transition-colors disabled:opacity-50"
                            >
                                {updating ? 'Processing...' : statusConfig.action}
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AppointmentDetail;
