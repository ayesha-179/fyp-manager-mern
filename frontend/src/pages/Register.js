import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import api from '../services/api';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    rollNumber: '',
    department: '',
    registrationType: 'individual'
  });
  const [groupMembers, setGroupMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [verificationStep, setVerificationStep] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [tempEmail, setTempEmail] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();
  const { role } = useParams();

  const addTeamMember = () => {
    if (groupMembers.length < 3) {
      setGroupMembers([...groupMembers, { name: '', rollNumber: '', email: '' }]);
    } else {
      toast.error('Maximum 3 additional members allowed');
    }
  };

  const updateTeamMember = (index, field, value) => {
    const updated = [...groupMembers];
    updated[index][field] = value;
    setGroupMembers(updated);
  };

  const removeTeamMember = (index) => {
    setGroupMembers(groupMembers.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords don't match!");
      return;
    }
    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    const userData = {
      name: formData.name,
      email: formData.email.toLowerCase(),
      password: formData.password,
      role: role,
    };

    if (role === 'student') {
      userData.rollNumber = formData.rollNumber;
      if (formData.registrationType === 'group') {
        userData.isGroup = true;
        userData.groupMembers = groupMembers;
      }
    }
    if (role === 'teacher') {
      userData.department = formData.department;
    }

    try {
      const response = await api.post('/auth/register', userData);
      if (response.data.success) {
        setTempEmail(formData.email.toLowerCase());
        setVerificationStep(true);
        toast.success("Registration successful! Check BACKEND TERMINAL for verification code!");
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      toast.error("Please enter a valid 6-digit verification code");
      return;
    }
    setLoading(true);
    try {
      const response = await api.post('/auth/verify-email', { 
        email: tempEmail, 
        code: verificationCode 
      });
      if (response.data.success) {
        toast.success("Email verified! Please login.");
        navigate(`/login/${role}`);
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setLoading(true);
    try {
      await api.post('/auth/resend-code', { email: tempEmail });
      toast.success("New verification code sent! Check BACKEND TERMINAL.");
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to resend code');
    } finally {
      setLoading(false);
    }
  };

  if (verificationStep) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h2>Verify Your Email</h2>
            <p>Enter the verification code shown in the backend terminal</p>
          </div>
          <div style={{ 
            background: '#f0f0f0', 
            padding: '1rem', 
            borderRadius: '10px', 
            textAlign: 'center', 
            marginBottom: '1rem',
            borderLeft: '4px solid #3d6b53'
          }}>
            <strong>📌 Check the BACKEND TERMINAL</strong><br />
            <small>The verification code appears where you ran <code>node server.js</code></small>
          </div>
          <input
            type="text"
            placeholder="Enter 6-digit code"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            className="form-input"
            maxLength="6"
            style={{ textAlign: 'center', letterSpacing: '4px', fontSize: '1.2rem' }}
          />
          <button onClick={handleVerify} className="auth-btn" disabled={loading}>
            {loading ? 'Verifying...' : 'Verify Email →'}
          </button>
          <div style={{ textAlign: 'center', marginTop: '1rem' }}>
            <a href="#" onClick={handleResendCode} style={{ color: '#3d6b53', fontSize: '0.85rem' }}>
              Didn't receive code? Resend
            </a>
          </div>
          <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
            <a href="#" onClick={() => navigate('/')} style={{ color: '#3d6b53', fontSize: '0.85rem' }}>Back to Home</a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card" style={{ maxWidth: role === 'student' ? '650px' : '450px' }}>
        <div className="auth-header">
          <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>{role === 'admin' ? '👑' : role === 'teacher' ? '👨‍🏫' : '🎓'}</div>
          <h2>{role?.toUpperCase()} Registration</h2>
          <p>Create your account</p>
        </div>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Full Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="form-input"
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="form-input"
            required
          />
          
          {role === 'student' && (
            <>
              <input
                type="text"
                placeholder="Roll Number"
                value={formData.rollNumber}
                onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                className="form-input"
                required
              />
              <select
                value={formData.registrationType}
                onChange={(e) => setFormData({ ...formData, registrationType: e.target.value })}
                className="form-input"
              >
                <option value="individual">Individual Student</option>
                <option value="group">Group (2-4 members)</option>
              </select>
              
              {formData.registrationType === 'group' && (
                <div style={{ marginBottom: '1rem', padding: '1rem', background: 'rgba(61,107,83,0.05)', borderRadius: '16px' }}>
                  <label className="form-label">Team Members (You are the leader)</label>
                  {groupMembers.map((member, idx) => (
                    <div key={idx} className="team-member-input">
                      <input
                        type="text"
                        placeholder="Full Name"
                        value={member.name}
                        onChange={(e) => updateTeamMember(idx, 'name', e.target.value)}
                      />
                      <input
                        type="text"
                        placeholder="Roll Number"
                        value={member.rollNumber}
                        onChange={(e) => updateTeamMember(idx, 'rollNumber', e.target.value)}
                      />
                      <input
                        type="email"
                        placeholder="Email"
                        value={member.email}
                        onChange={(e) => updateTeamMember(idx, 'email', e.target.value)}
                      />
                      <button type="button" className="remove-member-btn" onClick={() => removeTeamMember(idx)}>Remove</button>
                    </div>
                  ))}
                  <button type="button" className="add-member-btn" onClick={addTeamMember}>+ Add Team Member</button>
                </div>
              )}
            </>
          )}
          
          {role === 'teacher' && (
            <input
              type="text"
              placeholder="Department"
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              className="form-input"
            />
          )}
          
          <input
            type="password"
            placeholder="Password (min 6 characters)"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="form-input"
            required
          />
          <input
            type="password"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            className="form-input"
            required
          />
          
          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? 'Creating Account...' : 'Register →'}
          </button>
        </form>
        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
          <a href="#" onClick={() => navigate(`/login/${role}`)}>Already have an account? Login</a>
          <br />
          <a href="#" onClick={() => navigate('/')}>Back to Home</a>
        </div>
      </div>
    </div>
  );
};

export default Register;