import { useState } from "react"
import { Link, useLocation } from "react-router-dom"
import {
  LayoutDashboard,
  FileText,
  Users,
  Package,
  Target,
  ChevronDown,
  ChevronRight,
  Plus,
  Eye,
  UserPlus,
  Shield,
  ScrollText,
  SaveAll,
  Menu,
  TargetIcon,
  Calendar,
  Wallet,
  Clock,
  Banknote
} from "lucide-react"
import logo from '../assets/logo.png'

const Sidebar = ({ open, onClose }) => {
  const location = useLocation()
  const [expandedMenus, setExpandedMenus] = useState({})

  const role = localStorage.getItem("role") 

  const toggleMenu = (menuKey) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [menuKey]: !prev[menuKey],
    }))
  }

  const isActive = (path) => location.pathname === path

  const menuItems = [
    {
      key: "dashboard",
      title: "Dashboard",
      icon: LayoutDashboard,
      path: "/dashboard",
    },
    {
      key: "appointments",
      title: "Appointments",
      icon: Calendar,
      hasSubmenu: true,
      subItems: [
        { title: "Scheduled Appointments", path: "/appointments/scheduled", icon: ScrollText },
        { title: "Accepted Appointments", path: "/appointments/accepted", icon: Plus },
        { title: "Completed Appointments", path: "/appointments/completed", icon: SaveAll },
        { title: "In Progress Appointments", path: "/appointments/in-progress", icon: Shield },
        { title: "Rejected Appointments", path: "/appointments/rejected", icon: Eye },
      ],
    },
    {
      key: "wallet",
      title: "Wallet",
      icon: Wallet,
      path: "/wallet",
    },
    {
      key: "payment-method",
      title: "Payment Method",
      icon: Banknote,
      path: "/payment",
    },
    {
      key: "day-timing",
      title: "Day Timing",
      icon: Clock,
      path: "/day-timing",
    },
    {
      key: "slots",
      title: "Slots",
      icon: TargetIcon,
      path: "/slots",
    },
    {
      key: "profile",
      title: "Profile",
      icon: UserPlus,
      path : '/profile',
    }
  ]

  // Responsive: show as overlay on mobile, always visible on desktop
  // Hide on mobile unless open
  return (
    <>
      {/* Overlay for mobile */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm md:hidden"
          onClick={onClose}
        />
      )}
      <div
        className={`
          fixed z-50 top-0 left-0 h-full w-72 bg-white shadow-lg border-r border-gray-200 flex flex-col
          transform transition-transform duration-200
          ${open ? 'translate-x-0' : '-translate-x-full'}
          md:static md:translate-x-0 md:flex
        `}
        style={{ minWidth: 0 }}
      >
  {/* Logo & close button for mobile */}
  <div className="px-6 py-4.5 border-0 border-gray-200 flex items-center justify-between">
        <Link to="/dashboard" className="w-full">
        <div className="w-full h-full flex justify-center items-center ">
            <img src={logo} alt="MahaDiagno Logo" className="w-28 h-14 object-cover scale-125" />
        </div>
        </Link>
        {/* Close button for mobile */}
        <button
          className="block md:hidden ml-2 text-gray-500 hover:text-gray-700 focus:outline-none"
          onClick={onClose}
          aria-label="Close sidebar"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto h-screen">
        {menuItems
          .map((item) => (
            <div key={item.key}>
              {item.hasSubmenu ? (
                <div>
                  <button
                    onClick={() => toggleMenu(item.key)}
                    className="w-full flex items-center justify-between px-3 py-2 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                  >
                    <div className="flex items-center space-x-3">
                      <item.icon className="w-5 h-5" />
                      <span className="font-medium">{item.title}</span>
                    </div>
                    {expandedMenus[item.key] ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </button>

                  {expandedMenus[item.key] && (
                    <div className="ml-6 mt-2 space-y-1">
                      {item.subItems.map((subItem) => (
                        <Link
                        onClick={onClose}
                          key={subItem.path}
                          to={subItem.path}
                          className={`flex items-center space-x-3 px-3 py-2 text-sm rounded-lg transition-colors duration-200 ${
                            isActive(subItem.path)
                              ? "bg-blue-50 text-[#009e92] border-l-4 border-[#009e92]"
                              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                          }`}
                        >
                          <subItem.icon className="w-4 h-4" />
                          <span>{subItem.title}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  to={item.path}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors duration-200 ${
                    isActive(item.path)
                      ? "bg-blue-50 text-[#009e92] border-l-4 border-[#009e92]"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.title}</span>
                </Link>
              )}
            </div>
          ))}
      </nav>

      {/* Quick Links */}
      <div className="p-4 border-t border-gray-200">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">© 2025 MahaDiagno. All Rights Reserved.</h3>
      </div>
      </div>
    
    
    </>
  )
}

export default Sidebar