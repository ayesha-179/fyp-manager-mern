const express = require('express');
const User = require('../models/User');
const Teacher = require('../models/Teacher');
const Student = require('../models/Student');
const Proposal = require('../models/Proposal');
const Evaluation = require('../models/Evaluation');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();
router.use(protect, authorize('admin'));

router.get('/dashboard', async (req, res) => {
  try {
    const totalTeachers = await User.countDocuments({ role: 'teacher' });
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalProposals = await Proposal.countDocuments();
    const pendingProposals = await Proposal.countDocuments({ status: 'pending' });
    const approvedProposals = await Proposal.countDocuments({ status: 'approved' });
    const completedProposals = await Proposal.countDocuments({ isCompleted: true });
    const totalEvaluations = await Evaluation.countDocuments();
    const teachers = await Teacher.find().populate('userId', 'name email department');
    const students = await Student.find().populate('userId', 'name email');
    res.json({ success: true, data: { totalTeachers, totalStudents, totalProposals, pendingProposals, approvedProposals, completedProposals, totalEvaluations, teachers, students } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/teacher/:id', async (req, res) => {
  try {
    await Teacher.findOneAndDelete({ userId: req.params.id });
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Teacher deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/student/:id', async (req, res) => {
  try {
    await Student.findOneAndDelete({ userId: req.params.id });
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Student deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;