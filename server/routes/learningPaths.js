const express = require('express');
const LearningPath = require('../models/LearningPath');
const User = require('../models/User');
const Assessment = require('../models/Assessment');
const { protect } = require('../middleware/auth');
const { generateLearningPath } = require('../services/geminiService');

const router = express.Router();

// @route   GET /api/learning-paths/:userId
// @desc    Get user's learning path
// @access  Private
router.get('/:userId', protect, async (req, res) => {
  try {
    if (req.user._id.toString() !== req.params.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    let learningPath = await LearningPath.findOne({ userId: req.params.userId });

    if (!learningPath) {
      return res.status(404).json({ message: 'Learning path not found. Please generate one first.' });
    }

    res.json(learningPath);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/learning-paths/generate
// @desc    Generate learning path based on assessments
// @access  Private
router.post('/generate', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('assessments.assessmentId');
    
    if (!user.assessments || user.assessments.length === 0) {
      return res.status(400).json({ 
        message: 'Please complete at least one assessment before generating a learning path' 
      });
    }

    // Process assessment results
    const assessmentResults = {};
    const subjects = [];

    for (const assessmentResult of user.assessments) {
      const assessment = assessmentResult.assessmentId;
      if (assessment) {
        const subject = assessment.subject;
        subjects.push(subject);
        
        const level = assessmentResult.score >= 80 ? 'Advanced' : 
                     assessmentResult.score >= 60 ? 'Intermediate' : 'Beginner';
        
        assessmentResults[subject] = {
          subject,
          score: assessmentResult.score,
          level,
        };
      }
    }

    // Generate learning path using Claude API
    const topics = await generateLearningPath(assessmentResults, [...new Set(subjects)]);

    // Create or update learning path
    let learningPath = await LearningPath.findOne({ userId: user._id });

    if (learningPath) {
      learningPath.topics = topics;
      learningPath.assessmentResults = assessmentResults;
      learningPath.generatedAt = new Date();
      await learningPath.save();
    } else {
      learningPath = await LearningPath.create({
        userId: user._id,
        topics,
        assessmentResults,
      });
    }

    // Update user's learning path reference
    user.learningPath = learningPath._id;
    await user.save();

    res.status(201).json(learningPath);
  } catch (error) {
    console.error('Error generating learning path:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/learning-paths/:id/topic/:topicId
// @desc    Update topic completion status
// @access  Private
router.put('/:id/topic/:topicId', protect, async (req, res) => {
  try {
    const { completed } = req.body;
    const learningPath = await LearningPath.findOne({ userId: req.user._id });

    if (!learningPath) {
      return res.status(404).json({ message: 'Learning path not found' });
    }

    if (learningPath._id.toString() !== req.params.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Find topic by string ID (topics use string IDs like "db-1", "js-1", etc.)
    const topic = learningPath.topics.find(t => t.id === req.params.topicId);
    if (!topic) {
      return res.status(404).json({ message: 'Topic not found' });
    }

    topic.completed = completed !== undefined ? completed : !topic.completed;
    if (topic.completed) {
      topic.completedAt = new Date();
    } else {
      topic.completedAt = undefined;
    }

    await learningPath.save();

    res.json(learningPath);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/learning-paths/:id/progress
// @desc    Get learning path progress
// @access  Private
router.get('/:id/progress', protect, async (req, res) => {
  try {
    const learningPath = await LearningPath.findOne({ userId: req.user._id });

    if (!learningPath || learningPath._id.toString() !== req.params.id) {
      return res.status(404).json({ message: 'Learning path not found' });
    }

    res.json({
      progress: learningPath.progress,
      completedTopics: learningPath.topics.filter(t => t.completed).map(t => ({
        id: t.id,
        title: t.title,
        completedAt: t.completedAt,
      })),
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

