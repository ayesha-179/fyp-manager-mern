import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import api from '../../services/api';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import toast from 'react-hot-toast';

const ManageTeachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', department: '' });

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      const { data } = await api.get('/admin/users');
      setTeachers(data.filter(u => u.role === 'teacher'));
    } catch (error) {
      toast.error('Failed to fetch teachers');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/users', { ...formData, role: 'teacher' });
      toast.success('Teacher added');
      setShowModal(false);
      setFormData({ name: '', email: '', password: '', department: '' });
      fetchTeachers();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this teacher?')) {
      try {
        await api.delete(`/admin/users/${id}`);
        toast.success('Teacher deleted');
        fetchTeachers();
      } catch (error) {
        toast.error('Delete failed');
      }
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <DashboardLayout title="Faculty Directory">
      <div className="card">
        <div className="card-header">
          <div className="card-title">👨‍🏫 Teachers</div>
          <button className="btn-sm btn-primary" onClick={() => setShowModal(true)}>+ Add Teacher</button>
        </div>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr><th>Name</th><th>Email</th><th>Department</th><th>Capacity</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {teachers.map(t => (
                <tr key={t._id}>
                  <td><strong>{t.name}</strong></td>
                  <td>{t.email}</td>
                  <td>{t.department || 'CS'}</td>
                  <td>{t.acceptedGroups || 0}/{t.capacity || 4}</td>
                  <td><button className="btn-sm btn-danger" onClick={() => handleDelete(t._id)}>Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add New Teacher</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSubmit}>
                <input type="text" placeholder="Full Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="form-input" required />
                <input type="email" placeholder="Email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="form-input" required />
                <input type="text" placeholder="Department" value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })} className="form-input" />
                <input type="password" placeholder="Password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="form-input" required />
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                  <button type="button" className="btn-sm btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn-sm btn-primary">Add Teacher</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default ManageTeachers;