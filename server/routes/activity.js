const express = require('express');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Helper function to get start of week (Sunday)
const getWeekStart = () => {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day;
  const sunday = new Date(d.setDate(diff));
  sunday.setHours(0, 0, 0, 0);
  return sunday;
};

// @route   POST /api/activity/track-time
// @desc    Track time spent on website
// @access  Private
router.post('/track-time', protect, async (req, res) => {
  try {
    const { seconds, timestamp } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const weekStart = getWeekStart();
    const isNewWeek = !user.weeklyStats?.weekStart ||
      new Date(user.weeklyStats.weekStart).getTime() !== weekStart.getTime();

    // Update total time
    user.totalTimeSpent = (user.totalTimeSpent || 0) + seconds;
    user.weeklyTimeSpent = (user.weeklyTimeSpent || 0) + seconds;
    user.lastActiveAt = Date.now();

    // Reset weekly stats if new week
    const now = timestamp ? new Date(timestamp) : new Date();
    const hour = now.getHours();

    if (isNewWeek) {
      user.weeklyTimeSpent = seconds;
      user.weeklyStats = {
        weekStart,
        timeSpent: seconds,
        videosWatched: 0,
        assessmentsCompleted: 0,
        pointsEarned: 0,
        hourly: Array.from({ length: 24 }, () => 0),
      };
      // increment the hour bucket
      user.weeklyStats.hourly[hour] = (user.weeklyStats.hourly[hour] || 0) + seconds;
    } else {
      user.weeklyStats.timeSpent = (user.weeklyStats.timeSpent || 0) + seconds;
      // ensure hourly exists
      if (!user.weeklyStats.hourly || !Array.isArray(user.weeklyStats.hourly) || user.weeklyStats.hourly.length !== 24) {
        user.weeklyStats.hourly = Array.from({ length: 24 }, () => 0);
      }
      user.weeklyStats.hourly[hour] = (user.weeklyStats.hourly[hour] || 0) + seconds;
    }

    await user.save();

    res.json({
      totalTimeSpent: user.totalTimeSpent,
      weeklyTimeSpent: user.weeklyTimeSpent,
      weeklyStats: user.weeklyStats,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/activity/stats
// @desc    Get user activity stats
// @access  Private
router.get('/stats', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('totalTimeSpent weeklyTimeSpent weeklyStats points videoProgress assessments lastActiveAt');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const formatTime = (seconds) => {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      return { hours, minutes, totalSeconds: seconds };
    };

    res.json({
      totalTimeSpent: formatTime(user.totalTimeSpent || 0),
      weeklyTimeSpent: formatTime(user.weeklyTimeSpent || 0),
      weeklyStats: user.weeklyStats || {},
      hourlyUsage: (user.weeklyStats && Array.isArray(user.weeklyStats.hourly)) ? user.weeklyStats.hourly : Array.from({ length: 24 }, () => 0),
      points: user.points || 0,
      videosCompleted: user.videoProgress?.filter(vp => vp.completed).length || 0,
      assessmentsCompleted: user.assessments?.length || 0,
      lastActiveAt: user.lastActiveAt,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

