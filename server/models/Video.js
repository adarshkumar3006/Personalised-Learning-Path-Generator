const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    default: '',
  },
  videoUrl: {
    type: String,
    required: true,
  },
  thumbnailUrl: {
    type: String,
    default: '',
  },
  duration: {
    type: Number, // in seconds
    required: true,
  },
  topicId: {
    type: String, // References topic.id in LearningPath
    required: true,
  },
  subject: {
    type: String,
    enum: ['JavaScript', 'Databases', 'React', 'Node.js', 'Python', 'Data Structures', 'Algorithms'],
    required: true,
  },
  difficulty: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Beginner',
  },
  provider: {
    type: String,
    enum: ['YouTube', 'Vimeo', 'Custom'],
    default: 'YouTube',
  },
  videoId: {
    type: String, // YouTube video ID or provider-specific ID
    required: true,
  },
  views: {
    type: Number,
    default: 0,
  },
  rating: {
    average: {
      type: Number,
      default: 0,
    },
    count: {
      type: Number,
      default: 0,
    },
  },
  order: {
    type: Number,
    default: 0,
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

module.exports = mongoose.model('Video', videoSchema);

