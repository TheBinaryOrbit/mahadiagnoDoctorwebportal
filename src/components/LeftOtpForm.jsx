import { useEffect, useRef, useState } from "react";

export default function LeftOtpForm({ submitotp, otp, setOtp, isLoading }) {
  const [timer, setTimer] = useState(60);
  const inputRefs = useRef([]);

  useEffect(() => {
    if (timer === 0) return;
    const t = setInterval(() => setTimer((prev) => prev - 1), 1000);
    return () => clearInterval(t);
  }, [timer]);

  const handleChange = (value, index) => {
    if (!/^[0-9]?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value !== "" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && otp[index] === "" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between">
        <h2 className="text-lg sm:text-xl font-semibold text-[#009e92]">Enter OTP</h2>

        <span className="text-xs sm:text-sm font-medium text-gray-700">
          {timer > 0 ? `${timer} Sec` : ""}
        </span>
      </div>

      <div className="flex gap-2 sm:gap-3 mt-4 sm:mt-6 justify-between sm:justify-start">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <input
            key={i}
            maxLength={1}
            ref={(el) => {
              inputRefs.current[i] = el;
            }}
            value={otp[i]}
            onChange={(e) => handleChange(e.target.value, i)}
            onKeyDown={(e) => handleKeyDown(e, i)}
            className="
              w-10 h-11 sm:w-12 sm:h-14 md:w-14 md:h-16
              border border-gray-300 
              rounded-lg 
              text-center 
              text-base sm:text-lg md:text-xl
              focus:border-[#009e92] 
              outline-none
              text-black
            "
          />
        ))}
      </div>

      <p className="mt-3 sm:mt-4 text-xs sm:text-sm text-gray-600">
        Didn't receive a code?{" "}
        {timer === 0 ? (
          <span
            onClick={() => setTimer(60)}
            className="text-red-600 cursor-pointer font-medium"
          >
            Resend Code
          </span>
        ) : (
          <span className="text-gray-500">Wait...</span>
        )}
      </p>

      <button
        onClick={submitotp}
        className="w-full bg-[#009e92] text-white mt-4 sm:mt-6 py-2.5 sm:py-3 rounded-lg font-medium text-sm sm:text-base cursor-pointer hover:bg-[#018177] transition-colors"
        disabled={isLoading}
      >
        {isLoading ? 'Verifying...' : 'Proceed'}
      </button>
    </div>
  );
}
