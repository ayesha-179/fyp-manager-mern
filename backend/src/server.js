const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

// Import models
const User = require('./models/User');
const Project = require('./models/Project');
const Evaluation = require('./models/Evaluation');

const app = express();
app.use(cors());
app.use(express.json());

console.log('\n========================================');
console.log('🚀 BACKEND SERVER STARTING');
console.log('========================================\n');

// ==================== HEALTH CHECKS ====================
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running!', mongodb: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected' });
});

app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend is working!', timestamp: new Date().toISOString() });
});

// ==================== AUTH ROUTES ====================

// REGISTER
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password, role, rollNumber, department } = req.body;
  
  console.log('\n========================================');
  console.log('📝 REGISTRATION REQUEST');
  console.log('========================================');
  console.log(`Name: ${name}`);
  console.log(`Email: ${email}`);
  console.log(`Role: ${role}`);
  
  try {
    // Check if user exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      console.log('❌ User already exists');
      return res.status(400).json({ message: 'User already exists' });
    }
    
    // Generate verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationCodeExpires = Date.now() + 10 * 60 * 1000;
    
    console.log('\n⭐' + '⭐'.repeat(58));
    console.log('🔐 YOUR VERIFICATION CODE:');
    console.log('⭐' + '⭐'.repeat(58));
    console.log(`                                 `);
    console.log(`         ${verificationCode}        `);
    console.log(`                                 `);
    console.log(`   Email: ${email}`);
    console.log(`   Name: ${name}`);
    console.log('⭐' + '⭐'.repeat(58));
    console.log('\n');
    
    // Create user
    const userData = {
      name,
      email: email.toLowerCase(),
      password,
      role,
      verificationCode,
      verificationCodeExpires,
      emailVerified: false
    };
    
    if (role === 'teacher') {
      userData.department = department || 'CS';
      userData.capacity = 4;
      userData.acceptedGroups = 0;
    }
    
    if (role === 'student') {
      userData.rollNumber = rollNumber;
    }
    
    const user = await User.create(userData);
    
    console.log(`✅ User created! ID: ${user._id}`);
    console.log('========================================\n');
    
    res.json({ 
      success: true, 
      message: 'Registration successful! Check BACKEND TERMINAL for verification code.',
      userId: user._id 
    });
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({ message: error.message });
  }
});

// VERIFY EMAIL
app.post('/api/auth/verify-email', async (req, res) => {
  const { email, code } = req.body;
  
  console.log('\n========================================');
  console.log('🔐 VERIFICATION REQUEST');
  console.log('========================================');
  console.log(`Email: ${email}`);
  console.log(`Code entered: ${code}`);
  
  try {
    const user = await User.findOne({ 
      email: email.toLowerCase(), 
      verificationCode: code,
      verificationCodeExpires: { $gt: Date.now() }
    });
    
    if (!user) {
      console.log('❌ Invalid or expired code');
      return res.status(400).json({ message: 'Invalid or expired verification code' });
    }
    
    user.emailVerified = true;
    user.verificationCode = undefined;
    user.verificationCodeExpires = undefined;
    await user.save();
    
    console.log('✅ Email verified successfully!');
    console.log('========================================\n');
    
    res.json({ success: true, message: 'Email verified successfully' });
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({ message: error.message });
  }
});

// LOGIN
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  
  console.log('\n========================================');
  console.log('🔐 LOGIN REQUEST');
  console.log('========================================');
  console.log(`Email: ${email}`);
  
  try {
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    
    if (!user) {
      console.log('❌ User not found');
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    console.log(`User found: ${user.name} (${user.role})`);
    console.log(`Verified: ${user.emailVerified}`);
    
    if (!user.emailVerified) {
      console.log('❌ Email not verified');
      return res.status(401).json({ message: 'Please verify your email first' });
    }
    
    const isValid = await user.comparePassword(password);
    console.log(`Password valid: ${isValid}`);
    
    if (!isValid) {
      console.log('❌ Invalid password');
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    user.lastLogin = new Date();
    await user.save();
    
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role }, 
      process.env.JWT_SECRET || 'secret123', 
      { expiresIn: '7d' }
    );
    
    console.log('✅ Login successful!');
    console.log('========================================\n');
    
    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        rollNumber: user.rollNumber
      }
    });
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({ message: error.message });
  }
});

// UPDATE EMAIL
app.put('/api/auth/update-email', async (req, res) => {
  const { newEmail, currentPassword } = req.body;
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({ message: 'No token provided' });
  }
  
  const token = authHeader.split(' ')[1];
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123');
    const user = await User.findById(decoded.id).select('+password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const isValid = await user.comparePassword(currentPassword);
    if (!isValid) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }
    
    const emailExists = await User.findOne({ email: newEmail.toLowerCase(), _id: { $ne: user._id } });
    if (emailExists) {
      return res.status(400).json({ message: 'Email already in use' });
    }
    
    user.email = newEmail.toLowerCase();
    user.emailVerified = false;
    await user.save();
    
    res.json({ success: true, message: 'Email updated. Please verify your new email.' });
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
});

// CHANGE PASSWORD
app.put('/api/auth/change-password', async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({ message: 'No token provided' });
  }
  
  const token = authHeader.split(' ')[1];
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123');
    const user = await User.findById(decoded.id).select('+password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const isValid = await user.comparePassword(currentPassword);
    if (!isValid) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }
    
    user.password = newPassword;
    await user.save();
    
    res.json({ success: true, message: 'Password changed successfully. Please login again.' });
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
});

// ==================== GET USERS (for testing) ====================
app.get('/api/users', async (req, res) => {
  const users = await User.find({}).select('-password');
  res.json(users);
});

// ==================== CONNECT MONGODB & START SERVER ====================
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/fyp_manager';
const PORT = process.env.PORT || 5001;

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('\n✅ MongoDB Connected Successfully');
    console.log(`📍 Database: ${mongoose.connection.name}`);
    
    app.listen(PORT, () => {
      console.log(`\n🚀 Server running on http://localhost:${PORT}`);
      console.log('\n📋 TEST ENDPOINTS:');
      console.log(`   GET  http://localhost:${PORT}/api/health`);
      console.log(`   GET  http://localhost:${PORT}/api/test`);
      console.log(`   GET  http://localhost:${PORT}/api/users`);
      console.log('\n📋 AUTH ENDPOINTS:');
      console.log(`   POST http://localhost:${PORT}/api/auth/register`);
      console.log(`   POST http://localhost:${PORT}/api/auth/verify-email`);
      console.log(`   POST http://localhost:${PORT}/api/auth/login`);
      console.log('\n========================================');
      console.log('⚠️  VERIFICATION CODES WILL APPEAR HERE');
      console.log('========================================\n');
    });
  })
  .catch(err => {
    console.error('\n❌ MongoDB Connection Error:', err.message);
    console.log('\n⚠️  Please start MongoDB:');
    console.log('   Windows: net start MongoDB');
    console.log('   Mac: brew services start mongodb-community');
    console.log('   Linux: sudo systemctl start mongod\n');
  });