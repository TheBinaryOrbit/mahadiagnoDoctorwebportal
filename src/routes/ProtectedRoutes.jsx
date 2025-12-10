import { Navigate } from "react-router-dom"
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { useState } from "react";


const ProtectedRoute = ({ children }) => {
    const IsLogged = localStorage.getItem("isLoggedIn");
    const doctor = localStorage.getItem("doctor")

    if (IsLogged != 'true' || !doctor) {
        return <Navigate to="/login" replace />
    }

    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleSidebarToggle = () => setSidebarOpen((prev) => !prev);

    return (
        <div className="flex h-screen bg-gray-50">
            <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header onMenuClick={handleSidebarToggle} />
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">{children}</main>
            </div>
        </div>
    )
}

export default ProtectedRoute