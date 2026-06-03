const Project = require('../models/Project');
const User = require('../models/User');
const Evaluation = require('../models/Evaluation');

exports.getStats = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const projects = await Project.find({ 'members.email': user.email });
    const evaluations = await Evaluation.find({ studentId: req.user.id });
    
    res.json({
      totalProjects: projects.length,
      approvedProjects: projects.filter(p => p.status === 'approved').length,
      completedProjects: projects.filter(p => p.isCompleted).length,
      evaluationsCount: evaluations.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getMyProjects = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const projects = await Project.find({ 'members.email': user.email });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getSupervisors = async (req, res) => {
  try {
    const teachers = await User.find({ role: 'teacher' }).select('-password');
    const teachersWithSlots = teachers.map(t => ({
      ...t.toObject(),
      availableSlots: t.capacity - t.acceptedGroups
    }));
    res.json(teachersWithSlots);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.submitProject = async (req, res) => {
  try {
    const { projectTitle, description, teacherId } = req.body;
    const teacher = await User.findById(teacherId);
    const user = await User.findById(req.user.id);
    
    const project = await Project.create({
      projectTitle,
      description,
      teacherId,
      teacherName: teacher.name,
      status: 'pending',
      type: 'individual',
      members: [{
        studentId: user._id,
        studentName: user.name,
        rollNumber: user.rollNumber || 'N/A',
        email: user.email,
        isLeader: true
      }]
    });
    
    res.status(201).json({ success: true, project });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateProject = async (req, res) => {
  try {
    const { projectTitle, description } = req.body;
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { projectTitle, description },
      { new: true }
    );
    res.json({ success: true, project });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.markComplete = async (req, res) => {
  try {
    await Project.findByIdAndUpdate(req.params.id, { isCompleted: true });
    res.json({ success: true, message: 'Project marked as complete' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getEvaluations = async (req, res) => {
  try {
    const evaluations = await Evaluation.find({ studentId: req.user.id });
    res.json(evaluations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.addComment = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    project.comments.push({
      userName: req.user.name,
      userRole: req.user.role,
      message: req.body.message,
      date: new Date()
    });
    await project.save();
    res.json({ success: true, message: 'Comment added' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};