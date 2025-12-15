import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from 'react-toastify';
import LeftLogin from "../components/LeftLogin";
import LeftOtpForm from "../components/LeftOtpForm";
import img from '../assets/logo.png'
import doctor from '../assets/doctor.jpg'
import baseUrl from "../utils/baseUrl";
import { useNavigate } from "react-router-dom";

export default function Login() {
    const navigate = useNavigate();
    const [screen, setScreen] = useState("login");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const isLoggedIn = localStorage.getItem("isLoggedIn")
        if (isLoggedIn === 'true') {
            navigate("/dashboard")
        }
    }, [])

    const handleGetOtp = async () => {
        if (!/^\d{10}$/.test(phoneNumber)) {
            toast.error('Please enter a valid 10-digit phone number');
            return;
        }
        setIsLoading(true);
        try {
            const res = await axios.post(`${baseUrl}/doctor/getotp`, {
                phoneNumber
            });

            if (res.status === 200 || res.status === 201) {
                toast.success('OTP sent successfully!');
                setScreen("otp");
            } else {
                toast.error('Failed to send OTP. Please try again.');
            }
        } catch (error) {
            console.error('Error during get OTP:', error);
            const msg = error?.response?.data?.error || error.message || 'Server error';
            toast.error(msg);
        } finally {
            setIsLoading(false);
        }
    }

    const handleLogin = async () => {
        const otpStr = otp.join("");
        if (!/^\d{6}$/.test(otpStr)) {
            toast.error('Please enter a 6-digit OTP');
            return;
        }
        setIsLoading(true);
        try {
            const res = await axios.post(`${baseUrl}/doctor/login`, {
                phoneNumber,
                otp: otpStr,
            });

            if (res.status === 200 || res.status === 201) {
                console.log('Login successful:', res.data.doctor);
                toast.success('Login successful!');
                localStorage.setItem('doctor', JSON.stringify(res.data.doctor));
                localStorage.setItem('isLoggedIn', JSON.stringify(true));
                
                navigate('/dashboard');
            } else {
                toast.error('Login failed. Please check your credentials.');
            }
        } catch (error) {
            console.error('Error during login:', error);
            const msg = error?.response?.data?.error || error.message || 'Server error';
            toast.error(msg);
        } finally {
            setIsLoading(false);
        }
    }

    const renderForm = () => {
        switch (screen) {
            case "login":
                return (
                    <LeftLogin
                        getotp={handleGetOtp}
                        phoneNumber={phoneNumber}
                        setPhoneNumber={setPhoneNumber}
                        isLoading={isLoading}
                    />
                );
            case "otp":
                return (
                    <LeftOtpForm
                        submitotp={handleLogin}
                        otp={otp}
                        setOtp={setOtp}
                        isLoading={isLoading}
                    />
                );
        }
    };

    return (
        <div className="min-h-screen w-full flex flex-col lg:flex-row">
            {/* LEFT SIDE  */}
            <div className="relative flex flex-col justify-start px-6 py-6 sm:px-8 sm:py-8 md:px-12 md:py-10 lg:px-16 lg:w-1/2 xl:w-2/5">
                {/* Logo */}
                <div className="z-50 mt-2 md:mt-4">
                    <img src={img} alt="MahaDiagno Logo" className="w-32 sm:w-40 md:w-44 lg:w-48" />
                </div>


                <div className="z-50 mt-6 sm:mt-8 md:mt-10">
                    <h1 className="text-2xl sm:text-3xl md:text-3xl lg:text-4xl font-bold text-[#0C2E50] leading-relaxed">
                        Welcome back to <br /> MahaDiagno Doctor Portal
                    </h1>

                    <p className="mt-2 sm:mt-3 text-sm sm:text-base text-[#5D5D5D]">
                        Access your Dashboard , Appointments and more at One Place.
                    </p>
                </div>


                <div className="z-50 w-full max-w-md mt-6 sm:mt-8">
                    {renderForm()}
                </div>
            </div>



            {/* RIGHT SIDE */}
            <div className="hidden lg:flex relative text-white bg-transparent lg:w-1/2 xl:w-3/5">

                {/* Background Image */}
                <div
                    className="absolute inset-0 z-10"
                    style={{
                        backgroundImage: doctor ? `url(${doctor})` : "",
                        backgroundRepeat: "no-repeat",
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                    }}
                />

                {/* Fading Overlay (your colors) */}
                <div className="absolute inset-0 z-20 bg-gradient-to-b from-[dcf2f6]/90  to-[#009e92]/50" />

                {/* Content */}
                <div className="z-30 flex flex-col justify-end w-full px-8 lg:px-12 xl:px-16 py-10">
                    <div>
                        <h2 className="text-3xl lg:text-4xl xl:text-5xl font-bold">MahaDiagno</h2>
                        <p className="mt-1 text-2xl lg:text-3xl xl:text-4xl">
                            Simplifying Diagnostics, Empowering Healthcare
                        </p>
                    </div>
                </div>
            </div>


        </div>
    );
}
