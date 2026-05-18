import React from 'react';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-container">
      <div className="hero-section">
        <div className="hero-title">🌿 FYP Manager Enterprise</div>
        <p className="hero-subtitle">Complete Academic Project Management Suite</p>
        <div className="role-cards">
          <div className="role-card" onClick={() => navigate('/login')}>
            <div className="role-icon">👨‍💼</div>
            <h3>Admin Portal</h3>
            <p>Manage faculty, students, and oversight</p>
          </div>
          <div className="role-card" onClick={() => navigate('/login')}>
            <div className="role-icon">👨‍🏫</div>
            <h3>Faculty Portal</h3>
            <p>Evaluate projects, manage capacity</p>
          </div>
          <div className="role-card" onClick={() => navigate('/login')}>
            <div className="role-icon">🎓</div>
            <h3>Student Portal</h3>
            <p>Submit projects, upload files</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;