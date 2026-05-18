const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  employeeId: { type: String, required: true, unique: true },
  specialization: { type: String, default: '' },
  capacity: { type: Number, default: 3, min: 1, max: 10 },
  acceptedGroups: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Teacher', teacherSchema);