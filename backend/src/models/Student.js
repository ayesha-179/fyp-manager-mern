const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  rollNumber: { type: String, required: true, unique: true },
  program: { type: String, enum: ['BS CS', 'BS SE', 'BS AI', 'BS DS'], default: 'BS CS' }
}, { timestamps: true });

module.exports = mongoose.model('Student', studentSchema);