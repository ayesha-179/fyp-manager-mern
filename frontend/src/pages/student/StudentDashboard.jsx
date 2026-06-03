import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import api from '../../services/api';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import toast from 'react-hot-toast';

const StudentDashboard = () => {
  const [stats, setStats] = useState({ totalProjects: 0, approvedProjects: 0, completedProjects: 0, evaluationsCount: 0 });
  const [supervisors, setSupervisors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [formData, setFormData] = useState({ projectTitle: '', description: '', teacherId: '', file: null });

  useEffect(() => {
    fetchStats();
    fetchSupervisors();
  }, []);

  const fetchStats = async () => {
    try {
      const { data } = await api.get('/student/stats');
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSupervisors = async () => {
    try {
      const { data } = await api.get('/student/supervisors');
      setSupervisors(data);
    } catch (error) {
      console.error('Error fetching supervisors:', error);
    }
  };

  const handleSubmitProject = async (e) => {
    e.preventDefault();
    const formDataToSend = new FormData();
    formDataToSend.append('projectTitle', formData.projectTitle);
    formDataToSend.append('description', formData.description);
    formDataToSend.append('teacherId', formData.teacherId);
    if (formData.file) formDataToSend.append('file', formData.file);

    try {
      await api.post('/student/project', formDataToSend);
      toast.success('Project submitted successfully!');
      setShowProjectModal(false);
      setFormData({ projectTitle: '', description: '', teacherId: '', file: null });
      fetchStats();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to submit project');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <DashboardLayout title="Dashboard">
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{stats.totalProjects}</div>
          <div className="stat-label">My Projects</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.approvedProjects}</div>
          <div className="stat-label">Approved</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.completedProjects}</div>
          <div className="stat-label">Completed</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.evaluationsCount}</div>
          <div className="stat-label">Evaluations</div>
        </div>
      </div>
      <div className="card">
        <div className="card-header">
          <div className="card-title">Welcome, {localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).name : 'Student'}</div>
        </div>
        <div className="card-body">
          <p>{localStorage.getItem('user') && JSON.parse(localStorage.getItem('user')).isGroup ? 'Group account - All members will be evaluated individually.' : 'Individual account - Submit and track your project.'}</p>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', flexWrap: 'wrap' }}>
            <button className="btn-sm btn-primary" onClick={() => setShowProjectModal(true)}>+ Submit New Project</button>
            <button className="btn-sm btn-outline" onClick={() => window.location.href = '/student/myprojects'}>My Projects</button>
            <button className="btn-sm btn-outline" onClick={() => window.location.href = '/student/supervisors'}>Browse Supervisors</button>
          </div>
        </div>
      </div>

      {showProjectModal && (
        <div className="modal-overlay" onClick={() => setShowProjectModal(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Submit New Project</h3>
              <button className="modal-close" onClick={() => setShowProjectModal(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSubmitProject}>
                <input
                  type="text"
                  placeholder="Project Title"
                  value={formData.projectTitle}
                  onChange={(e) => setFormData({ ...formData, projectTitle: e.target.value })}
                  className="form-input"
                  required
                />
                <textarea
                  placeholder="Project Description"
                  rows="4"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="form-input"
                  required
                />
                <select
                  value={formData.teacherId}
                  onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
                  className="form-input"
                  required
                >
                  <option value="">Select Supervisor</option>
                  {supervisors.map(s => (
                    <option key={s._id} value={s._id}>
                      {s.name} ({s.department}) - {s.capacity - s.acceptedGroups} slots available
                    </option>
                  ))}
                </select>
                <div className="file-upload-area" onClick={() => document.getElementById('fileInput').click()}>
                  {formData.file ? formData.file.name : 'Click to upload document (PDF, DOC, TXT)'}
                  <input type="file" id="fileInput" style={{ display: 'none' }} accept=".pdf,.doc,.docx,.txt" onChange={(e) => setFormData({ ...formData, file: e.target.files[0] })} />
                </div>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                  <button type="button" className="btn-sm btn-outline" onClick={() => setShowProjectModal(false)}>Cancel</button>
                  <button type="submit" className="btn-sm btn-primary">Submit Project</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default StudentDashboard;