import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useParams } from 'react-router-dom';
import { Toaster, toast } from 'react-hot-toast';

// Mock users database
const initialUsers = [
  { id: 1, name: "Admin User", email: "admin@fyp.com", password: "admin123", role: "admin", verified: true },
  { id: 2, name: "Dr. Asad Ahmed", email: "teacher@fyp.com", password: "teacher123", role: "teacher", verified: true },
  { id: 3, name: "Student User", email: "student@fyp.com", password: "student123", role: "student", verified: true }
];

let users = [...initialUsers];
let currentUser = null;

// Helper functions
const saveUsers = () => localStorage.setItem('fyp_users', JSON.stringify(users));
const loadUsers = () => {
  const saved = localStorage.getItem('fyp_users');
  if (saved) users = JSON.parse(saved);
  else saveUsers();
};
loadUsers();

// Landing Page Component
const LandingPage = () => {
  const navigate = useNavigate();
  return (
    <div className="landing-container">
      <div>
        <h1 className="hero-title">🌿 FYP Manager Pro</h1>
        <p className="hero-subtitle">Complete Academic Project Management Suite</p>
        <div className="role-cards">
          <div className="role-card" onClick={() => navigate('/login/admin')}>
            <div className="role-icon">👑</div>
            <h3>Admin Portal</h3>
            <div className="role-buttons">
              <button className="role-btn">Login</button>
              <button className="role-btn outline" onClick={(e) => { e.stopPropagation(); navigate('/register/admin'); }}>Register</button>
            </div>
          </div>
          <div className="role-card" onClick={() => navigate('/login/teacher')}>
            <div className="role-icon">👨‍🏫</div>
            <h3>Teacher Portal</h3>
            <div className="role-buttons">
              <button className="role-btn">Login</button>
              <button className="role-btn outline" onClick={(e) => { e.stopPropagation(); navigate('/register/teacher'); }}>Register</button>
            </div>
          </div>
          <div className="role-card" onClick={() => navigate('/login/student')}>
            <div className="role-icon">🎓</div>
            <h3>Student Portal</h3>
            <div className="role-buttons">
              <button className="role-btn">Login</button>
              <button className="role-btn outline" onClick={(e) => { e.stopPropagation(); navigate('/register/student'); }}>Register</button>
            </div>
          </div>
        </div>
        <p className="text-muted">Demo: admin@fyp.com/admin123 | teacher@fyp.com/teacher123</p>
      </div>
    </div>
  );
};

// Login Component
const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { role } = useParams();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const user = users.find(u => u.email === email && u.password === password && u.role === role);
    if (user) {
      localStorage.setItem('currentUser', JSON.stringify(user));
      currentUser = user;
      toast.success(`Welcome back, ${user.name}!`);
      navigate(`/${role}`);
    } else {
      toast.error('Invalid credentials');
    }
    setLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>{role?.toUpperCase()} Login</h2>
          <p>Sign in to your account</p>
        </div>
        <form onSubmit={handleSubmit}>
          <input type="email" className="form-input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required />
          <input type="password" className="form-input" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required />
          <button type="submit" className="auth-btn" disabled={loading}>{loading ? 'Please wait...' : 'Sign In →'}</button>
        </form>
        <div className="text-center mt-3">
          <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', color: '#3d6b53', cursor: 'pointer' }}>Back to Home</button>
        </div>
      </div>
    </div>
  );
};

// Register Component
const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '', rollNumber: '', department: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { role } = useParams();

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
    
    const existing = users.find(u => u.email === formData.email);
    if (existing) {
      toast.error("Email already exists!");
      setLoading(false);
      return;
    }
    
    const newUser = {
      id: users.length + 1,
      name: formData.name,
      email: formData.email,
      password: formData.password,
      role: role,
      verified: true,
      rollNumber: formData.rollNumber,
      department: formData.department
    };
    users.push(newUser);
    saveUsers();
    toast.success("Registration successful! Please login.");
    navigate(`/login/${role}`);
    setLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-card" style={{ maxWidth: '500px' }}>
        <div className="auth-header">
          <h2>{role?.toUpperCase()} Registration</h2>
          <p>Create your account</p>
        </div>
        <form onSubmit={handleSubmit}>
          <input type="text" className="form-input" placeholder="Full Name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
          <input type="email" className="form-input" placeholder="Email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required />
          {role === 'student' && <input type="text" className="form-input" placeholder="Roll Number" value={formData.rollNumber} onChange={(e) => setFormData({...formData, rollNumber: e.target.value})} />}
          {role === 'teacher' && <input type="text" className="form-input" placeholder="Department" value={formData.department} onChange={(e) => setFormData({...formData, department: e.target.value})} />}
          <input type="password" className="form-input" placeholder="Password (min 6 characters)" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} required />
          <input type="password" className="form-input" placeholder="Confirm Password" value={formData.confirmPassword} onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})} required />
          <button type="submit" className="auth-btn" disabled={loading}>{loading ? 'Creating Account...' : 'Register →'}</button>
        </form>
        <div className="text-center mt-3">
          <button onClick={() => navigate(`/login/${role}`)} style={{ background: 'none', border: 'none', color: '#3d6b53', cursor: 'pointer' }}>Already have an account? Login</button>
          <br />
          <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', color: '#3d6b53', cursor: 'pointer', marginTop: '0.5rem' }}>Back to Home</button>
        </div>
      </div>
    </div>
  );
};

// Dashboard Layout Component
const DashboardLayout = ({ children, title }) => {
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const saved = localStorage.getItem('currentUser');
    if (saved) setUser(JSON.parse(saved));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    toast.success('Logged out successfully');
    navigate('/');
  };

  const getNavItems = () => {
    if (user?.role === 'admin') return ['Dashboard', 'Teachers', 'Students', 'Projects'];
    if (user?.role === 'teacher') return ['Dashboard', 'Pending', 'Approved', 'Evaluate'];
    return ['Overview', 'My Projects', 'Supervisors', 'Evaluations'];
  };

  const navItems = getNavItems();
  const currentPath = window.location.pathname.split('/')[1];

  return (
    <div className="app-layout">
      <div className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">🌿 FYP Manager</div>
        <div className="nav-menu">
          {navItems.map(item => (
            <div key={item} className={`nav-item ${currentPath === item.toLowerCase().replace(' ', '') ? 'active' : ''}`}>
              {item}
            </div>
          ))}
          <div className="nav-item" onClick={() => navigate('/settings')}>Settings</div>
          <div className="nav-item logout" onClick={handleLogout}>Logout</div>
        </div>
      </div>
      <button className="menu-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>☰</button>
      <div className="main-content">
        <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: '#2d523f' }}>{title}</h1>
        <p style={{ color: '#5a6b5e', marginBottom: '1.5rem' }}>Welcome back, {user?.name}</p>
        {children}
      </div>
    </div>
  );
};

// Admin Dashboard
const AdminDashboard = () => {
  const teachers = users.filter(u => u.role === 'teacher');
  const students = users.filter(u => u.role === 'student');
  return (
    <DashboardLayout title="Dashboard">
      <div className="stats-grid">
        <div className="stat-card"><div className="stat-icon">👨‍🏫</div><div className="stat-value">{teachers.length}/14</div><div className="stat-label">Faculty</div><div className="progress-bar"><div className="progress-fill" style={{ width: `${(teachers.length/14)*100}%` }}></div></div></div>
        <div className="stat-card"><div className="stat-icon">🎓</div><div className="stat-value">{students.length}</div><div className="stat-label">Students</div></div>
        <div className="stat-card"><div className="stat-icon">📁</div><div className="stat-value">0</div><div className="stat-label">Projects</div></div>
        <div className="stat-card"><div className="stat-icon">⭐</div><div className="stat-value">0</div><div className="stat-label">Evaluations</div></div>
      </div>
      <div className="card">
        <div className="card-header">System Overview</div>
        <div className="card-body">Welcome to Admin Dashboard. Manage faculty, students, and projects.</div>
      </div>
    </DashboardLayout>
  );
};

// Teacher Dashboard
const TeacherDashboard = () => {
  return (
    <DashboardLayout title="Dashboard">
      <div className="stats-grid">
        <div className="stat-card"><div className="stat-value">0</div><div className="stat-label">Pending</div></div>
        <div className="stat-card"><div className="stat-value">0</div><div className="stat-label">Approved</div></div>
        <div className="stat-card"><div className="stat-value">0</div><div className="stat-label">Completed</div></div>
        <div className="stat-card"><div className="stat-value">0/4</div><div className="stat-label">Capacity</div><div className="progress-bar"><div className="progress-fill" style={{ width: '0%' }}></div></div></div>
      </div>
      <div className="card">
        <div className="card-header">Teacher Dashboard</div>
        <div className="card-body">Manage pending requests, review documents, and evaluate projects.</div>
      </div>
    </DashboardLayout>
  );
};

// Student Dashboard
const StudentDashboard = () => {
  return (
    <DashboardLayout title="Dashboard">
      <div className="stats-grid">
        <div className="stat-card"><div className="stat-value">0</div><div className="stat-label">My Projects</div></div>
        <div className="stat-card"><div className="stat-value">0</div><div className="stat-label">Approved</div></div>
        <div className="stat-card"><div className="stat-value">0</div><div className="stat-label">Completed</div></div>
        <div className="stat-card"><div className="stat-value">0</div><div className="stat-label">Evaluations</div></div>
      </div>
      <div className="card">
        <div className="card-header">Student Dashboard</div>
        <div className="card-body">Submit new projects, communicate with supervisors, and track your evaluations.</div>
      </div>
    </DashboardLayout>
  );
};

// Settings Page
const Settings = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const saved = localStorage.getItem('currentUser');
    if (saved) setUser(JSON.parse(saved));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    toast.success('Logged out successfully');
    navigate('/');
  };

  return (
    <DashboardLayout title="Settings">
      <div className="stats-grid">
        <div className="stat-card"><div className="stat-value">{user?.name}</div><div className="stat-label">Name</div></div>
        <div className="stat-card"><div className="stat-value">{user?.email}</div><div className="stat-label">Email</div></div>
        <div className="stat-card"><div className="stat-value">{user?.role}</div><div className="stat-label">Role</div></div>
      </div>
      <div className="card">
        <div className="card-header">Account Settings</div>
        <div className="card-body">
          <p>Email and password change functionality coming soon.</p>
          <button className="btn-sm btn-primary" onClick={handleLogout} style={{ marginTop: '1rem' }}>Logout</button>
        </div>
      </div>
    </DashboardLayout>
  );
};

// Main App
function App() {
  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login/:role" element={<Login />} />
        <Route path="/register/:role" element={<Register />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/teacher" element={<TeacherDashboard />} />
        <Route path="/student" element={<StudentDashboard />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;