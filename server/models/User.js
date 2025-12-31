const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 6,
    select: false,
  },
  assessments: [{
    assessmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Assessment',
    },
    score: Number,
    answers: [{
      questionId: String,
      answer: String,
      isCorrect: Boolean,
    }],
    completedAt: {
      type: Date,
      default: Date.now,
    },
  }],
  learningPath: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LearningPath',
  },
  points: {
    type: Number,
    default: 0,
  },
  totalTimeSpent: {
    type: Number, // in seconds
    default: 0,
  },
  weeklyTimeSpent: {
    type: Number, // in seconds
    default: 0,
  },
  lastActiveAt: {
    type: Date,
    default: Date.now,
  },
  videoProgress: [{
    videoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Video',
    },
    watchedDuration: {
      type: Number, // in seconds
      default: 0,
    },
    totalDuration: {
      type: Number,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    lastWatchedAt: {
      type: Date,
      default: Date.now,
    },
  }],
  weeklyStats: {
    weekStart: Date,
    timeSpent: Number,
    videosWatched: Number,
    assessmentsCompleted: Number,
    pointsEarned: Number,
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

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);

