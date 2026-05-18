import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerAdmin, registerTeacher, registerStudent } from '../services/api';
import toast from 'react-hot-toast';

const Register = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState('student');
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    department: '', specialization: '', rollNumber: '', program: 'BS CS'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      let response;
      if (role === 'admin') response = await registerAdmin(formData);
      else if (role === 'teacher') response = await registerTeacher(formData);
      else response = await registerStudent(formData);
      
      toast.success(response.data.message);
      navigate('/verify');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card" style={{ maxWidth: '500px' }}>
        <div className="auth-header">
          <i className="fas fa-user-plus" style={{ fontSize: '3rem', color: 'var(--primary)', marginBottom: '1rem' }}></i>
          <h2>Create Account</h2>
          <p>Join FYP Manager today</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group"><label>Role</label>
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="form-group"><label>Full Name</label><input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required /></div>
          <div className="form-group"><label>Email</label><input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required /></div>
          {role === 'teacher' && (
            <>
              <div className="form-group"><label>Department</label><input type="text" value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })} /></div>
              <div className="form-group"><label>Specialization</label><input type="text" value={formData.specialization} onChange={(e) => setFormData({ ...formData, specialization: e.target.value })} /></div>
            </>
          )}
          {role === 'student' && (
            <>
              <div className="form-group"><label>Roll Number</label><input type="text" value={formData.rollNumber} onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })} placeholder="FUI-BSCS-2020-001" required /></div>
              <div className="form-group"><label>Program</label><select value={formData.program} onChange={(e) => setFormData({ ...formData, program: e.target.value })}><option>BS Computer Science</option><option>BS Software Engineering</option><option>BS Artificial Intelligence</option></select></div>
            </>
          )}
          <div className="form-group"><label>Password</label><input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required /></div>
          <div className="form-group"><label>Confirm Password</label><input type="password" value={formData.confirmPassword} onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })} required /></div>
          <button type="submit" className="auth-btn" disabled={loading}>{loading ? 'Creating Account...' : 'Create Account →'}</button>
        </form>
        <div style={{ marginTop: '1rem', textAlign: 'center' }}>
          <p>Already have an account? <Link to="/login">Sign In</Link></p>
          <Link to="/">← Back to Home</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;