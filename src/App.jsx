import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import ProtectedRoute from './routes/ProtectedRoutes'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Wallet from './pages/Wallet'
import PaymentMethod from './pages/PaymentMethod'
import Timing from './pages/Timing'
import Slots from './pages/Slots'
import Profile from './pages/Profile'
import Appointment from './pages/Appointment'
import AppointmentDetail from './pages/AppointmentDetail'
import Videocall from './pages/Videocall'

function App() {
  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />

        <Route path='/dashboard' element={<ProtectedRoute> <Dashboard /> </ProtectedRoute>} />
        <Route path='/wallet' element={<ProtectedRoute> <Wallet /> </ProtectedRoute>} />
        <Route path='/payment' element={<ProtectedRoute> <PaymentMethod /> </ProtectedRoute>} />
        <Route path='/day-timing' element={<ProtectedRoute> <Timing /> </ProtectedRoute>} />
        <Route path='/slots' element={<ProtectedRoute> <Slots /> </ProtectedRoute>} />
        <Route path='/profile' element={<ProtectedRoute> <Profile /> </ProtectedRoute>} />
        <Route path='/appointments' element={<ProtectedRoute> <Appointment /> </ProtectedRoute>} />

        <Route path="/appointments/completed" element={<ProtectedRoute><Appointment status="COMPLETED" /></ProtectedRoute>} />
        <Route path="/appointments/accepted" element={<ProtectedRoute><Appointment status="ACCEPTED" /></ProtectedRoute>} />
        <Route path="/appointments/scheduled" element={<ProtectedRoute><Appointment status="SCHEDULED" /></ProtectedRoute>} />
        <Route path="/appointments/rejected" element={<ProtectedRoute><Appointment status="REJECTED" /></ProtectedRoute>} />
        <Route path="/appointments/in-progress" element={<ProtectedRoute><Appointment status="IN_PROGRESS" /></ProtectedRoute>} />


        <Route path="/appointment/:id" element={<ProtectedRoute><AppointmentDetail /></ProtectedRoute>} />
        <Route path="/video-call/:callId" element={<Videocall />} />

        <Route path="*" element={<div>404 Not Found</div>} />
      </Routes>
    </Router>
    </>
  )
}

export default App
