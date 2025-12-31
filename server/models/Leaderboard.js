const mongoose = require('mongoose');

const leaderboardEntrySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  userName: {
    type: String,
    required: true,
  },
  points: {
    type: Number,
    default: 0,
  },
  weeklyTimeSpent: {
    type: Number, // in seconds
    default: 0,
  },
  videosWatched: {
    type: Number,
    default: 0,
  },
  assessmentsCompleted: {
    type: Number,
    default: 0,
  },
  rank: {
    type: Number,
    required: true,
  },
  weekStart: {
    type: Date,
    required: true,
  },
  weekEnd: {
    type: Date,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

leaderboardEntrySchema.index({ weekStart: -1, rank: 1 });

module.exports = mongoose.model('Leaderboard', leaderboardEntrySchema);

