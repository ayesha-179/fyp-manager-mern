import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const DashboardLayout = ({ children, title }) => {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const getNavItems = () => {
    if (user?.role === 'admin') {
      return [
        { id: 'dashboard', label: 'Dashboard', path: '/admin' },
        { id: 'teachers', label: 'Teachers', path: '/admin/teachers' },
        { id: 'students', label: 'Students', path: '/admin/students' },
        { id: 'projects', label: 'Projects', path: '/admin/projects' }
      ];
    } else if (user?.role === 'teacher') {
      return [
        { id: 'dashboard', label: 'Dashboard', path: '/teacher' },
        { id: 'pending', label: 'Pending Requests', path: '/teacher/pending' },
        { id: 'approved', label: 'My Groups', path: '/teacher/approved' },
        { id: 'evaluate', label: 'Evaluate', path: '/teacher/evaluate' }
      ];
    } else {
      return [
        { id: 'dashboard', label: 'Overview', path: '/student' },
        { id: 'myprojects', label: 'My Projects', path: '/student/myprojects' },
        { id: 'supervisors', label: 'Supervisors', path: '/student/supervisors' },
        { id: 'evaluations', label: 'Evaluations', path: '/student/evaluations' }
      ];
    }
  };

  const navItems = getNavItems();
  const isActive = (path) => location.pathname === path;

  return (
    <div className="app-layout">
      <div className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.5rem' }}>🌿</span>
            <span>FYP Manager</span>
          </div>
        </div>
        <div className="nav-menu">
          {navItems.map(item => (
            <div
              key={item.id}
              className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
              onClick={() => navigate(item.path)}
            >
              {item.label}
            </div>
          ))}
          <div className="nav-item" onClick={() => navigate('/settings')}>
            Settings
          </div>
          <div className="nav-item logout" onClick={logout}>
            Logout
          </div>
        </div>
      </div>
      <button className="menu-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>☰</button>
      <div className="main-content">
        <div style={{ marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#2d523f' }}>{title}</h1>
          <p style={{ color: '#5a6b5e', marginTop: '0.25rem' }}>Welcome back, {user?.name}</p>
        </div>
        {children}
      </div>
    </div>
  );
};

export default DashboardLayout;