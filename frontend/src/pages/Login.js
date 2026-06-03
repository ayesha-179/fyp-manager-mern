import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { role } = useParams();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password, role);
    } catch (error) {
      // Error handled in context
    } finally {
      setLoading(false);
    }
  };

  const getRoleIcon = () => {
    switch(role) {
      case 'admin': return '👑';
      case 'teacher': return '👨‍🏫';
      case 'student': return '🎓';
      default: return '🔐';
    }
  };

  const getRoleTitle = () => {
    switch(role) {
      case 'admin': return 'Admin Login';
      case 'teacher': return 'Teacher Login';
      case 'student': return 'Student Login';
      default: return 'Login';
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>{getRoleIcon()}</div>
          <h2>{getRoleTitle()}</h2>
          <p>Sign in to your account</p>
        </div>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="form-input"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="form-input"
            required
          />
          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? 'Please wait...' : 'Sign In →'}
          </button>
        </form>
        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
          <a href="#" onClick={() => navigate('/')} style={{ color: '#3d6b53' }}>Back to Home</a>
        </div>
      </div>
    </div>
  );
};

export default Login;