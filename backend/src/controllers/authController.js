const User = require('../models/User');
const Project = require('../models/Project');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });
};

exports.register = async (req, res) => {
  const { name, email, password, role, rollNumber, department } = req.body;
  
  try {
    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({ error: 'User already exists' });
    }
    
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role,
      rollNumber,
      department,
      emailVerified: true
    });
    
    res.status(201).json({ success: true, message: 'Registration successful' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  
  try {
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = generateToken(user._id);
    
    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateEmail = async (req, res) => {
  const { newEmail, currentPassword } = req.body;
  const user = await User.findById(req.user.id).select('+password');
  
  if (!user) return res.status(404).json({ error: 'User not found' });
  
  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) return res.status(401).json({ error: 'Current password is incorrect' });
  
  user.email = newEmail.toLowerCase();
  await user.save();
  
  res.json({ success: true, message: 'Email updated successfully' });
};

exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user.id).select('+password');
  
  if (!user) return res.status(404).json({ error: 'User not found' });
  
  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) return res.status(401).json({ error: 'Current password is incorrect' });
  
  user.password = newPassword;
  await user.save();
  
  res.json({ success: true, message: 'Password changed successfully' });
};