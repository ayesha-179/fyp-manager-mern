import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import api from '../../services/api';
import LoadingSpinner from '../../components/Common/LoadingSpinner';

const TeacherDashboard = () => {
  const [stats, setStats] = useState({
    pendingRequests: 0,
    acceptedGroups: 0,
    completedProjects: 0,
    capacity: 4,
    acceptedGroupsCount: 0,
    evaluationsCount: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { data } = await api.get('/teacher/stats');
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <DashboardLayout title="Dashboard">
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{stats.pendingRequests}</div>
          <div className="stat-label">Pending</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.acceptedGroups}</div>
          <div className="stat-label">Approved</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.completedProjects}</div>
          <div className="stat-label">Completed</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.acceptedGroupsCount}/{stats.capacity}</div>
          <div className="stat-label">Capacity</div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${(stats.acceptedGroupsCount / stats.capacity) * 100}%` }}></div>
          </div>
        </div>
      </div>
      <div className="card">
        <div className="card-header">
          <div className="card-title">Welcome, {localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).name : 'Teacher'}</div>
        </div>
        <div className="card-body">
          <p>Manage pending requests, review documents, and evaluate completed projects.</p>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', flexWrap: 'wrap' }}>
            <button className="btn-sm btn-primary" onClick={() => window.location.href = '/teacher/pending'}>View Pending Requests</button>
            <button className="btn-sm btn-outline" onClick={() => window.location.href = '/teacher/approved'}>My Approved Groups</button>
            <button className="btn-sm btn-outline" onClick={() => window.location.href = '/teacher/evaluate'}>Evaluation Panel</button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TeacherDashboard;