const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/fyp_manager')
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('MongoDB Error:', err));

// ============ SCHEMAS ============
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ['admin', 'teacher', 'student'] },
  emailVerified: { type: Boolean, default: false },
  verificationCode: String,
  verificationCodeExpires: Date,
  department: String,
  capacity: { type: Number, default: 4 },
  acceptedGroups: { type: Number, default: 0 },
  rollNumber: String,
  isGroup: { type: Boolean, default: false },
  groupMembers: [{
    name: String,
    rollNumber: String,
    email: String
  }],
  createdAt: { type: Date, default: Date.now }
});

const projectSchema = new mongoose.Schema({
  projectTitle: String,
  description: String,
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  teacherName: String,
  status: { type: String, default: 'pending' },
  isCompleted: { type: Boolean, default: false },
  fileName: String,
  submittedAt: { type: Date, default: Date.now },
  type: { type: String, default: 'individual' },
  members: [{
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    studentName: String,
    rollNumber: String,
    email: String,
    isLeader: Boolean
  }],
  comments: [{
    userName: String,
    userRole: String,
    message: String,
    date: { type: Date, default: Date.now }
  }]
});

const evaluationSchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  studentName: String,
  rollNumber: String,
  totalScore: Number,
  grade: String,
  feedback: String,
  evaluatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  scores: [{ criteria: String, score: Number }],
  date: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
const Project = mongoose.model('Project', projectSchema);
const Evaluation = mongoose.model('Evaluation', evaluationSchema);

// ============ AUTH ROUTES WITH EMAIL VERIFICATION ============

// REGISTER with verification code
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password, role, rollNumber, department, isGroup, groupMembers } = req.body;
  
  console.log('\n========================================');
  console.log('📝 REGISTRATION REQUEST');
  console.log('========================================');
  console.log(`Name: ${name}`);
  console.log(`Email: ${email}`);
  console.log(`Role: ${role}`);
  
  try {
    const existing = await User.findOne({ email });
    if (existing) {
      console.log('❌ User already exists\n');
      return res.status(400).json({ error: 'User already exists' });
    }
    
    // Generate 6-digit verification code
    const verificationCode = crypto.randomInt(100000, 999999).toString();
    const verificationCodeExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    
    // Display verification code prominently in terminal
    console.log('\n' + '⭐'.repeat(60));
    console.log('🔐 VERIFICATION CODE (COPY THIS):');
    console.log('⭐'.repeat(60));
    console.log(`                                 `);
    console.log(`         ${verificationCode}        `);
    console.log(`                                 `);
    console.log(`   Email: ${email}`);
    console.log(`   Name: ${name}`);
    console.log(`   Expires in: 10 minutes`);
    console.log('⭐'.repeat(60));
    console.log('\n');
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const userData = { 
      name, 
      email, 
      password: hashedPassword, 
      role, 
      emailVerified: false,
      verificationCode,
      verificationCodeExpires
    };
    
    if (role === 'teacher') userData.department = department || 'CS';
    if (role === 'student') {
      userData.rollNumber = rollNumber;
      if (isGroup) {
        userData.isGroup = true;
        userData.groupMembers = groupMembers || [];
      }
    }
    
    const user = await User.create(userData);
    console.log(`✅ User created with ID: ${user._id}`);
    console.log('========================================\n');
    
    res.json({ 
      success: true, 
      message: 'Registration successful! Check BACKEND TERMINAL for verification code.',
      userId: user._id 
    });
  } catch (err) {
    console.error('❌ Error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// VERIFY EMAIL
app.post('/api/auth/verify-email', async (req, res) => {
  const { email, code } = req.body;
  
  console.log('\n========================================');
  console.log('🔐 EMAIL VERIFICATION REQUEST');
  console.log('========================================');
  console.log(`Email: ${email}`);
  console.log(`Code entered: ${code}`);
  
  try {
    const user = await User.findOne({ 
      email, 
      verificationCode: code,
      verificationCodeExpires: { $gt: Date.now() }
    });
    
    if (!user) {
      console.log('❌ Invalid or expired verification code\n');
      return res.status(400).json({ error: 'Invalid or expired verification code' });
    }
    
    user.emailVerified = true;
    user.verificationCode = null;
    user.verificationCodeExpires = null;
    await user.save();
    
    console.log('✅ Email verified successfully!');
    console.log('========================================\n');
    
    res.json({ success: true, message: 'Email verified successfully' });
  } catch (err) {
    console.error('❌ Error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// RESEND VERIFICATION CODE
app.post('/api/auth/resend-code', async (req, res) => {
  const { email } = req.body;
  
  console.log('\n========================================');
  console.log('📧 RESEND VERIFICATION CODE');
  console.log('========================================');
  console.log(`Email: ${email}`);
  
  try {
    const user = await User.findOne({ email });
    if (!user) {
      console.log('❌ User not found\n');
      return res.status(404).json({ error: 'User not found' });
    }
    
    if (user.emailVerified) {
      console.log('❌ Email already verified\n');
      return res.status(400).json({ error: 'Email already verified' });
    }
    
    const verificationCode = crypto.randomInt(100000, 999999).toString();
    const verificationCodeExpires = Date.now() + 10 * 60 * 1000;
    
    user.verificationCode = verificationCode;
    user.verificationCodeExpires = verificationCodeExpires;
    await user.save();
    
    console.log('\n' + '⭐'.repeat(60));
    console.log('🔐 NEW VERIFICATION CODE (COPY THIS):');
    console.log('⭐'.repeat(60));
    console.log(`                                 `);
    console.log(`         ${verificationCode}        `);
    console.log(`                                 `);
    console.log(`   Email: ${email}`);
    console.log(`   Name: ${user.name}`);
    console.log(`   Expires in: 10 minutes`);
    console.log('⭐'.repeat(60));
    console.log('\n');
    
    res.json({ success: true, message: 'New verification code sent. Check terminal.' });
  } catch (err) {
    console.error('❌ Error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// LOGIN (requires email verification)
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  
  console.log('\n========================================');
  console.log('🔐 LOGIN REQUEST');
  console.log('========================================');
  console.log(`Email: ${email}`);
  
  try {
    const user = await User.findOne({ email });
    if (!user) {
      console.log('❌ User not found\n');
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    console.log(`User found: ${user.name}`);
    console.log(`Email verified: ${user.emailVerified}`);
    
    if (!user.emailVerified) {
      console.log('❌ Email not verified - Please verify first\n');
      return res.status(401).json({ error: 'Please verify your email first. Check terminal for verification code.' });
    }
    
    const isValid = await bcrypt.compare(password, user.password);
    console.log(`Password valid: ${isValid}`);
    
    if (!isValid) {
      console.log('❌ Invalid password\n');
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, 'secret123', { expiresIn: '7d' });
    
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
        rollNumber: user.rollNumber,
        isGroup: user.isGroup,
        emailVerified: user.emailVerified
      }
    });
  } catch (err) {
    console.error('❌ Error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// UPDATE EMAIL
app.put('/api/auth/update-email', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });
  
  try {
    const decoded = jwt.verify(token, 'secret123');
    const { newEmail, currentPassword } = req.body;
    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) return res.status(401).json({ error: 'Wrong password' });
    
    // Check if new email already exists
    const emailExists = await User.findOne({ email: newEmail, _id: { $ne: user._id } });
    if (emailExists) return res.status(400).json({ error: 'Email already in use' });
    
    // Generate new verification code for the new email
    const verificationCode = crypto.randomInt(100000, 999999).toString();
    const verificationCodeExpires = Date.now() + 10 * 60 * 1000;
    
    user.email = newEmail;
    user.emailVerified = false;
    user.verificationCode = verificationCode;
    user.verificationCodeExpires = verificationCodeExpires;
    await user.save();
    
    console.log('\n' + '⭐'.repeat(60));
    console.log('🔐 EMAIL CHANGE - NEW VERIFICATION CODE:');
    console.log('⭐'.repeat(60));
    console.log(`         ${verificationCode}        `);
    console.log(`   New Email: ${newEmail}`);
    console.log('⭐'.repeat(60));
    console.log('\n');
    
    res.json({ success: true, message: 'Email updated. Please verify your new email. Check terminal for code.' });
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

// CHANGE PASSWORD
app.put('/api/auth/change-password', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });
  
  try {
    const decoded = jwt.verify(token, 'secret123');
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) return res.status(401).json({ error: 'Wrong password' });
    
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();
    
    res.json({ success: true, message: 'Password changed successfully' });
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

// ============ ADMIN ROUTES ============
const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });
  try {
    req.user = jwt.verify(token, 'secret123');
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

app.get('/api/admin/stats', authMiddleware, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  const teachers = await User.countDocuments({ role: 'teacher' });
  const students = await User.countDocuments({ role: 'student' });
  const projects = await Project.countDocuments();
  const evaluations = await Evaluation.countDocuments();
  res.json({ teachers, students, projects, evaluations });
});

app.get('/api/admin/users', authMiddleware, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  const users = await User.find({}).select('-password');
  res.json(users);
});

app.post('/api/admin/users', authMiddleware, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  const { name, email, password, role, department } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, password: hashedPassword, role, department, emailVerified: true });
  res.json({ success: true, user });
});

app.put('/api/admin/users/:id', authMiddleware, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  await User.findByIdAndUpdate(req.params.id, { name: req.body.name, email: req.body.email });
  res.json({ success: true });
});

app.delete('/api/admin/users/:id', authMiddleware, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  await User.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

app.get('/api/admin/projects', authMiddleware, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  const projects = await Project.find({});
  res.json(projects);
});

app.delete('/api/admin/projects/:id', authMiddleware, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  await Project.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

// ============ TEACHER ROUTES ============
app.get('/api/teacher/stats', authMiddleware, async (req, res) => {
  if (req.user.role !== 'teacher') return res.status(403).json({ error: 'Forbidden' });
  const teacher = await User.findById(req.user.id);
  const pending = await Project.countDocuments({ teacherId: req.user.id, status: 'pending' });
  const approved = await Project.countDocuments({ teacherId: req.user.id, status: 'approved' });
  const completed = await Project.countDocuments({ teacherId: req.user.id, isCompleted: true });
  const evaluations = await Evaluation.countDocuments({ evaluatorId: req.user.id });
  res.json({ pendingRequests: pending, acceptedGroups: approved, completedProjects: completed, capacity: teacher.capacity, acceptedGroupsCount: teacher.acceptedGroups, evaluationsCount: evaluations });
});

app.get('/api/teacher/pending', authMiddleware, async (req, res) => {
  if (req.user.role !== 'teacher') return res.status(403).json({ error: 'Forbidden' });
  const projects = await Project.find({ teacherId: req.user.id, status: 'pending' });
  res.json(projects);
});

app.get('/api/teacher/approved', authMiddleware, async (req, res) => {
  if (req.user.role !== 'teacher') return res.status(403).json({ error: 'Forbidden' });
  const projects = await Project.find({ teacherId: req.user.id, status: 'approved' });
  res.json(projects);
});

app.get('/api/teacher/completed', authMiddleware, async (req, res) => {
  if (req.user.role !== 'teacher') return res.status(403).json({ error: 'Forbidden' });
  const projects = await Project.find({ teacherId: req.user.id, isCompleted: true });
  res.json(projects);
});

app.put('/api/teacher/accept/:id', authMiddleware, async (req, res) => {
  if (req.user.role !== 'teacher') return res.status(403).json({ error: 'Forbidden' });
  const project = await Project.findById(req.params.id);
  const teacher = await User.findById(req.user.id);
  if (teacher.acceptedGroups >= teacher.capacity) {
    return res.status(400).json({ error: 'Capacity full! Max 4 groups.' });
  }
  project.status = 'approved';
  teacher.acceptedGroups += 1;
  await project.save();
  await teacher.save();
  res.json({ success: true });
});

app.put('/api/teacher/reject/:id', authMiddleware, async (req, res) => {
  if (req.user.role !== 'teacher') return res.status(403).json({ error: 'Forbidden' });
  await Project.findByIdAndUpdate(req.params.id, { status: 'rejected' });
  res.json({ success: true });
});

app.post('/api/teacher/comment/:id', authMiddleware, async (req, res) => {
  if (req.user.role !== 'teacher') return res.status(403).json({ error: 'Forbidden' });
  const user = await User.findById(req.user.id);
  const project = await Project.findById(req.params.id);
  project.comments.push({ userName: user.name, userRole: user.role, message: req.body.message, date: new Date() });
  await project.save();
  res.json({ success: true });
});

app.post('/api/teacher/evaluate/:id', authMiddleware, async (req, res) => {
  if (req.user.role !== 'teacher') return res.status(403).json({ error: 'Forbidden' });
  const { studentName, rollNumber, scores, feedback } = req.body;
  let total = scores.reduce((a, b) => a + b, 0);
  let grade = total >= 90 ? 'A+' : total >= 80 ? 'A' : total >= 70 ? 'B' : total >= 60 ? 'C' : 'D';
  const evaluation = await Evaluation.create({
    projectId: req.params.id,
    studentName,
    rollNumber,
    totalScore: total,
    grade,
    feedback,
    evaluatorId: req.user.id,
    scores: scores.map((s, i) => ({ criteria: `Criteria ${i + 1}`, score: s }))
  });
  res.json({ success: true, evaluation });
});

app.get('/api/teacher/evaluations/:id', authMiddleware, async (req, res) => {
  if (req.user.role !== 'teacher') return res.status(403).json({ error: 'Forbidden' });
  const evaluations = await Evaluation.find({ projectId: req.params.id });
  res.json(evaluations);
});

// ============ STUDENT ROUTES ============
app.get('/api/student/stats', authMiddleware, async (req, res) => {
  if (req.user.role !== 'student') return res.status(403).json({ error: 'Forbidden' });
  const user = await User.findById(req.user.id);
  const projects = await Project.find({ 'members.email': user.email });
  const evaluations = await Evaluation.find({ studentName: user.name });
  res.json({
    totalProjects: projects.length,
    approvedProjects: projects.filter(p => p.status === 'approved').length,
    completedProjects: projects.filter(p => p.isCompleted).length,
    evaluationsCount: evaluations.length
  });
});

app.get('/api/student/projects', authMiddleware, async (req, res) => {
  if (req.user.role !== 'student') return res.status(403).json({ error: 'Forbidden' });
  const user = await User.findById(req.user.id);
  const projects = await Project.find({ 'members.email': user.email });
  res.json(projects);
});

app.get('/api/student/supervisors', authMiddleware, async (req, res) => {
  if (req.user.role !== 'student') return res.status(403).json({ error: 'Forbidden' });
  const teachers = await User.find({ role: 'teacher' }).select('-password');
  res.json(teachers);
});

app.post('/api/student/project', authMiddleware, upload.single('file'), async (req, res) => {
  if (req.user.role !== 'student') return res.status(403).json({ error: 'Forbidden' });
  const user = await User.findById(req.user.id);
  const { projectTitle, description, teacherId } = req.body;
  const teacher = await User.findById(teacherId);
  const project = await Project.create({
    projectTitle, description, teacherId, teacherName: teacher.name,
    status: 'pending', fileName: req.file?.originalname,
    type: user.isGroup ? 'group' : 'individual',
    members: [{ studentId: user._id, studentName: user.name, rollNumber: user.rollNumber || 'N/A', email: user.email, isLeader: true }]
  });
  res.json({ success: true, project });
});

app.put('/api/student/project/:id', authMiddleware, upload.single('file'), async (req, res) => {
  if (req.user.role !== 'student') return res.status(403).json({ error: 'Forbidden' });
  const update = { projectTitle: req.body.projectTitle, description: req.body.description };
  if (req.file) update.fileName = req.file.originalname;
  await Project.findByIdAndUpdate(req.params.id, update);
  res.json({ success: true });
});

app.put('/api/student/complete/:id', authMiddleware, async (req, res) => {
  if (req.user.role !== 'student') return res.status(403).json({ error: 'Forbidden' });
  await Project.findByIdAndUpdate(req.params.id, { isCompleted: true });
  res.json({ success: true });
});

app.post('/api/student/comment/:id', authMiddleware, async (req, res) => {
  if (req.user.role !== 'student') return res.status(403).json({ error: 'Forbidden' });
  const user = await User.findById(req.user.id);
  const project = await Project.findById(req.params.id);
  project.comments.push({ userName: user.name, userRole: user.role, message: req.body.message, date: new Date() });
  await project.save();
  res.json({ success: true });
});

app.get('/api/student/evaluations', authMiddleware, async (req, res) => {
  if (req.user.role !== 'student') return res.status(403).json({ error: 'Forbidden' });
  const user = await User.findById(req.user.id);
  const evaluations = await Evaluation.find({ studentName: user.name });
  res.json(evaluations);
});

// ============ SEED DATA ============
async function seedData() {
  const adminExists = await User.findOne({ email: 'admin@fyp.com' });
  if (!adminExists) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await User.create({ name: 'Admin User', email: 'admin@fyp.com', password: hashedPassword, role: 'admin', emailVerified: true });
    console.log('✅ Admin created');
  }
  
  const teacherExists = await User.findOne({ email: 'teacher@fyp.com' });
  if (!teacherExists) {
    const hashedPassword = await bcrypt.hash('teacher123', 10);
    await User.create({ name: 'Dr. Asad Ahmed', email: 'teacher@fyp.com', password: hashedPassword, role: 'teacher', department: 'CS', emailVerified: true });
    console.log('✅ Teacher created');
  }
}

// START SERVER
const PORT = 5000;
app.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`);
  await seedData();
  console.log('✅ Database seeded with demo users');
});