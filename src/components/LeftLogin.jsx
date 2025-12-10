

export default function LeftLogin({ getotp, phoneNumber, setPhoneNumber, isLoading }) {
  return (
    <div className="flex flex-col">
      <h2 className="text-lg sm:text-xl font-semibold text-[#009e92]">Enter Phone Number</h2>

      <input
        placeholder="Enter your Phone Number"
        type="tel"
        maxLength={10}
        value={phoneNumber}
        onChange={(e) => setPhoneNumber(e.target.value.replace(/[^0-9]/g, ''))}
        className="w-full px-3 py-2 sm:px-4 sm:py-3 mt-4 border border-gray-300 rounded-lg focus:outline-none focus:border-[#009e92] text-sm sm:text-base"
      />
      <div className="mt-2 text-right">
        <span className="text-xs sm:text-sm text-[#66C9C1] cursor-pointer font-semibold" >
          Resend OTP?
        </span>
      </div>

      <button
        className="w-full bg-[#009e92] text-white mt-4 sm:mt-6 py-2.5 sm:py-3 rounded-lg font-medium text-sm sm:text-base cursor-pointer hover:bg-[#018177] transition-colors"
        onClick={getotp}
        disabled={isLoading}
      >
        {isLoading ? 'Sending...' : 'Send OTP'}
      </button>
    </div>
  );
}
