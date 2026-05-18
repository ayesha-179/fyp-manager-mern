const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  text: { type: String, required: true, trim: true },
  proposalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Proposal', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userName: { type: String, required: true },
  userRole: { type: String, enum: ['admin', 'teacher', 'student'], required: true },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Comment', commentSchema);