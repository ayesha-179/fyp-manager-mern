const mongoose = require('mongoose');

const criteria = [
  "Presentation Skills", "Question Answer Handling", "Tools & Technologies Used",
  "Backend Explanation", "Communication Skills", "Appearance / Professionalism",
  "Confidence Level", "Project Demonstration", "Technical Knowledge"
];

const evaluationSchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  studentName: { type: String, required: true },
  rollNumber: String,
  scores: [{
    criteria: String,
    score: { type: Number, min: 0, max: 10 }
  }],
  totalScore: { type: Number, default: 0 },
  grade: { type: String, enum: ['A+', 'A', 'B', 'C', 'D', 'F'], default: 'F' },
  feedback: String,
  evaluatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Evaluation', evaluationSchema);