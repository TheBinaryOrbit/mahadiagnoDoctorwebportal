"use client"

import { Settings, LogOut, Users, Menu, Bell } from "lucide-react"
import { useState, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"

const Header = ({ onMenuClick }) => {
  const baseUrl = import.meta.env.VITE_BASE_URL
  const navigate = useNavigate()

  const [notificationCount, setNotificationCount] = useState(0)
  const [user, setUser] = useState(null)
  const [role, setRole] = useState(null)

  const fetchFollowupCount = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) return

      const response = await fetch(`${baseUrl}/quotations/api/leads/popup/`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) throw new Error("Failed to fetch follow-ups")

      const result = await response.json()

      // Filter leads with today's follow-up date
      const today = new Date().toISOString().split("T")[0]
      const todayFollowups = result.data

      setNotificationCount(todayFollowups.length)
    } catch (error) {
      console.error("Error fetching follow-up count:", error)
    }
  }

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) return

        const response = await fetch(`${baseUrl}/accounts/api/user/current/`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          throw new Error("Failed to fetch user")
        }

        const data = await response.json()
        localStorage.setItem("user", data.data.user.username)
        setUser(data.data.user.username)
        setRole(data.data.user.role)
      } catch (error) {
        console.error("Error fetching user:", error)
      }
    }

    fetchCurrentUser()
    fetchFollowupCount()

    const interval = setInterval(fetchFollowupCount, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const handleLogout = async () => {
    try {
      localStorage.removeItem("isLoggedIn")
      localStorage.removeItem("doctor")
      navigate("/login")
    } catch (err) {
      console.error("Logout API failed:", err)
    }
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Mobile menu icon */}
        <button className="block md:hidden mr-4 focus:outline-none" onClick={onMenuClick} aria-label="Open sidebar">
          <Menu className="w-7 h-7 text-gray-700" />
        </button>
        <div>
          <h1 className="text-2xl hidden md:block font-bold text-gray-900">Doctor Dashboard</h1>
          <p className="text-sm hidden md:block text-gray-500">Manage appointments, patients & reports</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Link to="/profile">
              <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200">
                <Settings className="w-5 h-5" />
              </button>
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-3 py-2 text-sm text-white/70 font-semibold bg-red-600/80 cursor-pointer hover:bg-red-500 rounded-lg transition-colors duration-200 "
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header