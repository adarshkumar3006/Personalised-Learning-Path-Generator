const express = require('express');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/users/:id
// @desc    Get user profile
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    if (req.user._id.toString() !== req.params.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const user = await User.findById(req.params.id)
      .populate('learningPath')
      .populate({
        path: 'assessments.assessmentId',
        model: 'Assessment'
      })
      .select('-password');

    // Ensure assessments array exists and is properly formatted
    if (!user.assessments) {
      user.assessments = [];
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

