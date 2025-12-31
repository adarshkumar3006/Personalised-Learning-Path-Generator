const express = require('express');
const Leaderboard = require('../models/Leaderboard');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Helper function to get start of week (Sunday)
const getWeekStart = (date = new Date()) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day; // Sunday = 0
  const sunday = new Date(d.setDate(diff));
  sunday.setHours(0, 0, 0, 0);
  return sunday;
};

// Helper function to get end of week (Saturday)
const getWeekEnd = (date = new Date()) => {
  const weekStart = getWeekStart(date);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);
  return weekEnd;
};

// @route   GET /api/leaderboard
// @desc    Get current week leaderboard
// @access  Public
router.get('/', async (req, res) => {
  try {
    const weekStart = getWeekStart();
    const weekEnd = getWeekEnd();

    let leaderboard = await Leaderboard.find({ weekStart })
      .populate('userId', 'name email')
      .sort({ rank: 1 })
      .limit(10);

    // If no leaderboard exists for this week, generate it
    if (leaderboard.length === 0) {
      leaderboard = await generateLeaderboard(weekStart, weekEnd);
      return res.json(leaderboard);
    }

    // Sync leaderboard time and points with latest user data to keep timings accurate
    for (const entry of leaderboard) {
      try {
        const user = await User.findById(entry.userId).select('weeklyTimeSpent points videoProgress assessments');
        if (!user) continue;

        const videosWatched = (user.videoProgress || []).filter(vp => vp.completed).length;
        const assessmentsCompleted = (user.assessments || []).length;

        await Leaderboard.findByIdAndUpdate(entry._id, {
          $set: {
            weeklyTimeSpent: user.weeklyTimeSpent || 0,
            points: user.points || 0,
            videosWatched,
            assessmentsCompleted,
          }
        });
      } catch (err) {
        console.error('Error syncing leaderboard entry:', err);
      }
    }

    // Re-query updated leaderboard entries
    const updated = await Leaderboard.find({ weekStart })
      .populate('userId', 'name email')
      .limit(10);

    // Order by weeklyTimeSpent (desc), then points
    const ordered = updated.sort((a, b) => {
      if ((b.weeklyTimeSpent || 0) !== (a.weeklyTimeSpent || 0)) return (b.weeklyTimeSpent || 0) - (a.weeklyTimeSpent || 0);
      return (b.points || 0) - (a.points || 0);
    }).map((entry, idx) => ({
      _id: entry._id,
      userId: entry.userId,
      userName: entry.userName,
      points: entry.points,
      weeklyTimeSpent: entry.weeklyTimeSpent,
      videosWatched: entry.videosWatched,
      assessmentsCompleted: entry.assessmentsCompleted,
      rank: idx + 1,
    }));

    res.json(ordered);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/leaderboard/top3
// @desc    Get top 3 users for current week
// @access  Public
router.get('/top3', async (req, res) => {
  try {
    const weekStart = getWeekStart();

    let leaderboard = await Leaderboard.find({ weekStart })
      .populate('userId', 'name email')
      .sort({ rank: 1 })
      .limit(3);

    if (leaderboard.length === 0) {
      const weekEnd = getWeekEnd();
      leaderboard = await generateLeaderboard(weekStart, weekEnd);
      leaderboard = leaderboard.slice(0, 3);
      return res.json(leaderboard);
    }

    // Sync entries with latest user data
    for (const entry of leaderboard) {
      try {
        const user = await User.findById(entry.userId).select('weeklyTimeSpent points videoProgress assessments');
        if (!user) continue;
        const videosWatched = (user.videoProgress || []).filter(vp => vp.completed).length;
        const assessmentsCompleted = (user.assessments || []).length;

        await Leaderboard.findByIdAndUpdate(entry._id, {
          $set: {
            weeklyTimeSpent: user.weeklyTimeSpent || 0,
            points: user.points || 0,
            videosWatched,
            assessmentsCompleted,
          }
        });
      } catch (err) {
        console.error('Error syncing leaderboard entry:', err);
      }
    }

    const updated = await Leaderboard.find({ weekStart })
      .populate('userId', 'name email')
      .limit(3);

    const ordered = updated.sort((a, b) => {
      if ((b.weeklyTimeSpent || 0) !== (a.weeklyTimeSpent || 0)) return (b.weeklyTimeSpent || 0) - (a.weeklyTimeSpent || 0);
      return (b.points || 0) - (a.points || 0);
    }).map((entry, idx) => ({
      _id: entry._id,
      userId: entry.userId,
      userName: entry.userName,
      points: entry.points,
      weeklyTimeSpent: entry.weeklyTimeSpent,
      videosWatched: entry.videosWatched,
      assessmentsCompleted: entry.assessmentsCompleted,
      rank: idx + 1,
    }));

    res.json(ordered);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/leaderboard/my-rank
// @desc    Get current user's rank
// @access  Private
router.get('/my-rank', protect, async (req, res) => {
  try {
    const weekStart = getWeekStart();

    const entry = await Leaderboard.findOne({
      userId: req.user._id,
      weekStart: weekStart,
    })
      .populate('userId', 'name email');

    if (!entry) {
      return res.json({ rank: null, message: 'No ranking for this week yet' });
    }

    res.json(entry);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Function to generate leaderboard
async function generateLeaderboard(weekStart, weekEnd) {
  const users = await User.find({}).select('name email points weeklyTimeSpent videoProgress assessments');

  // Calculate weekly stats for each user
  const userStats = users.map(user => {
    const videosWatched = user.videoProgress.filter(vp => vp.completed).length;
    const assessmentsCompleted = user.assessments.length;

    // Calculate points (can be enhanced)
    let points = user.points || 0;

    return {
      userId: user._id,
      userName: user.name,
      points,
      weeklyTimeSpent: user.weeklyTimeSpent || 0,
      videosWatched,
      assessmentsCompleted,
    };
  });

  // Sort primarily by weekly time spent (more time -> higher rank), then points, then videos watched
  userStats.sort((a, b) => {
    if (b.weeklyTimeSpent !== a.weeklyTimeSpent) return b.weeklyTimeSpent - a.weeklyTimeSpent;
    if (b.points !== a.points) return b.points - a.points;
    return b.videosWatched - a.videosWatched;
  });

  // Create leaderboard entries
  const leaderboardEntries = userStats.map((stats, index) => ({
    userId: stats.userId,
    userName: stats.userName,
    points: stats.points,
    weeklyTimeSpent: stats.weeklyTimeSpent,
    videosWatched: stats.videosWatched,
    assessmentsCompleted: stats.assessmentsCompleted,
    rank: index + 1,
    weekStart,
    weekEnd,
  }));

  // Award bonus points to top 3
  const top3 = leaderboardEntries.slice(0, 3);
  for (let i = 0; i < top3.length; i++) {
    const bonusPoints = [100, 50, 25][i]; // 1st: 100, 2nd: 50, 3rd: 25
    top3[i].points += bonusPoints;

    // Update user points
    await User.findByIdAndUpdate(top3[i].userId, {
      $inc: { points: bonusPoints },
    });
  }

  // Save to database
  await Leaderboard.insertMany(leaderboardEntries);

  // Populate and return
  return await Leaderboard.find({ weekStart })
    .populate('userId', 'name email')
    .sort({ rank: 1 })
    .limit(10);
}

// @route   POST /api/leaderboard/generate
// @desc    Manually generate leaderboard (admin only - can be protected)
// @access  Private
router.post('/generate', protect, async (req, res) => {
  try {
    const weekStart = getWeekStart();
    const weekEnd = getWeekEnd();

    // Delete existing entries for this week
    await Leaderboard.deleteMany({ weekStart });

    const leaderboard = await generateLeaderboard(weekStart, weekEnd);

    res.json({ message: 'Leaderboard generated', leaderboard });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

