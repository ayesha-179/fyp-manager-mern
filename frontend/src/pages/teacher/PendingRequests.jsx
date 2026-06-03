import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import api from '../../services/api';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import toast from 'react-hot-toast';

const PendingRequests = () => {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState({});

  useEffect(() => {
    fetchPending();
  }, []);

  const fetchPending = async () => {
    try {
      const { data } = await api.get('/teacher/pending');
      setPending(data);
    } catch (error) {
      toast.error('Failed to fetch pending requests');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (id) => {
    try {
      await api.put(`/teacher/accept/${id}`);
      toast.success('Project accepted');
      fetchPending();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Accept failed');
    }
  };

  const handleReject = async (id) => {
    try {
      await api.put(`/teacher/reject/${id}`);
      toast.success('Project rejected');
      fetchPending();
    } catch (error) {
      toast.error('Reject failed');
    }
  };

  const handleAddComment = async (id) => {
    if (!comment[id]?.trim()) {
      toast.error('Please enter a comment');
      return;
    }
    try {
      await api.post(`/teacher/comment/${id}`, { message: comment[id] });
      toast.success('Comment added');
      setComment({ ...comment, [id]: '' });
      fetchPending();
    } catch (error) {
      toast.error('Failed to add comment');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <DashboardLayout title="Pending Requests">
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{pending.length}</div>
          <div className="stat-label">Total Pending</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{pending.filter(p => p.status === 'pending').length}</div>
          <div className="stat-label">Awaiting Review</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title">Pending Requests ({pending.length})</div>
        </div>
        <div className="card-body">
          {pending.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#5a6b5e' }}>No pending requests</div>
          ) : (
            pending.map(project => (
              <div key={project._id} className="group-card">
                <div className="group-header">
                  <div className="group-title">📁 {project.projectTitle}</div>
                  <div>
                    <button className="btn-sm btn-success" onClick={() => handleAccept(project._id)} style={{ marginRight: '0.5rem' }}>Accept</button>
                    <button className="btn-sm btn-danger" onClick={() => handleReject(project._id)}>Reject</button>
                  </div>
                </div>
                <p><strong>Student/Group:</strong> {project.members?.map(m => m.studentName).join(', ')}</p>
                <p><strong>Submitted:</strong> {new Date(project.submittedAt).toLocaleDateString()}</p>
                <p><strong>Description:</strong> {project.description}</p>
                {project.fileName && <p><strong>Document:</strong> 📄 {project.fileName}</p>}
                
                <textarea
                  className="form-input"
                  rows="2"
                  placeholder="Write feedback..."
                  value={comment[project._id] || ''}
                  onChange={(e) => setComment({ ...comment, [project._id]: e.target.value })}
                />
                <button className="btn-sm btn-primary" onClick={() => handleAddComment(project._id)}>Send Feedback</button>
                
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
    </DashboardLayout>
  );
};

export default PendingRequests;