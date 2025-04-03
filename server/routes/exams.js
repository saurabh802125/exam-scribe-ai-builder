
const express = require('express');
const { check, validationResult } = require('express-validator');
const Exam = require('../models/Exam');
const auth = require('../middlewares/auth');

const router = express.Router();

// @route   POST /api/exams
// @desc    Create a new exam
// @access  Private
router.post(
  '/',
  [
    auth,
    check('examType', 'Exam type is required').not().isEmpty(),
    check('semester', 'Semester is required').not().isEmpty(),
    check('courseId', 'Course ID is required').not().isEmpty()
  ],
  async (req, res) => {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { examType, semester, courseId } = req.body;

    try {
      // Create new exam
      const exam = new Exam({
        educator: req.educator._id,
        examType,
        semester,
        course: courseId
      });

      // Save exam
      await exam.save();

      res.status(201).json(exam);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// @route   GET /api/exams
// @desc    Get all exams for current educator
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const exams = await Exam.find({ educator: req.educator._id })
      .populate('course', 'name code')
      .sort({ createdAt: -1 });
    
    res.json(exams);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
