import React, { useState } from 'react';
import DashboardLayout from '../components/Layout/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Settings = () => {
  const { user, updateEmail, changePassword } = useAuth();
  const [loading, setLoading] = useState(false);
  const [emailData, setEmailData] = useState({ newEmail: '', currentPassword: '' });
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

  const handleEmailChange = async (e) => {
    e.preventDefault();
    if (!emailData.currentPassword) {
      toast.error('Please enter your current password');
      return;
    }
    setLoading(true);
    await updateEmail(emailData.newEmail, emailData.currentPassword);
    setLoading(false);
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    await changePassword(passwordData.currentPassword, passwordData.newPassword);
    setLoading(false);
  };

  return (
    <DashboardLayout title="Account Settings">
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">👤</div>
          <div className="stat-value">{user?.name}</div>
          <div className="stat-label">Name</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📧</div>
          <div className="stat-value">{user?.email}</div>
          <div className="stat-label">Email</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🎭</div>
          <div className="stat-value">{user?.role}</div>
          <div className="stat-label">Role</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title">Change Email Address</div>
        </div>
        <div className="card-body">
          <form onSubmit={handleEmailChange}>
            <input
              type="email"
              placeholder="New Email"
              value={emailData.newEmail}
              onChange={(e) => setEmailData({ ...emailData, newEmail: e.target.value })}
              className="form-input"
              required
            />
            <input
              type="password"
              placeholder="Current Password"
              value={emailData.currentPassword}
              onChange={(e) => setEmailData({ ...emailData, currentPassword: e.target.value })}
              className="form-input"
              required
            />
            <button type="submit" className="btn-sm btn-primary" disabled={loading}>
              {loading ? 'Updating...' : 'Update Email'}
            </button>
          </form>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title">Change Password</div>
        </div>
        <div className="card-body">
          <form onSubmit={handlePasswordChange}>
            <input
              type="password"
              placeholder="Current Password"
              value={passwordData.currentPassword}
              onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
              className="form-input"
              required
            />
            <input
              type="password"
              placeholder="New Password"
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
              className="form-input"
              required
            />
            <input
              type="password"
              placeholder="Confirm New Password"
              value={passwordData.confirmPassword}
              onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
              className="form-input"
              required
            />
            <button type="submit" className="btn-sm btn-primary" disabled={loading}>
              {loading ? 'Changing...' : 'Change Password'}
            </button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Settings;