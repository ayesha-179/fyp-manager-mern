const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
  proposalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Proposal', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userName: { type: String, required: true },
  userRole: { type: String, enum: ['admin', 'teacher', 'student'], required: true },
  fileName: { type: String, required: true },
  originalName: { type: String, required: true },
  fileUrl: { type: String, required: true },
  fileType: { type: String, required: true },
  fileSize: { type: Number, required: true },
  uploadedAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('File', fileSchema);