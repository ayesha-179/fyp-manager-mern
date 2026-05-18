const express = require('express');
const Comment = require('../models/Comment');
const Proposal = require('../models/Proposal');
const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/', protect, async (req, res) => {
  try {
    const { text, proposalId } = req.body;
    const proposal = await Proposal.findById(proposalId);
    if (!proposal) return res.status(404).json({ success: false, message: 'Proposal not found' });
    const comment = await Comment.create({
      text, proposalId, userId: req.user._id, userName: req.user.name, userRole: req.user.role
    });
    const notifyUserId = req.user.role === 'student' ? proposal.teacherId : proposal.studentId;
    await Notification.create({ userId: notifyUserId, title: 'New Comment', message: `${req.user.name} commented on "${proposal.title}"`, type: 'comment' });
    res.status(201).json({ success: true, data: comment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/proposal/:proposalId', protect, async (req, res) => {
  try {
    const comments = await Comment.find({ proposalId: req.params.proposalId }).sort({ createdAt: -1 });
    res.json({ success: true, data: comments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;