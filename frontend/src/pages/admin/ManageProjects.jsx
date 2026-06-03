import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import api from '../../services/api';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import toast from 'react-hot-toast';

const ManageProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const { data } = await api.get('/admin/projects');
      setProjects(data);
    } catch (error) {
      toast.error('Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await api.delete(`/admin/projects/${id}`);
        toast.success('Project deleted');
        fetchProjects();
      } catch (error) {
        toast.error('Delete failed');
      }
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <DashboardLayout title="All Projects">
      <div className="card">
        <div className="card-header">
          <div className="card-title">📁 Projects</div>
        </div>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr><th>Project</th><th>Type</th><th>Supervisor</th><th>Status</th><th>Action</th></tr>
            </thead>
            <tbody>
              {projects.map(p => (
                <tr key={p._id}>
                  <td><strong>{p.projectTitle}</strong></td>
                  <td><span className="badge badge-info">{p.type}</span></td>
                  <td>{p.teacherName}</td>
                  <td><span className={`badge ${p.status === 'approved' ? 'badge-success' : p.status === 'rejected' ? 'badge-warning' : 'badge-info'}`}>{p.status}</span></td>
                  <td><button className="btn-sm btn-danger" onClick={() => handleDelete(p._id)}>Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ManageProjects;