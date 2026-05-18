const mongoose = require('mongoose');

const proposalSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  studentName: { type: String, required: true },
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  teacherName: { type: String, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  isCompleted: { type: Boolean, default: false },
  submittedAt: { type: Date, default: Date.now },
  approvedAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Proposal', proposalSchema);