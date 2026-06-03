import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import api from '../../services/api';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import toast from 'react-hot-toast';

const Supervisors = () => {
  const [supervisors, setSupervisors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSupervisors();
  }, []);

  const fetchSupervisors = async () => {
    try {
      const { data } = await api.get('/student/supervisors');
      setSupervisors(data);
    } catch (error) {
      toast.error('Failed to fetch supervisors');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <DashboardLayout title="Available Supervisors">
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{supervisors.length}</div>
          <div className="stat-label">Total Supervisors</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{supervisors.reduce((sum, s) => sum + (s.capacity - s.acceptedGroups), 0)}</div>
          <div className="stat-label">Available Slots</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title">Faculty Supervisors</div>
        </div>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr><th>Name</th><th>Department</th><th>Email</th><th>Available Slots</th></tr>
            </thead>
            <tbody>
              {supervisors.map(s => (
                <tr key={s._id}>
                  <td><strong>{s.name}</strong></td>
                  <td>{s.department || 'CS'}</td>
                  <td>{s.email}</td>
                  <td><span className="badge badge-success">{s.capacity - s.acceptedGroups}/{s.capacity}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Supervisors;