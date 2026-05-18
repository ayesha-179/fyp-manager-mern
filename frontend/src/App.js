import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyEmail from './pages/VerifyEmail';
import AdminDashboard from './pages/Admin/Dashboard';
import TeacherDashboard from './pages/Teacher/Dashboard';
import StudentDashboard from './pages/Student/Dashboard';

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/verify" element={<VerifyEmail />} />
      <Route path="/admin/*" element={user?.role === 'admin' ? <AdminDashboard /> : <Navigate to="/login" />} />
      <Route path="/teacher/*" element={user?.role === 'teacher' ? <TeacherDashboard /> : <Navigate to="/login" />} />
      <Route path="/student/*" element={user?.role === 'student' ? <StudentDashboard /> : <Navigate to="/login" />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" />
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;