import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import PatientDashboard from './pages/PatientDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import AdminDashboard from './pages/AdminDashboard';
import SymptomChecker from './pages/SymptomChecker';
import CreateAppointment from './pages/CreateAppointment';
import QueueDisplay from './pages/QueueDisplay';
import AppLayout from './components/AppLayout';

const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: string[] }) => {
  const { user, profile, loading } = useAuth();

  if (loading) return <div className="h-screen flex items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (allowedRoles && profile && !allowedRoles.includes(profile.role)) {
    return <Navigate to="/dashboard" />;
  }

  return <>{children}</>;
};

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/queue-public/:hospitalId" element={<QueueDisplay />} />
          
          <Route path="/" element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="/dashboard" />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="patient" element={<ProtectedRoute allowedRoles={['patient']}><PatientDashboard /></ProtectedRoute>} />
            <Route path="doctor" element={<ProtectedRoute allowedRoles={['doctor']}><DoctorDashboard /></ProtectedRoute>} />
            <Route path="admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
            <Route path="symptom-checker" element={<ProtectedRoute allowedRoles={['patient']}><SymptomChecker /></ProtectedRoute>} />
            <Route path="book-appointment" element={<ProtectedRoute allowedRoles={['patient']}><CreateAppointment /></ProtectedRoute>} />
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
}
