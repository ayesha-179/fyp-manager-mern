import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import api from '../../services/api';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import toast from 'react-hot-toast';

const CRITERIA = [
  "Presentation Skills", "Question Answer Handling", "Tools & Technologies Used",
  "Backend Explanation", "Communication Skills", "Appearance / Professionalism",
  "Confidence Level", "Project Demonstration", "Technical Knowledge"
];

const EvaluationPanel = () => {
  const [completed, setCompleted] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState(null);
  const [evaluations, setEvaluations] = useState([]);

  useEffect(() => {
    fetchCompleted();
  }, []);

  const fetchCompleted = async () => {
    try {
      const { data } = await api.get('/teacher/completed');
      setCompleted(data);
    } catch (error) {
      toast.error('Failed to fetch completed projects');
    } finally {
      setLoading(false);
    }
  };

  const handleEvaluate = (project) => {
    setSelectedProject(project);
    setEvaluations(project.members.map(member => ({
      studentId: member.studentId,
      studentName: member.studentName,
      rollNumber: member.rollNumber,
      scores: Array(9).fill(7),
      feedback: ''
    })));
  };

  const calculateTotal = (scores) => scores.reduce((sum, s) => sum + s, 0);
  const calculateGrade = (total) => {
    if (total >= 90) return 'A+';
    if (total >= 80) return 'A';
    if (total >= 70) return 'B';
    if (total >= 60) return 'C';
    return 'D';
  };

  const handleSaveEvaluations = async () => {
    try {
      for (const evalData of evaluations) {
        await api.post(`/teacher/evaluate/${selectedProject._id}`, {
          studentName: evalData.studentName,
          rollNumber: evalData.rollNumber,
          scores: evalData.scores,
          feedback: evalData.feedback
        });
      }
      toast.success('Evaluations saved successfully!');
      setSelectedProject(null);
      fetchCompleted();
    } catch (error) {
      toast.error('Failed to save evaluations');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <DashboardLayout title="Evaluation Panel">
      <div className="card">
        <div className="card-header">
          <div className="card-title">Projects Ready for Evaluation</div>
        </div>
        <div className="card-body">
          {completed.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#5a6b5e' }}>
              No completed projects ready for evaluation. Ask students to mark projects as complete.
            </div>
          ) : (
            <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
              {completed.map(project => (
                <div key={project._id} className="group-card">
                  <div className="group-title">📁 {project.projectTitle}</div>
                  <p><strong>Students:</strong> {project.members?.map(m => m.studentName).join(', ')}</p>
                  <button className="btn-sm btn-primary" onClick={() => handleEvaluate(project)} style={{ marginTop: '0.5rem', width: '100%' }}>
                    Start Evaluation
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {selectedProject && (
        <div className="modal-overlay" onClick={() => setSelectedProject(null)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Evaluate: {selectedProject.projectTitle}</h3>
              <button className="modal-close" onClick={() => setSelectedProject(null)}>&times;</button>
            </div>
            <div className="modal-body">
              <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                {evaluations.map((member, idx) => (
                  <div key={idx} style={{ marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid #eee' }}>
                    <h4 style={{ color: '#2d523f', marginBottom: '1rem' }}>{member.studentName} (Roll: {member.rollNumber})</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.5rem' }}>
                      {CRITERIA.map((c, i) => (
                        <div key={i}>
                          <label style={{ fontSize: '0.7rem', fontWeight: 600 }}>{c} (0-10)</label>
                          <input
                            type="number"
                            min="0"
                            max="10"
                            value={member.scores[i]}
                            onChange={(e) => {
                              const newEvals = [...evaluations];
                              newEvals[idx].scores[i] = parseInt(e.target.value) || 0;
                              setEvaluations(newEvals);
                            }}
                            className="score-input"
                            style={{ width: '100%' }}
                          />
                        </div>
                      ))}
                    </div>
                    <textarea
                      className="form-input"
                      rows="2"
                      placeholder="Write feedback for this student..."
                      value={member.feedback}
                      onChange={(e) => {
                        const newEvals = [...evaluations];
                        newEvals[idx].feedback = e.target.value;
                        setEvaluations(newEvals);
                      }}
                      style={{ marginTop: '0.5rem' }}
                    />
                    <div style={{ marginTop: '0.5rem', padding: '0.5rem', background: 'rgba(61,107,83,0.1)', borderRadius: '8px' }}>
                      <strong>Total Score:</strong> {calculateTotal(member.scores)}/90 | 
                      <strong> Grade:</strong> {calculateGrade(calculateTotal(member.scores))}
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button className="btn-sm btn-outline" onClick={() => setSelectedProject(null)}>Cancel</button>
                <button className="btn-sm btn-primary" onClick={handleSaveEvaluations}>Save All Evaluations</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default EvaluationPanel;