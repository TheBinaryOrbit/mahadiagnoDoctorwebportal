import { useState, useEffect } from 'react';

export const useGetDoctor = () => {
    const [doctor, setDoctor] = useState(null);

    useEffect(() => {
        try {
            const doctorData = localStorage.getItem('doctor');
            if (doctorData) {
                setDoctor(JSON.parse(doctorData));
            }
        } catch (error) {
            console.error('Error fetching doctor data:', error);
        }
    }, []);

    return doctor;
};
