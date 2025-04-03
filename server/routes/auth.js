
const express = require('express');
const { check, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const Educator = require('../models/Educator');
const Course = require('../models/Course');
const auth = require('../middlewares/auth');

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register a new educator
// @access  Public
router.post(
  '/register',
  [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password must be at least 6 characters').isLength({ min: 6 }),
    check('department', 'Department is required').not().isEmpty(),
    check('semester', 'Semester is required').not().isEmpty(),
    check('courses', 'Courses must be an array').isArray()
  ],
  async (req, res) => {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, department, semester, courses } = req.body;

    try {
      // Check if educator already exists
      let educator = await Educator.findOne({ email });
      if (educator) {
        return res.status(400).json({ message: 'Educator already exists' });
      }

      // Find course ids
      const courseIds = await Course.find({ code: { $in: courses } }).select('_id');
      
      // Create new educator
      educator = new Educator({
        name,
        email,
        password,
        department,
        semester,
        courses: courseIds
      });

      // Save educator
      await educator.save();

      res.status(201).json({ message: 'Educator registered successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// @route   POST /api/auth/login
// @desc    Login educator & get token
// @access  Public
router.post(
  '/login',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists()
  ],
  async (req, res) => {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      // Check if educator exists
      const educator = await Educator.findOne({ email });
      if (!educator) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      // Check password
      const isMatch = await educator.comparePassword(password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      // Create and sign token
      const payload = {
        id: educator.id
      };

      jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: '7d' },
        (err, token) => {
          if (err) throw err;
          
          // Return user info without password
          const userToReturn = {
            id: educator._id,
            name: educator.name,
            email: educator.email,
            department: educator.department,
            semester: educator.semester,
            courses: educator.courses
          };
          
          res.json({ token, user: userToReturn });
        }
      );
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// @route   GET /api/auth/me
// @desc    Get current educator
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    // Get educator with courses populated
    const educator = await Educator.findById(req.educator._id)
      .select('-password')
      .populate('courses', 'name code');
    
    res.json(educator);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
