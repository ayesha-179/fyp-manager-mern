const express = require('express');
const Proposal = require('../models/Proposal');
const Teacher = require('../models/Teacher');
const Notification = require('../models/Notification');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.post('/', protect, authorize('student'), async (req, res) => {
  try {
    const { title, description, teacherId, teacherName } = req.body;
    const teacher = await Teacher.findOne({ userId: teacherId });
    if (!teacher) return res.status(404).json({ success: false, message: 'Teacher not found' });
    if (teacher.acceptedGroups >= teacher.capacity) {
      return res.status(400).json({ success: false, message: 'Teacher capacity is full' });
    }
    const proposal = await Proposal.create({
      title, description, studentId: req.user._id, studentName: req.user.name,
      teacherId, teacherName
    });
    await Notification.create({ userId: teacherId, title: 'New Proposal', message: `${req.user.name} submitted a proposal: ${title}`, type: 'proposal' });
    res.status(201).json({ success: true, data: proposal });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/', protect, async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'student') query.studentId = req.user._id;
    if (req.user.role === 'teacher') query.teacherId = req.user._id;
    const proposals = await Proposal.find(query).sort({ createdAt: -1 });
    res.json({ success: true, data: proposals });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/:id/approve', protect, authorize('teacher'), async (req, res) => {
  try {
    const proposal = await Proposal.findById(req.params.id);
    if (!proposal) return res.status(404).json({ success: false, message: 'Proposal not found' });
    if (proposal.teacherId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    const teacher = await Teacher.findOne({ userId: req.user._id });
    if (teacher.acceptedGroups >= teacher.capacity) {
      return res.status(400).json({ success: false, message: 'Teacher capacity is full' });
    }
    proposal.status = 'approved';
    proposal.approvedAt = new Date();
    await proposal.save();
    teacher.acceptedGroups += 1;
    await teacher.save();
    await Notification.create({ userId: proposal.studentId, title: 'Proposal Approved', message: `Your proposal "${proposal.title}" has been approved!`, type: 'proposal' });
    res.json({ success: true, data: proposal });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/:id/complete', protect, authorize('student'), async (req, res) => {
  try {
    const proposal = await Proposal.findById(req.params.id);
    if (!proposal) return res.status(404).json({ success: false, message: 'Proposal not found' });
    if (proposal.studentId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    proposal.isCompleted = true;
    proposal.completedAt = new Date();
    await proposal.save();
    await Notification.create({ userId: proposal.teacherId, title: 'Project Completed', message: `${req.user.name} completed the project "${proposal.title}"`, type: 'proposal' });
    res.json({ success: true, data: proposal });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;