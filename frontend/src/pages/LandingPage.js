import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const bgDiv = document.createElement('div');
    bgDiv.className = 'bg-3d';
    for (let i = 0; i < 25; i++) {
      const orb = document.createElement('div');
      orb.className = 'floating-orb';
      const size = Math.random() * 300 + 80;
      orb.style.width = `${size}px`;
      orb.style.height = `${size}px`;
      orb.style.left = `${Math.random() * 100}%`;
      orb.style.top = `${Math.random() * 100}%`;
      orb.style.animationDelay = `${Math.random() * 20}s`;
      orb.style.animationDuration = `${15 + Math.random() * 20}s`;
      bgDiv.appendChild(orb);
    }
    document.body.prepend(bgDiv);
    return () => bgDiv.remove();
  }, []);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '2rem', position: 'relative', overflow: 'hidden' }}>
      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes float3D {
          0%,100% { transform: translateY(0px) translateX(0px) scale(1); }
          25% { transform: translateY(-50px) translateX(40px) scale(1.05); }
          50% { transform: translateY(60px) translateX(-40px) scale(0.95); }
          75% { transform: translateY(-30px) translateX(-50px) scale(1.02); }
        }
        .hero-title {
          animation: fadeSlideUp 0.6s ease;
        }
        .hero-subtitle {
          animation: fadeSlideUp 0.6s ease 0.1s both;
        }
        .role-card {
          animation: fadeSlideUp 0.6s ease;
          opacity: 0;
          animation-fill-mode: forwards;
        }
        .role-card:nth-child(1) { animation-delay: 0.2s; }
        .role-card:nth-child(2) { animation-delay: 0.4s; }
        .role-card:nth-child(3) { animation-delay: 0.6s; }
      `}</style>
      
      <div>
        <h1 className="hero-title" style={{ fontSize: '3rem', fontWeight: 800, background: 'linear-gradient(135deg, #2d523f, #3d6b53)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '1rem' }}>🌿 FYP Manager Pro</h1>
        <p className="hero-subtitle" style={{ fontSize: '1rem', color: '#5a6b5e', marginBottom: '2rem' }}>Complete Academic Project Management Suite</p>
        
        <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <div className="role-card" onClick={() => navigate('/login/admin')} style={{ background: 'rgba(255, 255, 250, 0.85)', backdropFilter: 'blur(12px)', borderRadius: '28px', padding: '1.5rem', width: '240px', cursor: 'pointer', transition: 'all 0.3s ease', border: '1px solid rgba(60, 85, 65, 0.15)' }} onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-10px)'; e.currentTarget.style.background = 'white'; e.currentTarget.style.borderColor = '#3d6b53'; }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.background = 'rgba(255, 255, 250, 0.85)'; e.currentTarget.style.borderColor = 'rgba(60, 85, 65, 0.15)'; }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.8rem' }}>👑</div>
            <h3 style={{ marginBottom: '0.5rem', color: '#2d523f' }}>Admin Portal</h3>
            <p style={{ color: '#5a6b5e', fontSize: '0.85rem', marginBottom: '1rem' }}>System Management</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <button className="role-btn" style={{ background: 'rgba(61, 107, 83, 0.1)', border: 'none', padding: '0.5rem', borderRadius: '40px', fontWeight: 600, cursor: 'pointer', color: '#2d523f', transition: 'all 0.2s' }} onMouseEnter={(e) => { e.target.style.background = '#3d6b53'; e.target.style.color = 'white'; }} onMouseLeave={(e) => { e.target.style.background = 'rgba(61, 107, 83, 0.1)'; e.target.style.color = '#2d523f'; }}>Login</button>
              <button className="role-btn" onClick={(e) => { e.stopPropagation(); navigate('/register/admin'); }} style={{ background: 'rgba(61, 107, 83, 0.1)', border: 'none', padding: '0.5rem', borderRadius: '40px', fontWeight: 600, cursor: 'pointer', color: '#2d523f', transition: 'all 0.2s' }} onMouseEnter={(e) => { e.target.style.background = '#3d6b53'; e.target.style.color = 'white'; }} onMouseLeave={(e) => { e.target.style.background = 'rgba(61, 107, 83, 0.1)'; e.target.style.color = '#2d523f'; }}>Register</button>
            </div>
          </div>
          
          <div className="role-card" onClick={() => navigate('/login/teacher')} style={{ background: 'rgba(255, 255, 250, 0.85)', backdropFilter: 'blur(12px)', borderRadius: '28px', padding: '1.5rem', width: '240px', cursor: 'pointer', transition: 'all 0.3s ease', border: '1px solid rgba(60, 85, 65, 0.15)' }} onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-10px)'; e.currentTarget.style.background = 'white'; e.currentTarget.style.borderColor = '#3d6b53'; }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.background = 'rgba(255, 255, 250, 0.85)'; e.currentTarget.style.borderColor = 'rgba(60, 85, 65, 0.15)'; }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.8rem' }}>👨‍🏫</div>
            <h3 style={{ marginBottom: '0.5rem', color: '#2d523f' }}>Teacher Portal</h3>
            <p style={{ color: '#5a6b5e', fontSize: '0.85rem', marginBottom: '1rem' }}>Evaluate & Guide</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <button className="role-btn" style={{ background: 'rgba(61, 107, 83, 0.1)', border: 'none', padding: '0.5rem', borderRadius: '40px', fontWeight: 600, cursor: 'pointer', color: '#2d523f', transition: 'all 0.2s' }} onMouseEnter={(e) => { e.target.style.background = '#3d6b53'; e.target.style.color = 'white'; }} onMouseLeave={(e) => { e.target.style.background = 'rgba(61, 107, 83, 0.1)'; e.target.style.color = '#2d523f'; }}>Login</button>
              <button className="role-btn" onClick={(e) => { e.stopPropagation(); navigate('/register/teacher'); }} style={{ background: 'rgba(61, 107, 83, 0.1)', border: 'none', padding: '0.5rem', borderRadius: '40px', fontWeight: 600, cursor: 'pointer', color: '#2d523f', transition: 'all 0.2s' }} onMouseEnter={(e) => { e.target.style.background = '#3d6b53'; e.target.style.color = 'white'; }} onMouseLeave={(e) => { e.target.style.background = 'rgba(61, 107, 83, 0.1)'; e.target.style.color = '#2d523f'; }}>Register</button>
            </div>
          </div>
          
          <div className="role-card" onClick={() => navigate('/login/student')} style={{ background: 'rgba(255, 255, 250, 0.85)', backdropFilter: 'blur(12px)', borderRadius: '28px', padding: '1.5rem', width: '240px', cursor: 'pointer', transition: 'all 0.3s ease', border: '1px solid rgba(60, 85, 65, 0.15)' }} onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-10px)'; e.currentTarget.style.background = 'white'; e.currentTarget.style.borderColor = '#3d6b53'; }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.background = 'rgba(255, 255, 250, 0.85)'; e.currentTarget.style.borderColor = 'rgba(60, 85, 65, 0.15)'; }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.8rem' }}>🎓</div>
            <h3 style={{ marginBottom: '0.5rem', color: '#2d523f' }}>Student Portal</h3>
            <p style={{ color: '#5a6b5e', fontSize: '0.85rem', marginBottom: '1rem' }}>Submit & Learn</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <button className="role-btn" style={{ background: 'rgba(61, 107, 83, 0.1)', border: 'none', padding: '0.5rem', borderRadius: '40px', fontWeight: 600, cursor: 'pointer', color: '#2d523f', transition: 'all 0.2s' }} onMouseEnter={(e) => { e.target.style.background = '#3d6b53'; e.target.style.color = 'white'; }} onMouseLeave={(e) => { e.target.style.background = 'rgba(61, 107, 83, 0.1)'; e.target.style.color = '#2d523f'; }}>Login</button>
              <button className="role-btn" onClick={(e) => { e.stopPropagation(); navigate('/register/student'); }} style={{ background: 'rgba(61, 107, 83, 0.1)', border: 'none', padding: '0.5rem', borderRadius: '40px', fontWeight: 600, cursor: 'pointer', color: '#2d523f', transition: 'all 0.2s' }} onMouseEnter={(e) => { e.target.style.background = '#3d6b53'; e.target.style.color = 'white'; }} onMouseLeave={(e) => { e.target.style.background = 'rgba(61, 107, 83, 0.1)'; e.target.style.color = '#2d523f'; }}>Register</button>
            </div>
          </div>
        </div>
        
        <p style={{ color: '#5a6b5e', marginTop: '2rem' }}>Demo: admin@fyp.com/admin123 | teacher@fyp.com/teacher123 | student@fyp.com/student123</p>
      </div>
    </div>
  );
};

export default LandingPage;