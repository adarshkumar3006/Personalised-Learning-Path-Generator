const mongoose = require('mongoose');

const topicSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
  difficulty: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Beginner',
  },
  estimatedHours: {
    type: Number,
    default: 0,
  },
  resources: [{
    type: {
      type: String,
      enum: ['Article', 'Video', 'Course', 'Documentation', 'Practice'],
    },
    title: String,
    url: String,
    description: String,
  }],
  prerequisites: [{
    type: String, // topic IDs
  }],
  completed: {
    type: Boolean,
    default: false,
  },
  completedAt: {
    type: Date,
  },
  order: {
    type: Number,
    default: 0,
  },
});

const learningPathSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  title: {
    type: String,
    default: 'My Learning Path',
  },
  description: {
    type: String,
    default: '',
  },
  topics: [topicSchema],
  assessmentResults: {
    type: Map,
    of: {
      subject: String,
      score: Number,
      level: String,
    },
  },
  progress: {
    completedTopics: {
      type: Number,
      default: 0,
    },
    totalTopics: {
      type: Number,
      default: 0,
    },
    percentage: {
      type: Number,
      default: 0,
    },
  },
  generatedAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Calculate progress before saving
learningPathSchema.pre('save', function(next) {
  this.progress.totalTopics = this.topics.length;
  this.progress.completedTopics = this.topics.filter(t => t.completed).length;
  this.progress.percentage = this.progress.totalTopics > 0
    ? Math.round((this.progress.completedTopics / this.progress.totalTopics) * 100)
    : 0;
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('LearningPath', learningPathSchema);

