import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import api from '../../services/api';
import LoadingSpinner from '../../components/Common/LoadingSpinner';

const AdminDashboard = () => {
  const [stats, setStats] = useState({ teachers: 0, students: 0, projects: 0, evaluations: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { data } = await api.get('/admin/stats');
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
          <div className="stat-icon">👨‍🏫</div>
          <div className="stat-value">{stats.teachers}/14</div>
          <div className="stat-label">Faculty</div>
          <div className="progress-bar"><div className="progress-fill" style={{ width: `${(stats.teachers/14)*100}%` }}></div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🎓</div>
          <div className="stat-value">{stats.students}</div>
          <div className="stat-label">Students</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📁</div>
          <div className="stat-value">{stats.projects}</div>
          <div className="stat-label">Projects</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⭐</div>
          <div className="stat-value">{stats.evaluations}</div>
          <div className="stat-label">Evaluations</div>
        </div>
      </div>
      <div className="card">
        <div className="card-header">
          <div className="card-title">System Overview</div>
        </div>
        <div className="card-body">
          <p>Welcome to Admin Dashboard. Manage faculty, students, and projects.</p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;