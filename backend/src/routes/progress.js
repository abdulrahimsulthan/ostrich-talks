const express = require('express');
const Progress = require('../models/Progress');
const User = require('../models/User');
const { asyncHandler, AppError } = require('../middleware/errorHandler');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/progress
// @desc    Get user's progress overview
// @access  Private
router.get('/', authMiddleware, asyncHandler(async (req, res) => {
  const { status, limit = 20, page = 1 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const filter = { user: req.user._id };
  if (status) filter.status = status;

  const progress = await Progress.find(filter)
    .populate('lesson', 'title description type category difficulty estimatedDuration')
    .sort({ updatedAt: -1 })
    .limit(parseInt(limit))
    .skip(skip);

  const total = await Progress.countDocuments(filter);

  // Get user stats
  const stats = await Progress.getUserStats(req.user._id);
  const user = await User.findById(req.user._id);

  res.json({
    success: true,
    data: {
      progress,
      stats: {
        ...stats,
        currentLevel: user.level,
        currentStreak: user.streak,
        currentLeague: user.league
      },
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    }
  });
}));

// @route   GET /api/progress/completed
// @desc    Get user's completed lessons
// @access  Private
router.get('/completed', authMiddleware, asyncHandler(async (req, res) => {
  const { limit = 20, page = 1 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const progress = await Progress.find({
    user: req.user._id,
    status: 'completed'
  })
  .populate('lesson', 'title description type category difficulty')
  .sort({ completedAt: -1 })
  .limit(parseInt(limit))
  .skip(skip);

  const total = await Progress.countDocuments({
    user: req.user._id,
    status: 'completed'
  });

  res.json({
    success: true,
    data: {
      progress,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    }
  });
}));

// @route   GET /api/progress/in-progress
// @desc    Get user's in-progress lessons
// @access  Private
router.get('/in-progress', authMiddleware, asyncHandler(async (req, res) => {
  const progress = await Progress.find({
    user: req.user._id,
    status: 'in-progress'
  })
  .populate('lesson', 'title description type category difficulty estimatedDuration')
  .sort({ updatedAt: -1 });

  res.json({
    success: true,
    data: { progress }
  });
}));

// @route   GET /api/progress/stats
// @desc    Get detailed user statistics
// @access  Private
router.get('/stats', authMiddleware, asyncHandler(async (req, res) => {
  const { period = 'all' } = req.query;
  
  let dateFilter = {};
  if (period === 'week') {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    dateFilter = { completedAt: { $gte: weekAgo } };
  } else if (period === 'month') {
    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    dateFilter = { completedAt: { $gte: monthAgo } };
  } else if (period === 'year') {
    const yearAgo = new Date();
    yearAgo.setFullYear(yearAgo.getFullYear() - 1);
    dateFilter = { completedAt: { $gte: yearAgo } };
  }

  const filter = { user: req.user._id, status: 'completed', ...dateFilter };

  const stats = await Progress.aggregate([
    { $match: filter },
    {
      $group: {
        _id: null,
        totalLessons: { $sum: 1 },
        averageScore: { $avg: '$score' },
        totalTimeSpent: { $sum: '$timeSpent' },
        totalMistakes: { $sum: '$mistakes' },
        totalXpEarned: { $sum: '$xpEarned' },
        totalFeathersEarned: { $sum: '$feathersEarned' }
      }
    }
  ]);

  // Get progress by lesson type
  const typeStats = await Progress.aggregate([
    { $match: filter },
    {
      $lookup: {
        from: 'lessons',
        localField: 'lesson',
        foreignField: '_id',
        as: 'lessonData'
      }
    },
    { $unwind: '$lessonData' },
    {
      $group: {
        _id: '$lessonData.type',
        count: { $sum: 1 },
        averageScore: { $avg: '$score' }
      }
    }
  ]);

  // Get progress by category
  const categoryStats = await Progress.aggregate([
    { $match: filter },
    {
      $lookup: {
        from: 'lessons',
        localField: 'lesson',
        foreignField: '_id',
        as: 'lessonData'
      }
    },
    { $unwind: '$lessonData' },
    {
      $group: {
        _id: '$lessonData.category',
        count: { $sum: 1 },
        averageScore: { $avg: '$score' }
      }
    }
  ]);

  // Get daily progress for streak calculation
  const dailyProgress = await Progress.aggregate([
    { $match: filter },
    {
      $group: {
        _id: {
          $dateToString: {
            format: '%Y-%m-%d',
            date: '$completedAt'
          }
        },
        lessonsCompleted: { $sum: 1 }
      }
    },
    { $sort: { _id: -1 } },
    { $limit: 30 } // Last 30 days
  ]);

  const user = await User.findById(req.user._id);

  res.json({
    success: true,
    data: {
      overview: stats[0] || {
        totalLessons: 0,
        averageScore: 0,
        totalTimeSpent: 0,
        totalMistakes: 0,
        totalXpEarned: 0,
        totalFeathersEarned: 0
      },
      typeStats,
      categoryStats,
      dailyProgress,
      currentStreak: user.streak,
      currentLevel: user.level,
      currentXp: user.xp,
      currentFeathers: user.feathers
    }
  });
}));

// @route   GET /api/progress/streak
// @desc    Get user's streak information
// @access  Private
router.get('/streak', authMiddleware, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  // Get streak history
  const streakHistory = await Progress.aggregate([
    {
      $match: {
        user: req.user._id,
        status: 'completed'
      }
    },
    {
      $group: {
        _id: {
          $dateToString: {
            format: '%Y-%m-%d',
            date: '$completedAt'
          }
        },
        lessonsCompleted: { $sum: 1 },
        totalXp: { $sum: '$xpEarned' }
      }
    },
    { $sort: { _id: -1 } },
    { $limit: 30 } // Last 30 days
  ]);

  // Calculate current streak
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;

  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  for (let i = 0; i < streakHistory.length; i++) {
    const date = new Date(streakHistory[i]._id);
    
    if (i === 0) {
      // Check if today or yesterday
      if (date.toDateString() === today.toDateString() || 
          date.toDateString() === yesterday.toDateString()) {
        tempStreak = 1;
        currentStreak = 1;
      }
    } else {
      const prevDate = new Date(streakHistory[i - 1]._id);
      const dayDiff = (prevDate - date) / (1000 * 60 * 60 * 24);
      
      if (dayDiff === 1) {
        tempStreak++;
        if (i === 0 || date.toDateString() === yesterday.toDateString()) {
          currentStreak = tempStreak;
        }
      } else {
        tempStreak = 1;
      }
    }
    
    longestStreak = Math.max(longestStreak, tempStreak);
  }

  res.json({
    success: true,
    data: {
      currentStreak: user.streak,
      longestStreak,
      streakLevel: user.streakLevel,
      streakGoal: user.streakGoal,
      lastLessonDate: user.lastLessonDate,
      streakHistory
    }
  });
}));

// @route   POST /api/progress/sync
// @desc    Sync progress from mobile app
// @access  Private
router.post('/sync', authMiddleware, asyncHandler(async (req, res) => {
  const { progressData } = req.body;

  if (!progressData || !Array.isArray(progressData)) {
    throw new AppError('Invalid progress data', 400);
  }

  const syncResults = [];

  for (const data of progressData) {
    const { lessonId, status, score, timeSpent, exerciseResults } = data;

    let progress = await Progress.findUserProgress(req.user._id, lessonId);
    
    if (!progress) {
      progress = new Progress({
        user: req.user._id,
        lesson: lessonId,
        status: status || 'not-started'
      });
    }

    // Update progress data
    if (status) progress.status = status;
    if (score !== undefined) progress.score = score;
    if (timeSpent !== undefined) progress.timeSpent = timeSpent;
    if (exerciseResults && Array.isArray(exerciseResults)) {
      progress.exerciseResults = exerciseResults;
    }

    await progress.save();
    syncResults.push({ lessonId, status: 'synced' });
  }

  res.json({
    success: true,
    message: 'Progress synced successfully',
    data: { syncResults }
  });
}));

module.exports = router; 