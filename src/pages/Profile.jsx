import React, { useState, useEffect } from 'react';
import axios from 'axios';
import baseUrl from '../utils/baseUrl';
import { useGetDoctor } from '../hooks/useGetDoctor';
import { Edit } from 'lucide-react';

const Profile = () => {
    const doctor = useGetDoctor();
    const [doctorDetails, setDoctorDetails] = useState(null);
    const [isFetching, setIsFetching] = useState(false);
    const [error, setError] = useState('');
    const [isModalVisible, setModalVisible] = useState(false);
    const [modalType, setModalType] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);
    const [isUploadingImage, setIsUploadingImage] = useState(false);

    const [doctorForm, setDoctorForm] = useState({
        fName: '',
        lName: '',
        displayName: '',
        email: ''
    });

    const [clinicForm, setClinicForm] = useState({
        clinicName: '',
        clinicAddress: ''
    });

    // Education state
    const [educations, setEducations] = useState([]);
    const [isFetchingEducation, setIsFetchingEducation] = useState(false);
    const [newEducation, setNewEducation] = useState({
        courseName: '',
        universityName: '',
        yearOfPassing: ''
    });

    // Experience state
    const [experiences, setExperiences] = useState([]);
    const [isFetchingExperience, setIsFetchingExperience] = useState(false);
    const [newExperience, setNewExperience] = useState({
        title: '',
        hospital: '',
        employmentType: '',
        from: '',
        to: '',
        currentlyWorking: false
    });

    useEffect(() => {
        if (doctor?.id) {
            fetchDoctorDetails();
            fetchEducations();
            fetchExperiences();
        }
    }, [doctor?.id]);

    const fetchDoctorDetails = async () => {
        setIsFetching(true);
        setError('');
        try {
            const res = await axios.get(`${baseUrl}/doctor/get/${doctor.id}`);
            if (res.status === 200 || res.status === 201) {
                setDoctorDetails(res.data);
                setDoctorForm({
                    fName: res.data.fName || '',
                    lName: res.data.lName || '',
                    displayName: res.data.displayName || '',
                    email: res.data.email || ''
                });
                setClinicForm({
                    clinicName: res.data.clinicName || '',
                    clinicAddress: res.data.clinicAddress || ''
                });
                localStorage.setItem('doctor', JSON.stringify(res.data));
            } else {
                setError('Failed to fetch doctor details');
                window.alert('Failed to fetch doctor details');
            }
        } catch (error) {
            const errorMessage = error.response?.data?.error || error.message || 'Something went wrong';
            setError(errorMessage);
            window.alert(errorMessage);
        } finally {
            setIsFetching(false);
        }
    };

    const handleUpdateDoctor = async () => {
        if (!doctorForm.fName.trim() || !doctorForm.lName.trim() || !doctorForm.displayName.trim() || !doctorForm.email.trim()) {
            window.alert('Please fill all fields');
            return;
        }

        setIsUpdating(true);
        try {
            const res = await axios.put(`${baseUrl}/doctor/update/${doctor.id}`, {
                fName: doctorForm.fName.trim(),
                lName: doctorForm.lName.trim(),
                displayName: doctorForm.displayName.trim(),
                email: doctorForm.email.trim()
            });

            if (res.status === 200 || res.status === 201) {
                window.alert('Doctor details updated successfully');
                setModalVisible(false);
                fetchDoctorDetails();
            } else {
                window.alert('Failed to update doctor details');
            }
        } catch (error) {
            const errorMessage = error.response?.data?.error || error.message || 'Failed to update doctor details';
            window.alert(errorMessage);
        } finally {
            setIsUpdating(false);
        }
    };

    const handleUpdateClinic = async () => {
        if (!clinicForm.clinicName.trim() || !clinicForm.clinicAddress.trim()) {
            window.alert('Please fill all fields');
            return;
        }

        setIsUpdating(true);
        try {
            const res = await axios.put(`${baseUrl}/doctor/update/clinic/${doctor.id}`, {
                clinicName: clinicForm.clinicName.trim(),
                clinicAddress: clinicForm.clinicAddress.trim()
            });

            if (res.status === 200 || res.status === 201) {
                window.alert('Clinic details updated successfully');
                setModalVisible(false);
                fetchDoctorDetails();
            } else {
                window.alert('Failed to update clinic details');
            }
        } catch (error) {
            const errorMessage = error.response?.data?.error || error.message || 'Failed to update clinic details';
            window.alert(errorMessage);
        } finally {
            setIsUpdating(false);
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            window.alert('Please select an image file');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            window.alert('Image size should be less than 5MB');
            return;
        }

        setIsUploadingImage(true);
        try {
            const formData = new FormData();
            formData.append('image', file);

            const res = await axios.put(`${baseUrl}/doctor/update/profile-image/${doctor.id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (res.status === 200 || res.status === 201) {
                window.alert('Profile image updated successfully');
                fetchDoctorDetails();
            } else {
                window.alert('Failed to update profile image');
            }
        } catch (error) {
            const errorMessage = error.response?.data?.error || error.message || 'Failed to update profile image';
            window.alert(errorMessage);
        } finally {
            setIsUploadingImage(false);
        }
    };

    const fetchEducations = async () => {
        setIsFetchingEducation(true);
        try {
            const res = await axios.get(`${baseUrl}/education/get/${doctor.id}`);
            if (res.status === 200 || res.status === 201) {
                const educationData = res.data.educationDetails || res.data || [];
                const validEducations = Array.isArray(educationData) ? educationData : [];
                setEducations(validEducations);
            }
        } catch (error) {
            console.error('Error fetching educations:', error);
            setEducations([]);
        } finally {
            setIsFetchingEducation(false);
        }
    };

    const handleAddEducation = async () => {
        if (!newEducation.courseName.trim() || !newEducation.universityName.trim() || !newEducation.yearOfPassing.trim()) {
            window.alert('Please fill all fields');
            return;
        }

        setIsUpdating(true);
        try {
            const res = await axios.post(`${baseUrl}/education/add/${doctor.id}`, {
                courseName: newEducation.courseName.trim(),
                universityName: newEducation.universityName.trim(),
                yearOfPassing: newEducation.yearOfPassing.trim()
            });

            if (res.status === 200 || res.status === 201) {
                window.alert('Education added successfully');
                const newEducationWithId = res.data.education || { ...newEducation, id: Date.now() };
                setEducations(prevEducations => [...prevEducations, newEducationWithId]);
                setNewEducation({ courseName: '', universityName: '', yearOfPassing: '' });
                setModalVisible(false);
            } else {
                window.alert('Failed to add education');
            }
        } catch (error) {
            const errorMessage = error.response?.data?.error || error.message || 'Failed to add education';
            window.alert(errorMessage);
        } finally {
            setIsUpdating(false);
        }
    };

    const handleDeleteEducation = async (educationId) => {
        if (!window.confirm('Are you sure you want to delete this education?')) {
            return;
        }

        try {
            const res = await axios.delete(`${baseUrl}/education/delete/${educationId}/${doctor.id}`);
            if (res.status === 200 || res.status === 201) {
                window.alert('Education deleted successfully');
                setEducations(prevEducations => prevEducations.filter(edu => edu.id !== educationId));
            } else {
                window.alert('Failed to delete education');
            }
        } catch (error) {
            const errorMessage = error.response?.data?.error || error.message || 'Failed to delete education';
            window.alert(errorMessage);
        }
    };

    const fetchExperiences = async () => {
        setIsFetchingExperience(true);
        try {
            const res = await axios.get(`${baseUrl}/experience/get/${doctor.id}`);
            if (res.status === 200 || res.status === 201) {
                const experienceData = res.data.experiences || res.data || [];
                const validExperiences = Array.isArray(experienceData) ? experienceData : [];
                setExperiences(validExperiences);
            }
        } catch (error) {
            console.error('Error fetching experiences:', error);
            setExperiences([]);
        } finally {
            setIsFetchingExperience(false);
        }
    };

    const handleAddExperience = async () => {
        if (!newExperience.title.trim() || !newExperience.hospital.trim() || !newExperience.employmentType.trim() || !newExperience.from.trim()) {
            window.alert('Please fill all required fields');
            return;
        }

        if (!newExperience.currentlyWorking && !newExperience.to.trim()) {
            window.alert('Please specify end date or mark as currently working');
            return;
        }

        setIsUpdating(true);
        try {
            const experienceData = {
                title: newExperience.title,
                hospital: newExperience.hospital,
                employmentType: newExperience.employmentType,
                from: newExperience.from,
                currentlyWorking: newExperience.currentlyWorking
            };

            if (!newExperience.currentlyWorking) {
                experienceData.to = newExperience.to;
            }

            const res = await axios.post(`${baseUrl}/experience/add/${doctor.id}`, experienceData);

            if (res.status === 200 || res.status === 201) {
                window.alert('Experience added successfully');
                const newExperienceWithId = res.data.experience || { ...experienceData, id: Date.now() };
                setExperiences(prevExperiences => [...prevExperiences, newExperienceWithId]);
                setNewExperience({
                    title: '',
                    hospital: '',
                    employmentType: '',
                    from: '',
                    to: '',
                    currentlyWorking: false
                });
                setModalVisible(false);
            } else {
                window.alert('Failed to add experience');
            }
        } catch (error) {
            const errorMessage = error.response?.data?.error || error.message || 'Failed to add experience';
            window.alert(errorMessage);
        } finally {
            setIsUpdating(false);
        }
    };

    const handleDeleteExperience = async (experienceId) => {
        if (!window.confirm('Are you sure you want to delete this experience?')) {
            return;
        }

        try {
            const res = await axios.delete(`${baseUrl}/experience/delete/${experienceId}/${doctor.id}`);
            if (res.status === 200 || res.status === 201) {
                window.alert('Experience deleted successfully');
                setExperiences(prevExperiences => prevExperiences.filter(exp => exp.id !== experienceId));
            } else {
                window.alert('Failed to delete experience');
            }
        } catch (error) {
            const errorMessage = error.response?.data?.error || error.message || 'Failed to delete experience';
            window.alert(errorMessage);
        }
    };

    const openModal = (type) => {
        setModalType(type);
        setModalVisible(true);
    };

    const getImageUrl = (imageUrl) => {
        if (!imageUrl) return '';
        if (imageUrl.startsWith('http')) return imageUrl;
        return `https://api.mahadiagno.com/${imageUrl}`;
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl">
                {isFetching ? (
                    <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#009e92] mx-auto"></div>
                        <p className="text-gray-500 mt-4">Loading profile...</p>
                    </div>
                ) : error ? (
                    <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
                        <svg className="mx-auto h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-red-500 mt-4">{error}</p>
                        <button
                            className="mt-4 bg-[#009e92] text-white px-6 py-2 rounded-lg font-semibold hover:bg-[#018177] transition-colors"
                            onClick={fetchDoctorDetails}
                        >
                            Retry
                        </button>
                    </div>
                ) : doctorDetails ? (
                    <div className="space-y-6">
                        {/* Profile Image Section */}
                        <div className="relative bg-white rounded-2xl shadow-sm p-8 text-center overflow-hidden">
                            {/* Gradient wave background */}
                            {/* <div className="absolute inset-0 overflow-hidden">
                                <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#009e92] rounded-full mix-blend-multiply filter blur-xl opacity-10"></div>
                                <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-[#66C9C1] rounded-full mix-blend-multiply filter blur-xl opacity-10"></div>
                                <div className="absolute -top-12 left-1/3 w-48 h-48 bg-[#009e92] rounded-full mix-blend-multiply filter blur-xl opacity-5 animate-pulse"></div>
                            </div> */}

                            {/* Optional subtle SVG curves */}
                            <div className="absolute bottom-0 left-0 w-full opacity-70 overflow-hidden">
                                <svg viewBox="0 0 1000 200" className="w-full h-auto">
                                    <path d="M0,100 C250,50 400,150 600,50 C800,-50 1000,150 1000,100 L1000,200 L0,200 Z" fill="#009e92" />
                                </svg>
                            </div>

                            <div className="relative z-10">
                                <div className="relative inline-block">
                                    <img
                                        src={getImageUrl(doctorDetails.imageUrl)}
                                        alt="Profile"
                                        className="w-32 h-32 rounded-full object-cover border-4 border-gray-100 shadow-md"
                                    />
                                    <label
                                        htmlFor="profile-image"
                                        className="absolute bottom-0 right-0 bg-gradient-to-r from-[#009e92] to-[#66C9C1] p-2.5 rounded-full cursor-pointer hover:opacity-90 transition-all shadow-md"
                                    >
                                        {isUploadingImage ? (
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        ) : (
                                            <Edit className="w-4 h-4 text-white" />
                                        )}
                                        <input
                                            id="profile-image"
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handleImageUpload}
                                            disabled={isUploadingImage}
                                        />
                                    </label>
                                </div>
                                <h2 className="text-2xl font-bold text-gray-800 mt-4">{doctorDetails.displayName}</h2>
                                <p className="text-gray-600 mt-1">{doctorDetails.email}</p>
                            </div>
                        </div>

                        {/* Personal Details Section */}
                        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-gray-800">Personal Details</h3>
                                <button
                                    onClick={() => openModal('doctor')}
                                    className="bg-[#009e92] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[#018177] transition-colors"
                                >
                                    Edit
                                </button>
                            </div>

                            <div className="grid md:grid-cols-2 gap-5">
                                <div className="flex items-start">
                                    <svg className="w-5 h-5 text-gray-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    <div className="ml-3">
                                        <p className="text-sm text-gray-500 mb-1">Full Name</p>
                                        <p className="text-gray-800 font-medium">{doctorDetails.fName} {doctorDetails.lName}</p>
                                    </div>
                                </div>

                                <div className="flex items-start">
                                    <svg className="w-5 h-5 text-gray-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                    <div className="ml-3">
                                        <p className="text-sm text-gray-500 mb-1">Email</p>
                                        <p className="text-gray-800 font-medium">{doctorDetails.email}</p>
                                    </div>
                                </div>

                                <div className="flex items-start">
                                    <svg className="w-5 h-5 text-gray-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                    <div className="ml-3">
                                        <p className="text-sm text-gray-500 mb-1">Phone Number</p>
                                        <p className="text-gray-800 font-medium">{doctorDetails.phoneNumber}</p>
                                    </div>
                                </div>

                                <div className="flex items-start">
                                    <svg className="w-5 h-5 text-gray-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                    </svg>
                                    <div className="ml-3">
                                        <p className="text-sm text-gray-500 mb-1">Display Name</p>
                                        <p className="text-gray-800 font-medium">{doctorDetails.displayName}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Clinic Details Section */}
                        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-gray-800">Clinic Details</h3>
                                <button
                                    onClick={() => openModal('clinic')}
                                    className="bg-[#009e92] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[#018177] transition-colors"
                                >
                                    Edit
                                </button>
                            </div>

                            <div className="space-y-5">
                                <div className="flex items-start">
                                    <svg className="w-5 h-5 text-gray-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                    <div className="ml-3 flex-1">
                                        <p className="text-sm text-gray-500 mb-1">Clinic Name</p>
                                        <p className="text-gray-800 font-medium">{doctorDetails.clinicName}</p>
                                    </div>
                                </div>

                                <div className="flex items-start">
                                    <svg className="w-5 h-5 text-gray-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    <div className="ml-3 flex-1">
                                        <p className="text-sm text-gray-500 mb-1">Clinic Address</p>
                                        <p className="text-gray-800 font-medium">{doctorDetails.clinicAddress}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Education Section */}
                        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-gray-800">Education</h3>
                                <button
                                    onClick={() => openModal('education')}
                                    className="bg-[#009e92] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[#018177] transition-colors"
                                >
                                    Add Education
                                </button>
                            </div>

                            {isFetchingEducation ? (
                                <div className="text-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#009e92] mx-auto"></div>
                                    <p className="text-gray-500 mt-2">Loading educations...</p>
                                </div>
                            ) : educations.length === 0 ? (
                                <p className="text-gray-500 text-center py-8">No education records added yet.</p>
                            ) : (
                                <div className="space-y-4">
                                    {educations.map((edu) => (
                                        <div key={edu.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <h4 className="font-semibold text-gray-800">{edu.courseName}</h4>
                                                    <p className="text-gray-600 mt-1">{edu.universityName}</p>
                                                    <p className="text-sm text-gray-500 mt-1">{edu.yearOfPassing}</p>
                                                </div>
                                                <button
                                                    onClick={() => handleDeleteEducation(edu.id)}
                                                    className="text-red-500 hover:text-red-700 p-2"
                                                >
                                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Experience Section */}
                        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-gray-800">Experience</h3>
                                <button
                                    onClick={() => openModal('experience')}
                                    className="bg-[#009e92] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[#018177] transition-colors"
                                >
                                    Add Experience
                                </button>
                            </div>

                            {isFetchingExperience ? (
                                <div className="text-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#009e92] mx-auto"></div>
                                    <p className="text-gray-500 mt-2">Loading experiences...</p>
                                </div>
                            ) : experiences.length === 0 ? (
                                <p className="text-gray-500 text-center py-8">No experience records added yet.</p>
                            ) : (
                                <div className="space-y-4">
                                    {experiences.map((exp) => (
                                        <div key={exp.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <h4 className="font-semibold text-gray-800">{exp.title}</h4>
                                                    <p className="text-gray-600 mt-1">{exp.hospital}</p>
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <span className="inline-block bg-[#009e92]/10 text-[#009e92] px-3 py-1 rounded-full text-xs font-medium">
                                                            {exp.employmentType}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-gray-500 mt-2">
                                                        {exp.from} - {exp.currentlyWorking ? 'Present' : exp.to}
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() => handleDeleteExperience(exp.id)}
                                                    className="text-red-500 hover:text-red-700 p-2"
                                                >
                                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ) : null}
            </div>

            {/* Update Modal */}
            {isModalVisible && (
                <div className="fixed inset-0 bg-black/40 bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-hidden">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold text-gray-800">
                                    {modalType === 'doctor' ? 'Update Personal Details' : 
                                     modalType === 'clinic' ? 'Update Clinic Details' :
                                     modalType === 'education' ? 'Add Education' :
                                     'Add Experience'}
                                </h2>
                                <button onClick={() => setModalVisible(false)} className="text-gray-400 hover:text-gray-600">
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
                            {modalType === 'doctor' ? (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">First Name *</label>
                                        <input
                                            type="text"
                                            className="w-full border border-gray-300 px-4 py-3 rounded-xl text-gray-700 focus:outline-none focus:border-[#009e92] focus:ring-2 focus:ring-[#009e92]/20"
                                            placeholder="Enter first name"
                                            value={doctorForm.fName}
                                            onChange={(e) => setDoctorForm({ ...doctorForm, fName: e.target.value })}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Last Name *</label>
                                        <input
                                            type="text"
                                            className="w-full border border-gray-300 px-4 py-3 rounded-xl text-gray-700 focus:outline-none focus:border-[#009e92] focus:ring-2 focus:ring-[#009e92]/20"
                                            placeholder="Enter last name"
                                            value={doctorForm.lName}
                                            onChange={(e) => setDoctorForm({ ...doctorForm, lName: e.target.value })}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Display Name *</label>
                                        <input
                                            type="text"
                                            className="w-full border border-gray-300 px-4 py-3 rounded-xl text-gray-700 focus:outline-none focus:border-[#009e92] focus:ring-2 focus:ring-[#009e92]/20"
                                            placeholder="Enter display name"
                                            value={doctorForm.displayName}
                                            onChange={(e) => setDoctorForm({ ...doctorForm, displayName: e.target.value })}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Email *</label>
                                        <input
                                            type="email"
                                            className="w-full border border-gray-300 px-4 py-3 rounded-xl text-gray-700 focus:outline-none focus:border-[#009e92] focus:ring-2 focus:ring-[#009e92]/20"
                                            placeholder="Enter email"
                                            value={doctorForm.email}
                                            onChange={(e) => setDoctorForm({ ...doctorForm, email: e.target.value })}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                                        <input
                                            type="text"
                                            className="w-full border border-gray-300 px-4 py-3 rounded-xl text-gray-400 bg-gray-50"
                                            value={doctorDetails?.phoneNumber || ''}
                                            readOnly
                                            placeholder="Phone number (read only)"
                                        />
                                    </div>
                                </div>
                            ) : modalType === 'education' ? (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Course Name *</label>
                                        <input
                                            type="text"
                                            className="w-full border border-gray-300 px-4 py-3 rounded-xl text-gray-700 focus:outline-none focus:border-[#009e92] focus:ring-2 focus:ring-[#009e92]/20"
                                            placeholder="E.g. MBBS, MD, etc."
                                            value={newEducation.courseName}
                                            onChange={(e) => setNewEducation({ ...newEducation, courseName: e.target.value })}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">University Name *</label>
                                        <input
                                            type="text"
                                            className="w-full border border-gray-300 px-4 py-3 rounded-xl text-gray-700 focus:outline-none focus:border-[#009e92] focus:ring-2 focus:ring-[#009e92]/20"
                                            placeholder="Enter university name"
                                            value={newEducation.universityName}
                                            onChange={(e) => setNewEducation({ ...newEducation, universityName: e.target.value })}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Year of Passing *</label>
                                        <input
                                            type="text"
                                            className="w-full border border-gray-300 px-4 py-3 rounded-xl text-gray-700 focus:outline-none focus:border-[#009e92] focus:ring-2 focus:ring-[#009e92]/20"
                                            placeholder="E.g. 2020"
                                            value={newEducation.yearOfPassing}
                                            onChange={(e) => setNewEducation({ ...newEducation, yearOfPassing: e.target.value })}
                                        />
                                    </div>
                                </div>
                            ) : modalType === 'experience' ? (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Title *</label>
                                        <input
                                            type="text"
                                            className="w-full border border-gray-300 px-4 py-3 rounded-xl text-gray-700 focus:outline-none focus:border-[#009e92] focus:ring-2 focus:ring-[#009e92]/20"
                                            placeholder="E.g. Senior Consultant"
                                            value={newExperience.title}
                                            onChange={(e) => setNewExperience({ ...newExperience, title: e.target.value })}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Hospital *</label>
                                        <input
                                            type="text"
                                            className="w-full border border-gray-300 px-4 py-3 rounded-xl text-gray-700 focus:outline-none focus:border-[#009e92] focus:ring-2 focus:ring-[#009e92]/20"
                                            placeholder="Enter hospital name"
                                            value={newExperience.hospital}
                                            onChange={(e) => setNewExperience({ ...newExperience, hospital: e.target.value })}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Employment Type *</label>
                                        <select
                                            className="w-full border border-gray-300 px-4 py-3 rounded-xl text-gray-700 focus:outline-none focus:border-[#009e92] focus:ring-2 focus:ring-[#009e92]/20"
                                            value={newExperience.employmentType}
                                            onChange={(e) => setNewExperience({ ...newExperience, employmentType: e.target.value })}
                                        >
                                            <option value="">Select employment type</option>
                                            <option value="Full-time">Full-time</option>
                                            <option value="Part-time">Part-time</option>
                                            <option value="Contract">Contract</option>
                                            <option value="Freelance">Freelance</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">From *</label>
                                        <input
                                            type="text"
                                            className="w-full border border-gray-300 px-4 py-3 rounded-xl text-gray-700 focus:outline-none focus:border-[#009e92] focus:ring-2 focus:ring-[#009e92]/20"
                                            placeholder="E.g. Jan 2020"
                                            value={newExperience.from}
                                            onChange={(e) => setNewExperience({ ...newExperience, from: e.target.value })}
                                        />
                                    </div>

                                    <div className="flex items-center gap-2 mb-2">
                                        <input
                                            type="checkbox"
                                            id="currentlyWorking"
                                            className="w-4 h-4 text-[#009e92] border-gray-300 rounded focus:ring-[#009e92]"
                                            checked={newExperience.currentlyWorking}
                                            onChange={(e) => setNewExperience({ 
                                                ...newExperience, 
                                                currentlyWorking: e.target.checked,
                                                to: e.target.checked ? '' : newExperience.to
                                            })}
                                        />
                                        <label htmlFor="currentlyWorking" className="text-sm font-semibold text-gray-700">
                                            I currently work here
                                        </label>
                                    </div>

                                    {!newExperience.currentlyWorking && (
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">To *</label>
                                            <input
                                                type="text"
                                                className="w-full border border-gray-300 px-4 py-3 rounded-xl text-gray-700 focus:outline-none focus:border-[#009e92] focus:ring-2 focus:ring-[#009e92]/20"
                                                placeholder="E.g. Dec 2023"
                                                value={newExperience.to}
                                                onChange={(e) => setNewExperience({ ...newExperience, to: e.target.value })}
                                            />
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Clinic Name *</label>
                                        <input
                                            type="text"
                                            className="w-full border border-gray-300 px-4 py-3 rounded-xl text-gray-700 focus:outline-none focus:border-[#009e92] focus:ring-2 focus:ring-[#009e92]/20"
                                            placeholder="Enter clinic name"
                                            value={clinicForm.clinicName}
                                            onChange={(e) => setClinicForm({ ...clinicForm, clinicName: e.target.value })}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Clinic Address *</label>
                                        <textarea
                                            className="w-full border border-gray-300 px-4 py-3 rounded-xl text-gray-700 focus:outline-none focus:border-[#009e92] focus:ring-2 focus:ring-[#009e92]/20 resize-none"
                                            placeholder="Enter clinic address"
                                            rows={3}
                                            value={clinicForm.clinicAddress}
                                            onChange={(e) => setClinicForm({ ...clinicForm, clinicAddress: e.target.value })}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="p-6 border-t border-gray-200">
                            <button
                                className="w-full bg-[#009e92] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#018177] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                onClick={
                                    modalType === 'doctor' ? handleUpdateDoctor : 
                                    modalType === 'clinic' ? handleUpdateClinic :
                                    modalType === 'education' ? handleAddEducation :
                                    handleAddExperience
                                }
                                disabled={isUpdating}
                            >
                                {isUpdating ? (
                                    <div className="flex items-center justify-center">
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                        {modalType === 'education' || modalType === 'experience' ? 'Adding...' : 'Updating...'}
                                    </div>
                                ) : (
                                    modalType === 'doctor' ? 'Update Personal Details' :
                                    modalType === 'clinic' ? 'Update Clinic Details' :
                                    modalType === 'education' ? 'Add Education' :
                                    'Add Experience'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Profile;
