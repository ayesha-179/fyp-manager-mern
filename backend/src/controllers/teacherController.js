const Project = require('../models/Project');
const User = require('../models/User');
const Evaluation = require('../models/Evaluation');

const CRITERIA = [
  "Presentation Skills", "Question Answer Handling", "Tools & Technologies Used",
  "Backend Explanation", "Communication Skills", "Appearance / Professionalism",
  "Confidence Level", "Project Demonstration", "Technical Knowledge"
];

exports.getStats = async (req, res) => {
  try {
    const teacher = await User.findById(req.user.id);
    const pendingRequests = await Project.countDocuments({ teacherId: req.user.id, status: 'pending' });
    const acceptedGroups = await Project.countDocuments({ teacherId: req.user.id, status: 'approved' });
    const completedProjects = await Project.countDocuments({ teacherId: req.user.id, isCompleted: true });
    const evaluations = await Evaluation.countDocuments({ evaluatorId: req.user.id });
    
    res.json({
      pendingRequests,
      acceptedGroups,
      completedProjects,
      capacity: teacher.capacity,
      acceptedGroupsCount: teacher.acceptedGroups,
      evaluations
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getPendingRequests = async (req, res) => {
  try {
    const projects = await Project.find({ teacherId: req.user.id, status: 'pending' });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getApprovedGroups = async (req, res) => {
  try {
    const projects = await Project.find({ teacherId: req.user.id, status: 'approved' });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getCompletedProjects = async (req, res) => {
  try {
    const projects = await Project.find({ teacherId: req.user.id, isCompleted: true });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.acceptProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    const teacher = await User.findById(req.user.id);
    
    if (teacher.acceptedGroups >= teacher.capacity) {
      return res.status(400).json({ error: 'Capacity full! Maximum 4 groups allowed.' });
    }
    
    project.status = 'approved';
    teacher.acceptedGroups += 1;
    await project.save();
    await teacher.save();
    
    res.json({ success: true, message: 'Project accepted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.rejectProject = async (req, res) => {
  try {
    await Project.findByIdAndUpdate(req.params.id, { status: 'rejected' });
    res.json({ success: true, message: 'Project rejected' });
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

exports.saveEvaluation = async (req, res) => {
  try {
    const { studentId, studentName, rollNumber, scores, feedback } = req.body;
    
    let totalScore = 0;
    for (let i = 0; i < scores.length; i++) {
      totalScore += scores[i];
    }
    
    let grade = 'F';
    if (totalScore >= 90) grade = 'A+';
    else if (totalScore >= 80) grade = 'A';
    else if (totalScore >= 70) grade = 'B';
    else if (totalScore >= 60) grade = 'C';
    else if (totalScore >= 50) grade = 'D';
    
    const formattedScores = scores.map((score, i) => ({ criteria: CRITERIA[i], score }));
    
    const evaluation = await Evaluation.create({
      projectId: req.params.id,
      studentId,
      studentName,
      rollNumber,
      scores: formattedScores,
      totalScore,
      grade,
      feedback,
      evaluatorId: req.user.id
    });
    
    res.json({ success: true, evaluation });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getEvaluations = async (req, res) => {
  try {
    const evaluations = await Evaluation.find({ projectId: req.params.id });
    res.json(evaluations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};