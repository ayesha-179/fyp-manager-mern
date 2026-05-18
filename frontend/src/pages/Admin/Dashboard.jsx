import React from 'react';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
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
            <div className="sidebar-subtitle">Admin Portal</div>
          </div>
        </div>
        <div className="sidebar-nav">
          <div className="sidebar-item active"><i className="fas fa-chart-line"></i> Dashboard</div>
          <div className="sidebar-item" onClick={handleLogout}><i className="fas fa-sign-out-alt"></i> Logout</div>
        </div>
      </div>
      <div className="main-content">
        <div className="top-header">
          <div className="page-title">Admin Dashboard</div>
          <div className="user-profile">
            <div className="user-avatar">A</div>
            <div>
              <div className="user-name">Admin User</div>
              <div className="user-role">Administrator</div>
            </div>
          </div>
        </div>
        <div className="dashboard-content">
          <div className="stats-grid">
            <div className="stat-card"><div className="stat-value">0/14</div><div className="stat-label">Faculty</div></div>
            <div className="stat-card"><div className="stat-value">0</div><div className="stat-label">Students</div></div>
            <div className="stat-card"><div className="stat-value">0</div><div className="stat-label">Proposals</div></div>
            <div className="stat-card"><div className="stat-value">0</div><div className="stat-label">Evaluations</div></div>
          </div>
          <div className="card">
            <div className="card-header"><div className="card-title">Welcome to FYP Manager</div></div>
            <p>Admin dashboard is ready. Connect backend to see data.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;