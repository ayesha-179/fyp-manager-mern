const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Teacher = require('../models/Teacher');
const Student = require('../models/Student');
const { protect } = require('../middleware/auth');

const router = express.Router();

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });
};

const generateVerificationCode = () => {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
};

// Register routes
router.post('/register/admin', async (req, res) => {
  try {
    const { name, email, password, department } = req.body;
    const adminExists = await User.findOne({ role: 'admin' });
    if (adminExists) return res.status(400).json({ success: false, message: 'Admin already exists!' });
    
    const code = generateVerificationCode();
    const user = await User.create({ name, email, password, role: 'admin', department, verificationCode: code, isVerified: false });
    res.status(201).json({ success: true, message: 'Admin registered! Verification code: ' + code, verificationCode: code });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/register/teacher', async (req, res) => {
  try {
    const { name, email, password, department, specialization } = req.body;
    const teacherCount = await User.countDocuments({ role: 'teacher' });
    if (teacherCount >= parseInt(process.env.MAX_FACULTY)) {
      return res.status(400).json({ success: false, message: 'Maximum faculty limit reached!' });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ success: false, message: 'Email already registered!' });
    
    const code = generateVerificationCode();
    const user = await User.create({ name, email, password, role: 'teacher', department, verificationCode: code, isVerified: false });
    await Teacher.create({ userId: user._id, employeeId: `EMP${Date.now()}`, specialization });
    res.status(201).json({ success: true, message: 'Faculty registered! Verification code: ' + code, verificationCode: code });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/register/student', async (req, res) => {
  try {
    const { name, email, password, rollNumber, program } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ success: false, message: 'Email already registered!' });
    
    const existingStudent = await Student.findOne({ rollNumber });
    if (existingStudent) return res.status(400).json({ success: false, message: 'Roll number already registered!' });
    
    const code = generateVerificationCode();
    const user = await User.create({ name, email, password, role: 'student', verificationCode: code, isVerified: false });
    await Student.create({ userId: user._id, rollNumber, program });
    res.status(201).json({ success: true, message: 'Student registered! Verification code: ' + code, verificationCode: code });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/verify', async (req, res) => {
  try {
    const { email, code } = req.body;
    const user = await User.findOne({ email, verificationCode: code });
    if (!user) return res.status(400).json({ success: false, message: 'Invalid verification code!' });
    
    user.isVerified = true;
    user.verificationCode = null;
    await user.save();
    res.json({ success: true, message: 'Email verified successfully! Please login.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials' });
    if (!user.isVerified) return res.status(401).json({ success: false, message: 'Please verify your email first!' });
    
    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid credentials' });
    
    const token = generateToken(user._id);
    res.json({ success: true, token, user: { id: user._id, name: user.name, email: user.email, role: user.role, department: user.department } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/me', protect, async (req, res) => {
  let profile = null;
  if (req.user.role === 'teacher') profile = await Teacher.findOne({ userId: req.user._id });
  if (req.user.role === 'student') profile = await Student.findOne({ userId: req.user._id });
  res.json({ success: true, user: { ...req.user.toObject(), profile } });
});

module.exports = router;