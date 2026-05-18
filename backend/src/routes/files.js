const express = require('express');
const File = require('../models/File');
const Proposal = require('../models/Proposal');
const Notification = require('../models/Notification');
const upload = require('../middleware/upload');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.post('/upload/:proposalId', protect, authorize('student'), upload.single('file'), async (req, res) => {
  try {
    const { proposalId } = req.params;
    const proposal = await Proposal.findById(proposalId);
    if (!proposal) return res.status(404).json({ success: false, message: 'Proposal not found' });
    if (proposal.studentId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
    
    const file = await File.create({
      proposalId, userId: req.user._id, userName: req.user.name, userRole: req.user.role,
      fileName: req.file.filename, originalName: req.file.originalname,
      fileUrl: `/uploads/${req.file.filename}`, fileType: req.file.mimetype, fileSize: req.file.size
    });
    await Notification.create({ userId: proposal.teacherId, title: 'File Uploaded', message: `${req.user.name} uploaded "${req.file.originalname}" to project "${proposal.title}"`, type: 'file' });
    res.json({ success: true, data: file });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/proposal/:proposalId', protect, async (req, res) => {
  try {
    const files = await File.find({ proposalId: req.params.proposalId }).sort({ uploadedAt: -1 });
    res.json({ success: true, data: files });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;