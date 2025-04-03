
const mongoose = require('mongoose');

const examSchema = new mongoose.Schema({
  educator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Educator',
    required: true
  },
  examType: {
    type: String,
    required: true,
    enum: ['CIE1', 'CIE2', 'SEMESTER_END']
  },
  semester: {
    type: String,
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Exam = mongoose.model('Exam', examSchema);

module.exports = Exam;
