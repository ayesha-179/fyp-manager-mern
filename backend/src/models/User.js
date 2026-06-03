const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, select: false },
  role: { type: String, enum: ['admin', 'teacher', 'student'], required: true },
  emailVerified: { type: Boolean, default: true },
  department: { type: String, default: 'CS' },
  capacity: { type: Number, default: 4 },
  acceptedGroups: { type: Number, default: 0 },
  rollNumber: String,
  isGroup: { type: Boolean, default: false },
  groupMembers: [{
    name: String,
    rollNumber: String,
    email: String
  }],
  createdAt: { type: Date, default: Date.now }
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);