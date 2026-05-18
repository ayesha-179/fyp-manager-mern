import React from 'react';
import { useNavigate } from 'react-router-dom';

const StudentDashboard = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    <div className="dashboard-wrapper">
      <div className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">🏛️</div>
          <div>
            <div className="sidebar-title">FYP Manager</div>
            <div className="sidebar-subtitle">Student Portal</div>
          </div>
        </div>
        <div className="sidebar-nav">
          <div className="sidebar-item active"><i className="fas fa-chart-line"></i> Dashboard</div>
          <div className="sidebar-item" onClick={handleLogout}><i className="fas fa-sign-out-alt"></i> Logout</div>
        </div>
      </div>
      <div className="main-content">
        <div className="top-header">
          <div className="page-title">Student Dashboard</div>
          <div className="user-profile">
            <div className="user-avatar">S</div>
            <div>
              <div className="user-name">Student User</div>
              <div className="user-role">Student</div>
            </div>
          </div>
        </div>
        <div className="dashboard-content">
          <div className="stats-grid">
            <div className="stat-card"><div className="stat-value">0</div><div className="stat-label">Projects</div></div>
            <div className="stat-card"><div className="stat-value">0</div><div className="stat-label">Approved</div></div>
            <div className="stat-card"><div className="stat-value">0</div><div className="stat-label">Completed</div></div>
            <div className="stat-card"><div className="stat-value">0%</div><div className="stat-label">Average Score</div></div>
          </div>
          <div className="card">
            <div className="card-header"><div className="card-title">Welcome Student</div></div>
            <p>Student dashboard is ready. Connect backend to submit proposals.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;