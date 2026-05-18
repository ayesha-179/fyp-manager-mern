import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { verifyEmail } from '../services/api';
import toast from 'react-hot-toast';

const VerifyEmail = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await verifyEmail({ email, code });
      toast.success('Email verified! Please login.');
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <i className="fas fa-envelope" style={{ fontSize: '3rem', color: 'var(--primary)', marginBottom: '1rem' }}></i>
          <h2>Verify Your Email</h2>
          <p>Enter the verification code sent to your email</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group"><label>Email</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
          <div className="form-group"><label>Verification Code</label><input type="text" value={code} onChange={(e) => setCode(e.target.value)} placeholder="Enter 8-digit code" required /></div>
          <button type="submit" className="auth-btn" disabled={loading}>{loading ? 'Verifying...' : 'Verify →'}</button>
        </form>
        <div style={{ marginTop: '1rem', textAlign: 'center' }}>
          <Link to="/register">← Back to Registration</Link>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;