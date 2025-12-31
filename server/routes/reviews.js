const express = require('express');
const Review = require('../models/Review');
const Video = require('../models/Video');
const Assessment = require('../models/Assessment');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/reviews
// @desc    Get reviews (filter by type and targetId)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { type, targetId } = req.query;
    const query = {};

    if (type) query.type = type;
    if (targetId) query.targetId = targetId;

    const reviews = await Review.find(query)
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/reviews
// @desc    Create a review
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { type, targetId, rating, comment, feedback } = req.body;

    // Check if user already reviewed this item
    const existingReview = await Review.findOne({
      userId: req.user._id,
      type,
      targetId,
    });

    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this item' });
    }

    const payload = {
      userId: req.user._id,
      type,
      targetId,
      rating,
      comment,
    };

    if (feedback && typeof feedback === 'object') {
      payload.feedback = feedback;
    }

    const review = await Review.create(payload);

    // Update rating for video or assessment
    if (type === 'video') {
      const video = await Video.findById(targetId);
      if (video) {
        const totalRating = (video.rating.average || 0) * (video.rating.count || 0) + (rating || 0);
        video.rating.count = (video.rating.count || 0) + (rating ? 1 : 0);
        video.rating.average = video.rating.count ? totalRating / video.rating.count : 0;
        await video.save();
      }
    }

    const populatedReview = await Review.findById(review._id)
      .populate('userId', 'name email');

    res.status(201).json(populatedReview);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/reviews/:id
// @desc    Update a review
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    if (review.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { rating, comment, feedback } = req.body;
    if (rating) review.rating = rating;
    if (comment !== undefined) review.comment = comment;
    if (feedback && typeof feedback === 'object') {
      review.feedback = { ...review.feedback, ...feedback };
    }
    review.updatedAt = Date.now();

    await review.save();

    const populatedReview = await Review.findById(review._id)
      .populate('userId', 'name email');

    res.json(populatedReview);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/reviews/:id/helpful
// @desc    Mark review as helpful
// @access  Private
router.post('/:id/helpful', protect, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    const userId = req.user._id.toString();
    const helpfulIndex = review.helpful.users.findIndex(
      id => id.toString() === userId
    );

    if (helpfulIndex === -1) {
      review.helpful.users.push(req.user._id);
      review.helpful.count += 1;
    } else {
      review.helpful.users.splice(helpfulIndex, 1);
      review.helpful.count -= 1;
    }

    await review.save();
    res.json({ helpful: review.helpful.count });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

