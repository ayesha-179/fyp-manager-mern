const mongoose = require('mongoose');

const evaluationSchema = new mongoose.Schema({
  proposalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Proposal', required: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  studentName: { type: String, required: true },
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  teacherName: { type: String, required: true },
  criteria: {
    presentationSkills: { type: Number, default: 0, min: 0, max: 10 },
    technicalKnowledge: { type: Number, default: 0, min: 0, max: 10 },
    problemHandling: { type: Number, default: 0, min: 0, max: 10 },
    toolUsage: { type: Number, default: 0, min: 0, max: 10 },
    qaHandling: { type: Number, default: 0, min: 0, max: 10 },
    documentation: { type: Number, default: 0, min: 0, max: 10 }
  },
  totalScore: { type: Number, default: 0 },
  percentage: { type: Number, default: 0 },
  grade: { type: String, default: '' },
  feedback: { type: String, required: true },
  evaluatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

evaluationSchema.pre('save', function(next) {
  const total = Object.values(this.criteria).reduce((a, b) => a + b, 0);
  const percentage = (total / 60) * 100;
  this.totalScore = total;
  this.percentage = percentage;
  if (percentage >= 90) this.grade = 'A+';
  else if (percentage >= 80) this.grade = 'A';
  else if (percentage >= 70) this.grade = 'B+';
  else if (percentage >= 60) this.grade = 'B';
  else if (percentage >= 50) this.grade = 'C';
  else if (percentage >= 40) this.grade = 'D';
  else this.grade = 'F';
  next();
});

module.exports = mongoose.model('Evaluation', evaluationSchema);