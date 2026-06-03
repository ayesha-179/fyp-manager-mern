import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import api from '../../services/api';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import toast from 'react-hot-toast';

const ApprovedGroups = () => {
  const [approved, setApproved] = useState([]);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState({});

  useEffect(() => {
    fetchApproved();
  }, []);

  const fetchApproved = async () => {
    try {
      const { data } = await api.get('/teacher/approved');
      setApproved(data);
    } catch (error) {
      toast.error('Failed to fetch approved groups');
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async (id) => {
    if (!comment[id]?.trim()) {
      toast.error('Please enter a message');
      return;
    }
    try {
      await api.post(`/teacher/comment/${id}`, { message: comment[id] });
      toast.success('Message sent');
      setComment({ ...comment, [id]: '' });
      fetchApproved();
    } catch (error) {
      toast.error('Failed to send message');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <DashboardLayout title="My Groups">
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{approved.length}</div>
          <div className="stat-label">Total Groups</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{approved.filter(g => g.isCompleted).length}</div>
          <div className="stat-label">Completed</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title">Approved Groups ({approved.length})</div>
        </div>
        <div className="card-body">
          {approved.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#5a6b5e' }}>No approved groups yet</div>
          ) : (
            approved.map(project => (
              <div key={project._id} className="group-card">
                <div className="group-header">
                  <div className="group-title">📁 {project.projectTitle}</div>
                  <span className={`badge ${project.isCompleted ? 'badge-success' : 'badge-info'}`}>
                    {project.isCompleted ? 'Completed' : 'In Progress'}
                  </span>
                </div>
                <p><strong>Student/Group:</strong> {project.members?.map(m => m.studentName).join(', ')}</p>
                <p><strong>Document:</strong> {project.fileName || 'No file'}</p>
                
                <textarea
                  className="form-input"
                  rows="2"
                  placeholder="Write message..."
                  value={comment[project._id] || ''}
                  onChange={(e) => setComment({ ...comment, [project._id]: e.target.value })}
                />
                <button className="btn-sm btn-primary" onClick={() => handleAddComment(project._id)}>Send Message</button>
                
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
                
                {project.isCompleted && (
                  <button className="btn-sm btn-primary" style={{ marginTop: '0.5rem' }} onClick={() => window.location.href = `/teacher/evaluate?project=${project._id}`}>
                    Evaluate Project
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ApprovedGroups;