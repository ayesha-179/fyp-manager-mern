import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import api from '../../services/api';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import toast from 'react-hot-toast';

const MyProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState({});
  const [editProject, setEditProject] = useState(null);
  const [editForm, setEditForm] = useState({ projectTitle: '', description: '', file: null });

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const { data } = await api.get('/student/projects');
      setProjects(data);
    } catch (error) {
      toast.error('Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkComplete = async (id) => {
    if (window.confirm('Mark this project as complete?')) {
      try {
        await api.put(`/student/complete/${id}`);
        toast.success('Project marked as complete!');
        fetchProjects();
      } catch (error) {
        toast.error('Failed to mark complete');
      }
    }
  };

  const handleAddComment = async (id) => {
    if (!comment[id]?.trim()) {
      toast.error('Please enter a message');
      return;
    }
    try {
      await api.post(`/student/comment/${id}`, { message: comment[id] });
      toast.success('Message sent');
      setComment({ ...comment, [id]: '' });
      fetchProjects();
    } catch (error) {
      toast.error('Failed to send message');
    }
  };

  const handleEditProject = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('projectTitle', editForm.projectTitle);
    formData.append('description', editForm.description);
    if (editForm.file) formData.append('file', editForm.file);

    try {
      await api.put(`/student/project/${editProject._id}`, formData);
      toast.success('Project updated');
      setEditProject(null);
      fetchProjects();
    } catch (error) {
      toast.error('Update failed');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <DashboardLayout title="My Projects">
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{projects.length}</div>
          <div className="stat-label">Total Projects</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{projects.filter(p => p.status === 'approved').length}</div>
          <div className="stat-label">Approved</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{projects.filter(p => p.isCompleted).length}</div>
          <div className="stat-label">Completed</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title">My Projects</div>
          <button className="btn-sm btn-primary" onClick={() => window.location.href = '/student'}>+ New Project</button>
        </div>
        <div className="card-body">
          {projects.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#5a6b5e' }}>No projects yet. Click "New Project" to submit.</div>
          ) : (
            projects.map(project => (
              <div key={project._id} className="group-card">
                <div className="group-header">
                  <div className="group-title">📁 {project.projectTitle}</div>
                  <div>
                    <span className={`badge ${project.status === 'approved' ? 'badge-success' : project.status === 'rejected' ? 'badge-warning' : 'badge-info'}`}>
                      {project.status} {project.isCompleted ? '✓' : ''}
                    </span>
                    <button className="btn-sm btn-outline" onClick={() => { setEditProject(project); setEditForm({ projectTitle: project.projectTitle, description: project.description, file: null }); }} style={{ marginLeft: '0.5rem' }}>Edit</button>
                  </div>
                </div>
                <p><strong>Supervisor:</strong> {project.teacherName}</p>
                <p><strong>Description:</strong> {project.description}</p>
                <p><strong>Members:</strong> {project.members?.map(m => m.studentName).join(', ')}</p>
                {project.fileName && <p><strong>Document:</strong> 📄 {project.fileName}</p>}
                
                <textarea
                  className="form-input"
                  rows="2"
                  placeholder="Ask a question..."
                  value={comment[project._id] || ''}
                  onChange={(e) => setComment({ ...comment, [project._id]: e.target.value })}
                />
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <button className="btn-sm btn-primary" onClick={() => handleAddComment(project._id)}>Send Message</button>
                  {project.status === 'approved' && !project.isCompleted && (
                    <button className="btn-sm btn-success" onClick={() => handleMarkComplete(project._id)}>Mark as Complete</button>
                  )}
                </div>
                
                {project.comments?.length > 0 && (
                  <div style={{ marginTop: '1rem' }}>
                    <strong>💬 Discussion:</strong>
                    {project.comments.map((c, idx) => (
                      <div key={idx} className="comment">
                        <span className="comment-author">{c.userName}</span>
                        <span className="comment-role">({c.userRole})</span>
                        <span className="comment-date">{new Date(c.date).toLocaleString()}</span>
                        <div className="comment-message">{c.message}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {editProject && (
        <div className="modal-overlay" onClick={() => setEditProject(null)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit Project</h3>
              <button className="modal-close" onClick={() => setEditProject(null)}>&times;</button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleEditProject}>
                <input type="text" placeholder="Project Title" value={editForm.projectTitle} onChange={(e) => setEditForm({ ...editForm, projectTitle: e.target.value })} className="form-input" required />
                <textarea placeholder="Description" rows="4" value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} className="form-input" required />
                <div className="file-upload-area" onClick={() => document.getElementById('editFileInput').click()}>
                  {editForm.file ? editForm.file.name : (editProject?.fileName || 'Click to upload new file')}
                  <input type="file" id="editFileInput" style={{ display: 'none' }} accept=".pdf,.doc,.docx,.txt" onChange={(e) => setEditForm({ ...editForm, file: e.target.files[0] })} />
                </div>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                  <button type="button" className="btn-sm btn-outline" onClick={() => setEditProject(null)}>Cancel</button>
                  <button type="submit" className="btn-sm btn-primary">Save Changes</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default MyProjects;