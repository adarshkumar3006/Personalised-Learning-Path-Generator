const express = require('express');
const Video = require('../models/Video');
const { protect } = require('../middleware/auth');
const User = require('../models/User');

const router = express.Router();

// @route   GET /api/videos
// @desc    Get all videos or filter by topic/subject
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { topicId, subject, difficulty } = req.query;
    const query = {};

    if (topicId) query.topicId = topicId;
    if (subject) query.subject = subject;
    if (difficulty) query.difficulty = difficulty;

    const videos = await Video.find(query).sort({ order: 1, createdAt: -1 });
    res.json(videos);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/videos/:id
// @desc    Get specific video
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    // Increment views
    video.views += 1;
    await video.save();

    res.json(video);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/videos/:id/progress
// @desc    Update video watching progress
// @access  Private
router.post('/:id/progress', protect, async (req, res) => {
  try {
    const { watchedDuration, totalDuration } = req.body;
    const video = await Video.findById(req.params.id);
    
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    const user = await User.findById(req.user._id);
    const videoProgress = user.videoProgress.find(
      vp => vp.videoId.toString() === req.params.id
    );

    const completed = watchedDuration >= totalDuration * 0.9; // 90% watched = completed

    if (videoProgress) {
      videoProgress.watchedDuration = Math.max(videoProgress.watchedDuration, watchedDuration);
      videoProgress.totalDuration = totalDuration;
      videoProgress.completed = completed;
      videoProgress.lastWatchedAt = Date.now();
    } else {
      user.videoProgress.push({
        videoId: req.params.id,
        watchedDuration,
        totalDuration,
        completed,
      });
    }

    // Award points for completion
    if (completed && !videoProgress?.completed) {
      user.points += 10; // 10 points per video completion
      user.weeklyStats.pointsEarned = (user.weeklyStats.pointsEarned || 0) + 10;
    }

    await user.save();

    res.json({
      watchedDuration,
      totalDuration,
      completed,
      progress: (watchedDuration / totalDuration) * 100,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/videos/topic/:topicId
// @desc    Get videos for a specific topic
// @access  Public
router.get('/topic/:topicId', async (req, res) => {
  try {
    const videos = await Video.find({ topicId: req.params.topicId })
      .sort({ order: 1, rating: -1 });
    res.json(videos);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

