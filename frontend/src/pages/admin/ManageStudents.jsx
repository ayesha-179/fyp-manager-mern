import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import api from '../../services/api';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import toast from 'react-hot-toast';

const ManageStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', rollNumber: '' });

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const { data } = await api.get('/admin/users');
      setStudents(data.filter(u => u.role === 'student'));
    } catch (error) {
      toast.error('Failed to fetch students');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/users', { ...formData, role: 'student' });
      toast.success('Student added');
      setShowModal(false);
      setFormData({ name: '', email: '', password: '', rollNumber: '' });
      fetchStudents();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      try {
        await api.delete(`/admin/users/${id}`);
        toast.success('Student deleted');
        fetchStudents();
      } catch (error) {
        toast.error('Delete failed');
      }
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <DashboardLayout title="Student Directory">
      <div className="card">
        <div className="card-header">
          <div className="card-title">🎓 Students</div>
          <button className="btn-sm btn-primary" onClick={() => setShowModal(true)}>+ Add Student</button>
        </div>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr><th>Name</th><th>Roll Number</th><th>Email</th><th>Type</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {students.map(s => (
                <tr key={s._id}>
                  <td><strong>{s.name}</strong></td>
                  <td>{s.rollNumber || '-'}</td>
                  <td>{s.email}</td>
                  <td>{s.isGroup ? <span className="badge badge-info">Group</span> : <span className="badge badge-success">Individual</span>}</td>
                  <td><button className="btn-sm btn-danger" onClick={() => handleDelete(s._id)}>Delete</button></td>
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
              <h3>Add New Student</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSubmit}>
                <input type="text" placeholder="Full Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="form-input" required />
                <input type="email" placeholder="Email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="form-input" required />
                <input type="text" placeholder="Roll Number" value={formData.rollNumber} onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })} className="form-input" required />
                <input type="password" placeholder="Password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="form-input" required />
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                  <button type="button" className="btn-sm btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn-sm btn-primary">Add Student</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default ManageStudents;