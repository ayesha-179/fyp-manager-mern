const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  projectTitle: { type: String, required: true },
  description: { type: String, required: true },
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  teacherName: String,
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  isCompleted: { type: Boolean, default: false },
  fileUrl: String,
  fileName: String,
  submittedAt: { type: Date, default: Date.now },
  type: { type: String, enum: ['individual', 'group'], default: 'individual' },
  members: [{
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    studentName: String,
    rollNumber: String,
    email: String,
    isLeader: Boolean
  }],
  comments: [{
    userName: String,
    userRole: String,
    message: String,
    date: { type: Date, default: Date.now }
  }]
});

module.exports = mongoose.model('Project', projectSchema);