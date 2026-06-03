import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import api from '../../services/api';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import toast from 'react-hot-toast';

const MyEvaluations = () => {
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvaluations();
  }, []);

  const fetchEvaluations = async () => {
    try {
      const { data } = await api.get('/student/evaluations');
      setEvaluations(data);
    } catch (error) {
      toast.error('Failed to fetch evaluations');
    } finally {
      setLoading(false);
    }
  };

  const getGradeColor = (grade) => {
    switch(grade) {
      case 'A+': return '#2d6a4f';
      case 'A': return '#40916c';
      case 'B': return '#52b788';
      case 'C': return '#d4a56e';
      default: return '#c97a5a';
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <DashboardLayout title="My Evaluations">
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{evaluations.length}</div>
          <div className="stat-label">Total Evaluations</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{evaluations.length ? Math.round(evaluations.reduce((sum, e) => sum + e.totalScore, 0) / evaluations.length) : 0}/90</div>
          <div className="stat-label">Average Score</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title">My Evaluation Results</div>
        </div>
        <div className="card-body">
          {evaluations.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#5a6b5e' }}>
              No evaluations yet. Complete your project first.
            </div>
          ) : (
            evaluations.map(evaluation => (
              <div key={evaluation._id} className="group-card">
                <div className="group-header">
                  <div className="group-title">📊 {evaluation.projectId?.projectTitle || 'Project Evaluation'}</div>
                  <div className="badge" style={{ background: getGradeColor(evaluation.grade), color: 'white' }}>Grade: {evaluation.grade}</div>
                </div>
                <p><strong>Score:</strong> {evaluation.totalScore}/90</p>
                <p><strong>Percentage:</strong> {((evaluation.totalScore / 90) * 100).toFixed(1)}%</p>
                <p><strong>Feedback:</strong> {evaluation.feedback || 'No feedback provided'}</p>
                <p><small>Evaluated on: {new Date(evaluation.date).toLocaleString()}</small></p>
                
                {evaluation.scores?.length > 0 && (
                  <details style={{ marginTop: '0.5rem' }}>
                    <summary style={{ cursor: 'pointer', color: '#3d6b53' }}>View Detailed Scores</summary>
                    <div style={{ marginTop: '0.5rem' }}>
                      {evaluation.scores.map((s, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.2rem 0', borderBottom: '1px solid #eee' }}>
                          <span>{s.criteria}:</span>
                          <span><strong>{s.score}/10</strong></span>
                        </div>
                      ))}
                    </div>
                  </details>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MyEvaluations;