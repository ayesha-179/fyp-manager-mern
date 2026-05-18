const express = require('express');
const Evaluation = require('../models/Evaluation');
const Proposal = require('../models/Proposal');
const Notification = require('../models/Notification');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.post('/', protect, authorize('teacher'), async (req, res) => {
  try {
    const { proposalId, criteria, feedback } = req.body;
    const proposal = await Proposal.findById(proposalId);
    if (!proposal) return res.status(404).json({ success: false, message: 'Proposal not found' });
    if (proposal.teacherId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    if (!proposal.isCompleted) {
      return res.status(400).json({ success: false, message: 'Project must be completed first' });
    }
    const evaluation = await Evaluation.create({
      proposalId, studentId: proposal.studentId, studentName: proposal.studentName,
      teacherId: req.user._id, teacherName: req.user.name, criteria, feedback
    });
    await Notification.create({ userId: proposal.studentId, title: 'Evaluation Received', message: `Your project "${proposal.title}" scored ${evaluation.totalScore}/60 - Grade: ${evaluation.grade}`, type: 'evaluation' });
    res.status(201).json({ success: true, data: evaluation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/', protect, async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'student') query.studentId = req.user._id;
    if (req.user.role === 'teacher') query.teacherId = req.user._id;
    const evaluations = await Evaluation.find(query).sort({ evaluatedAt: -1 });
    res.json({ success: true, data: evaluations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;