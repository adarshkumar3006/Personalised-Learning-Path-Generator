const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
  },
  options: [{
    type: String,
    required: true,
  }],
  correctAnswer: {
    type: String,
    required: true,
  },
  explanation: {
    type: String,
    default: '',
  },
  points: {
    type: Number,
    default: 1,
  },
});

const assessmentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Assessment title is required'],
    trim: true,
  },
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    enum: ['JavaScript', 'Databases', 'React', 'Node.js', 'Python', 'Data Structures', 'Algorithms'],
    trim: true,
  },
  description: {
    type: String,
    default: '',
  },
  questions: [questionSchema],
  difficulty: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Beginner',
  },
  duration: {
    type: Number, // in minutes
    default: 30,
  },
  passingScore: {
    type: Number,
    default: 60,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Assessment', assessmentSchema);

