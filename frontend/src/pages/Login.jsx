import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(email, password);
      toast.success(`Welcome back, ${user.name}!`);
      if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'teacher') navigate('/teacher');
      else navigate('/student');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <i className="fas fa-leaf" style={{ fontSize: '3rem', color: 'var(--primary)', marginBottom: '1rem' }}></i>
          <h2>Welcome Back</h2>
          <p>Sign in to your account</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group"><label>Email</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
          <div className="form-group"><label>Password</label><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required /></div>
          <button type="submit" className="auth-btn" disabled={loading}>{loading ? 'Signing in...' : 'Sign In →'}</button>
        </form>
        <div style={{ marginTop: '1rem', textAlign: 'center' }}>
          <p>Don't have an account? <Link to="/register">Create Account</Link></p>
          <Link to="/">← Back to Home</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;