import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getProposals, approveProposal, createEvaluation, getComments, addComment, getFiles } from '../../services/api';
import toast from 'react-hot-toast';

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [proposals, setProposals] = useState([]);
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [showEvalModal, setShowEvalModal] = useState(false);
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [files, setFiles] = useState([]);
  const [evalData, setEvalData] = useState({ presentationSkills: 7, technicalKnowledge: 7, problemHandling: 7, toolUsage: 7, qaHandling: 7, documentation: 7, feedback: '' });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try { const res = await getProposals(); setProposals(res.data.data); }
    catch (error) { toast.error('Failed to load'); }
    finally { setLoading(false); }
  };

  const loadComments = async (id) => { try { const res = await getComments(id); setComments(res.data.data); } catch (error) {} };
  const loadFiles = async (id) => { try { const res = await getFiles(id); setFiles(res.data.data); } catch (error) {} };

  const handleAccept = async (id) => {
    try { await approveProposal(id); toast.success('Proposal accepted!'); loadData(); }
    catch (error) { toast.error(error.response?.data?.message); }
  };

  const handleEvaluate = async () => {
    try {
      await createEvaluation({ proposalId: selectedProposal._id, criteria: evalData, feedback: evalData.feedback });
      toast.success('Evaluation submitted!');
      setShowEvalModal(false); loadData();
    } catch (error) { toast.error('Failed to submit'); }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    try {
      await addComment({ text: newComment, proposalId: selectedProposal._id });
      setNewComment('');
      loadComments(selectedProposal._id);
      toast.success('Comment added!');
    } catch (error) { toast.error('Failed'); }
  };

  const pending = proposals.filter(p => p.status === 'pending');
  const approved = proposals.filter(p => p.status === 'approved');
  const getScorePreview = () => {
    const total = Object.values(evalData).slice(0,6).reduce((a,b)=>a+b,0);
    const percentage = (total/60)*100;
    let grade = 'F';
    if (percentage >= 90) grade = 'A+';
    else if (percentage >= 80) grade = 'A';
    else if (percentage >= 70) grade = 'B+';
    else if (percentage >= 60) grade = 'B';
    else if (percentage >= 50) grade = 'C';
    else if (percentage >= 40) grade = 'D';
    return { total, percentage, grade };
  };

  if (loading) return <div className="dashboard-content">Loading...</div>;

  return (
    <div className="dashboard-wrapper">
      <div className="sidebar">
        <div className="sidebar-header"><div className="sidebar-logo">🏛️</div><div><div className="sidebar-title">FYP Manager</div><div className="sidebar-subtitle">Faculty Portal</div></div></div>
        <div className="sidebar-nav"><div className="sidebar-item active"><i className="fas fa-chart-line"></i> Dashboard</div><div className="sidebar-item" onClick={logout}><i className="fas fa-sign-out-alt"></i> Logout</div></div>
      </div>
      <div className="main-content">
        <div className="top-header"><div className="page-title">Faculty Dashboard</div><div className="user-profile"><div className="user-avatar">{user?.name?.charAt(0)}</div><div><div className="user-name">{user?.name}</div><div className="user-role">Professor</div></div></div></div>
        <div className="dashboard-content">
          <div className="stats-grid">
            <div className="stat-card"><div className="stat-value">{pending.length}</div><div className="stat-label">Pending</div></div>
            <div className="stat-card"><div className="stat-value">{approved.length}</div><div className="stat-label">Approved</div></div>
            <div className="stat-card"><div className="stat-value">{user?.profile?.capacity - user?.profile?.acceptedGroups || 3}</div><div className="stat-label">Available Slots</div></div>
          </div>
          <div className="card"><div className="card-header"><div className="card-title">Pending Proposals</div></div>{pending.length === 0 ? '<p>No pending proposals.</p>' : `<div class="table-container"><table class="data-table"><thead><tr><th>Student</th><th>Project Title</th><th>Actions</th></tr></thead><tbody>${pending.map(p => `<tr><td><strong>${p.studentName}</strong></td><td>${p.title}</td><td><button class="btn-sm btn-success" onclick="window.acceptProposal('${p._id}', '${user.id}')">Accept</button> <button class="btn-sm btn-primary" onclick="window.openCommentsModal('${p._id}', '${p.title}')">Discuss</button> <button class="btn-sm btn-outline" onclick="window.viewFiles('${p._id}')">Files</button></td></tr>`).join('')}</tbody></table></div>`}</div>
          <div className="card"><div className="card-header"><div className="card-title">Approved Projects</div></div>{approved.length === 0 ? '<p>No approved projects.</p>' : `<div class="table-container"><table class="data-table"><thead><tr><th>Student</th><th>Project Title</th><th>Status</th><th>Actions</th></tr></thead><tbody>${approved.map(p => `<tr><td><strong>${p.studentName}</strong></td><td>${p.title}</td><td><span class="badge badge-success">Approved</span></td><td><button class="btn-sm btn-primary" onclick="window.openCommentsModal('${p._id}', '${p.title}')">Discuss</button> <button class="btn-sm btn-outline" onclick="window.viewFiles('${p._id}')">Files</button> ${p.isCompleted ? `<button class="btn-sm btn-warning" onclick="window.openEvaluationModal('${p._id}', '${p.title}', '${p.studentId}', '${p.studentName}')">Evaluate</button>` : '<span class="badge badge-info">Awaiting completion</span>'}</td></tr>`).join('')}</tbody></table></div>`}</div>
        </div>
      </div>
      {showEvalModal && <div className="modal-overlay"><div className="modal-content"><div className="modal-header"><h3>Evaluate Project</h3><button onClick={() => setShowEvalModal(false)}>&times;</button></div><div className="modal-body"><p><strong>{selectedProposal?.title}</strong></p><div className="grade-input-group"><label>Presentation Skills</label><input type="number" min="0" max="10" value={evalData.presentationSkills} onChange={(e) => setEvalData({...evalData, presentationSkills: parseInt(e.target.value)})} className="grade-input" /></div><div className="grade-input-group"><label>Technical Knowledge</label><input type="number" min="0" max="10" value={evalData.technicalKnowledge} onChange={(e) => setEvalData({...evalData, technicalKnowledge: parseInt(e.target.value)})} className="grade-input" /></div><div className="grade-input-group"><label>Problem Handling</label><input type="number" min="0" max="10" value={evalData.problemHandling} onChange={(e) => setEvalData({...evalData, problemHandling: parseInt(e.target.value)})} className="grade-input" /></div><div className="grade-input-group"><label>Tool Usage</label><input type="number" min="0" max="10" value={evalData.toolUsage} onChange={(e) => setEvalData({...evalData, toolUsage: parseInt(e.target.value)})} className="grade-input" /></div><div className="grade-input-group"><label>Q&A Handling</label><input type="number" min="0" max="10" value={evalData.qaHandling} onChange={(e) => setEvalData({...evalData, qaHandling: parseInt(e.target.value)})} className="grade-input" /></div><div className="grade-input-group"><label>Documentation</label><input type="number" min="0" max="10" value={evalData.documentation} onChange={(e) => setEvalData({...evalData, documentation: parseInt(e.target.value)})} className="grade-input" /></div><div className="score-preview"><strong>Score:</strong> {getScorePreview().total}/60 ({getScorePreview().percentage.toFixed(1)}%) - Grade: {getScorePreview().grade}</div><div className="form-group"><label>Feedback</label><textarea rows="3" value={evalData.feedback} onChange={(e) => setEvalData({...evalData, feedback: e.target.value})}></textarea></div></div><div className="modal-footer"><button className="btn-sm btn-primary" onClick={handleEvaluate}>Submit</button><button className="btn-sm btn-outline" onClick={() => setShowEvalModal(false)}>Cancel</button></div></div></div>}
    </div>
  );
};

export default TeacherDashboard;