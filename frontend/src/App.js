import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';

// Pages
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import Settings from './pages/Settings';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageTeachers from './pages/admin/ManageTeachers';
import ManageStudents from './pages/admin/ManageStudents';
import ManageProjects from './pages/admin/ManageProjects';

// Teacher Pages
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import PendingRequests from './pages/teacher/PendingRequests';
import ApprovedGroups from './pages/teacher/ApprovedGroups';
import EvaluationPanel from './pages/teacher/EvaluationPanel';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import MyProjects from './pages/student/MyProjects';
import Supervisors from './pages/student/Supervisors';
import MyEvaluations from './pages/student/MyEvaluations';

// Components
import PrivateRoute from './components/Common/PrivateRoute';

function App() {
  useEffect(() => {
    const bgDiv = document.createElement('div');
    bgDiv.className = 'bg-3d';
    for (let i = 0; i < 25; i++) {
      const orb = document.createElement('div');
      orb.className = 'floating-orb';
      const size = Math.random() * 300 + 80;
      orb.style.width = size + 'px';
      orb.style.height = size + 'px';
      orb.style.left = Math.random() * 100 + '%';
      orb.style.top = Math.random() * 100 + '%';
      orb.style.animationDelay = Math.random() * 20 + 's';
      orb.style.animationDuration = (Math.random() * 20 + 12) + 's';
      bgDiv.appendChild(orb);
    }
    for (let i = 0; i < 40; i++) {
      const particle = document.createElement('div');
      particle.className = 'floating-particle';
      particle.style.left = Math.random() * 100 + '%';
      particle.style.animationDelay = Math.random() * 20 + 's';
      particle.style.animationDuration = (Math.random() * 15 + 8) + 's';
      bgDiv.appendChild(particle);
    }
    document.body.prepend(bgDiv);
    return () => bgDiv.remove();
  }, []);

  return (
    <Router>
      <AuthProvider>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login/:role" element={<Login />} />
          <Route path="/register/:role" element={<Register />} />
          
          <Route path="/admin" element={<PrivateRoute allowedRoles={['admin']}><AdminDashboard /></PrivateRoute>} />
          <Route path="/admin/teachers" element={<PrivateRoute allowedRoles={['admin']}><ManageTeachers /></PrivateRoute>} />
          <Route path="/admin/students" element={<PrivateRoute allowedRoles={['admin']}><ManageStudents /></PrivateRoute>} />
          <Route path="/admin/projects" element={<PrivateRoute allowedRoles={['admin']}><ManageProjects /></PrivateRoute>} />
          
          <Route path="/teacher" element={<PrivateRoute allowedRoles={['teacher']}><TeacherDashboard /></PrivateRoute>} />
          <Route path="/teacher/pending" element={<PrivateRoute allowedRoles={['teacher']}><PendingRequests /></PrivateRoute>} />
          <Route path="/teacher/approved" element={<PrivateRoute allowedRoles={['teacher']}><ApprovedGroups /></PrivateRoute>} />
          <Route path="/teacher/evaluate" element={<PrivateRoute allowedRoles={['teacher']}><EvaluationPanel /></PrivateRoute>} />
          
          <Route path="/student" element={<PrivateRoute allowedRoles={['student']}><StudentDashboard /></PrivateRoute>} />
          <Route path="/student/myprojects" element={<PrivateRoute allowedRoles={['student']}><MyProjects /></PrivateRoute>} />
          <Route path="/student/supervisors" element={<PrivateRoute allowedRoles={['student']}><Supervisors /></PrivateRoute>} />
          <Route path="/student/evaluations" element={<PrivateRoute allowedRoles={['student']}><MyEvaluations /></PrivateRoute>} />
          
          <Route path="/settings" element={<PrivateRoute allowedRoles={['admin', 'teacher', 'student']}><Settings /></PrivateRoute>} />
          
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;