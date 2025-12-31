const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    enum: ['video', 'assessment', 'learningPath', 'general'],
    required: true,
  },
  targetId: {
    type: String, // videoId, assessmentId, learningPathId, or 'general'
    required: true,
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: true,
  },
  comment: {
    type: String,
    trim: true,
    maxlength: 1000,
  },
  // Structured feedback for assessments and learning paths
  feedback: {
    // Learning path specific
    usabilityScore: { type: Number, min: 1, max: 5 },
    relevanceScore: { type: Number, min: 1, max: 5 },
    recommend: { type: Boolean },
    improvements: { type: String, trim: true, maxlength: 2000 },

    // Assessment specific
    clarityScore: { type: Number, min: 1, max: 5 },
    difficultyMatch: { type: Number, min: 1, max: 5 },
    timeAdequacy: { type: Number, min: 1, max: 5 },

    // Generic tags
    tags: [String],
  },
  helpful: {
    count: {
      type: Number,
      default: 0,
    },
    users: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
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

reviewSchema.index({ userId: 1, type: 1, targetId: 1 });

module.exports = mongoose.model('Review', reviewSchema);

