
require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Course = require('../models/Course');
const Educator = require('../models/Educator');

// Sample data
const courses = [
  {
    name: 'Data Structures and Algorithms',
    code: 'CS201',
    department: 'Computer Science',
    credits: 4,
    description: 'Fundamentals of data structures and algorithms design and analysis.'
  },
  {
    name: 'Database Management Systems',
    code: 'CS301',
    department: 'Computer Science',
    credits: 3,
    description: 'Introduction to database concepts, design, and implementation.'
  },
  {
    name: 'Artificial Intelligence',
    code: 'CS401',
    department: 'Computer Science',
    credits: 4,
    description: 'Foundations of AI including search, knowledge representation, and machine learning.'
  },
  {
    name: 'Linear Algebra',
    code: 'MATH201',
    department: 'Mathematics',
    credits: 3,
    description: 'Vector spaces, linear transformations, matrices, and determinants.'
  },
  {
    name: 'Digital Electronics',
    code: 'ECE201',
    department: 'Electronics',
    credits: 4,
    description: 'Introduction to digital systems, combinational and sequential circuits.'
  }
];

const educators = [
  {
    name: 'John Doe',
    email: 'john.doe@example.com',
    password: 'password123',
    department: 'Computer Science',
    semester: 'Fall 2023',
    role: 'admin'
  },
  {
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    password: 'password123',
    department: 'Mathematics',
    semester: 'Spring 2023'
  }
];

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB');
    
    try {
      // Clear existing data
      await Course.deleteMany({});
      await Educator.deleteMany({});
      
      // Insert courses
      const createdCourses = await Course.insertMany(courses);
      console.log(`${createdCourses.length} courses inserted`);
      
      // Prepare educators with course references
      const educatorsWithCourses = educators.map(educator => {
        // Assign some courses to each educator
        const coursesToAssign = createdCourses
          .filter(course => course.department === educator.department || Math.random() > 0.7)
          .slice(0, 3);
        
        return {
          ...educator,
          courses: coursesToAssign.map(course => course._id)
        };
      });
      
      // Insert educators (password will be hashed by the pre-save hook)
      for (const educator of educatorsWithCourses) {
        const newEducator = new Educator(educator);
        await newEducator.save();
        console.log(`Educator created: ${newEducator.name}`);
      }
      
      console.log('Database seeding completed successfully');
      process.exit(0);
    } catch (error) {
      console.error('Error seeding database:', error);
      process.exit(1);
    }
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });
