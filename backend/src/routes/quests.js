const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Progress = require('../models/Progress');
const { asyncHandler, AppError } = require('../middleware/errorHandler');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/quests/daily
// @desc    Get daily quests
// @access  Private
router.get('/daily', authMiddleware, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  // Get today's date for quest tracking
  const today = new Date();
  const todayString = today.toISOString().split('T')[0];

  // Define daily quests
  const dailyQuests = [
    {
      id: 'complete_lessons',
      title: 'Complete Lessons',
      description: 'Complete 3 lessons today',
      type: 'daily',
      target: 3,
      reward: { xp: 50, feathers: 5 },
      progress: 0,
      completed: false
    },
    {
      id: 'maintain_streak',
      title: 'Maintain Streak',
      description: 'Maintain your learning streak',
      type: 'daily',
      target: 1,
      reward: { xp: 30, feathers: 3 },
      progress: user.streak > 0 ? 1 : 0,
      completed: user.streak > 0
    },
    {
      id: 'perfect_score',
      title: 'Perfect Score',
      description: 'Get a perfect score (100%) on any lesson',
      type: 'daily',
      target: 1,
      reward: { xp: 100, feathers: 10 },
      progress: 0,
      completed: false
    },
    {
      id: 'practice_time',
      title: 'Practice Time',
      description: 'Spend at least 15 minutes learning',
      type: 'daily',
      target: 15, // minutes
      reward: { xp: 40, feathers: 4 },
      progress: 0,
      completed: false
    }
  ];

  // Get today's completed lessons to calculate progress
  const todayStart = new Date(today);
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(today);
  todayEnd.setHours(23, 59, 59, 999);

  const todayProgress = await Progress.find({
    user: req.user._id,
    status: 'completed',
    completedAt: { $gte: todayStart, $lte: todayEnd }
  });

  // Calculate quest progress
  const completedLessons = todayProgress.length;
  const perfectScores = todayProgress.filter(p => p.score === 100).length;
  const totalTimeSpent = todayProgress.reduce((total, p) => total + p.timeSpent, 0) / 60; // Convert to minutes

  // Update quest progress
  dailyQuests[0].progress = Math.min(completedLessons, dailyQuests[0].target);
  dailyQuests[0].completed = completedLessons >= dailyQuests[0].target;

  dailyQuests[2].progress = Math.min(perfectScores, dailyQuests[2].target);
  dailyQuests[2].completed = perfectScores >= dailyQuests[2].target;

  dailyQuests[3].progress = Math.min(totalTimeSpent, dailyQuests[3].target);
  dailyQuests[3].completed = totalTimeSpent >= dailyQuests[3].target;

  res.json({
    success: true,
    data: {
      quests: dailyQuests,
      date: todayString,
      completedCount: dailyQuests.filter(q => q.completed).length,
      totalQuests: dailyQuests.length
    }
  });
}));

// @route   GET /api/quests/weekly
// @desc    Get weekly quests
// @access  Private
router.get('/weekly', authMiddleware, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  // Get current week
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  weekStart.setHours(0, 0, 0, 0);

  // Define weekly quests
  const weeklyQuests = [
    {
      id: 'complete_lessons_week',
      title: 'Weekly Learner',
      description: 'Complete 15 lessons this week',
      type: 'weekly',
      target: 15,
      reward: { xp: 200, feathers: 20 },
      progress: 0,
      completed: false
    },
    {
      id: 'maintain_streak_week',
      title: 'Streak Master',
      description: 'Maintain a 7-day streak',
      type: 'weekly',
      target: 7,
      reward: { xp: 300, feathers: 30 },
      progress: Math.min(user.streak, 7),
      completed: user.streak >= 7
    },
    {
      id: 'league_progress',
      title: 'League Climber',
      description: 'Earn 500 league points this week',
      type: 'weekly',
      target: 500,
      reward: { xp: 250, feathers: 25 },
      progress: 0,
      completed: false
    },
    {
      id: 'perfect_scores_week',
      title: 'Perfectionist',
      description: 'Get 5 perfect scores this week',
      type: 'weekly',
      target: 5,
      reward: { xp: 400, feathers: 40 },
      progress: 0,
      completed: false
    }
  ];

  // Get this week's progress
  const weekProgress = await Progress.find({
    user: req.user._id,
    status: 'completed',
    completedAt: { $gte: weekStart }
  });

  // Calculate progress
  const completedLessons = weekProgress.length;
  const perfectScores = weekProgress.filter(p => p.score === 100).length;

  weeklyQuests[0].progress = Math.min(completedLessons, weeklyQuests[0].target);
  weeklyQuests[0].completed = completedLessons >= weeklyQuests[0].target;

  weeklyQuests[2].progress = Math.min(user.leaguePoints % 1000, weeklyQuests[2].target); // Simplified calculation
  weeklyQuests[2].completed = (user.leaguePoints % 1000) >= weeklyQuests[2].target;

  weeklyQuests[3].progress = Math.min(perfectScores, weeklyQuests[3].target);
  weeklyQuests[3].completed = perfectScores >= weeklyQuests[3].target;

  res.json({
    success: true,
    data: {
      quests: weeklyQuests,
      weekStart: weekStart.toISOString(),
      completedCount: weeklyQuests.filter(q => q.completed).length,
      totalQuests: weeklyQuests.length
    }
  });
}));

// @route   POST /api/quests/claim/:questId
// @desc    Claim quest reward
// @access  Private
router.post('/claim/:questId', authMiddleware, asyncHandler(async (req, res) => {
  const { questId } = req.params;

  const user = await User.findById(req.user._id);

  // Get quest details (in a real app, this would come from a database)
  const questTypes = {
    'complete_lessons': {
      title: 'Complete Lessons',
      reward: { xp: 50, feathers: 5 }
    },
    'maintain_streak': {
      title: 'Maintain Streak',
      reward: { xp: 30, feathers: 3 }
    },
    'perfect_score': {
      title: 'Perfect Score',
      reward: { xp: 100, feathers: 10 }
    },
    'practice_time': {
      title: 'Practice Time',
      reward: { xp: 40, feathers: 4 }
    },
    'complete_lessons_week': {
      title: 'Weekly Learner',
      reward: { xp: 200, feathers: 20 }
    },
    'maintain_streak_week': {
      title: 'Streak Master',
      reward: { xp: 300, feathers: 30 }
    },
    'league_progress': {
      title: 'League Climber',
      reward: { xp: 250, feathers: 25 }
    },
    'perfect_scores_week': {
      title: 'Perfectionist',
      reward: { xp: 400, feathers: 40 }
    }
  };

  const quest = questTypes[questId];
  if (!quest) {
    throw new AppError('Quest not found', 404);
  }

  // Check if quest is completed (simplified check)
  // In a real app, you'd check against the actual quest completion status
  const isCompleted = true; // Placeholder

  if (!isCompleted) {
    throw new AppError('Quest not completed yet', 400);
  }

  // Check if already claimed (in a real app, you'd track this in a database)
  const alreadyClaimed = false; // Placeholder

  if (alreadyClaimed) {
    throw new AppError('Quest reward already claimed', 400);
  }

  // Award rewards
  const { xp, feathers } = quest.reward;
  user.xp += xp;
  user.feathers += feathers;

  await user.save();

  res.json({
    success: true,
    message: `Quest reward claimed! +${xp} XP, +${feathers} Feathers`,
    data: {
      quest: quest.title,
      rewards: { xp, feathers },
      newXp: user.xp,
      newFeathers: user.feathers
    }
  });
}));

// @route   GET /api/quests/achievements
// @desc    Get user achievements
// @access  Private
router.get('/achievements', authMiddleware, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  // Get user stats
  const stats = await Progress.getUserStats(req.user._id);

  // Define achievements
  const achievements = [
    {
      id: 'first_lesson',
      title: 'First Steps',
      description: 'Complete your first lesson',
      icon: '🎯',
      unlocked: stats.completedLessons > 0,
      progress: Math.min(stats.completedLessons, 1),
      target: 1,
      reward: { xp: 50, feathers: 5 }
    },
    {
      id: 'lesson_master',
      title: 'Lesson Master',
      description: 'Complete 50 lessons',
      icon: '📚',
      unlocked: stats.completedLessons >= 50,
      progress: Math.min(stats.completedLessons, 50),
      target: 50,
      reward: { xp: 500, feathers: 50 }
    },
    {
      id: 'streak_7',
      title: 'Week Warrior',
      description: 'Maintain a 7-day streak',
      icon: '🔥',
      unlocked: user.streak >= 7,
      progress: Math.min(user.streak, 7),
      target: 7,
      reward: { xp: 200, feathers: 20 }
    },
    {
      id: 'streak_30',
      title: 'Monthly Master',
      description: 'Maintain a 30-day streak',
      icon: '⚡',
      unlocked: user.streak >= 30,
      progress: Math.min(user.streak, 30),
      target: 30,
      reward: { xp: 1000, feathers: 100 }
    },
    {
      id: 'perfect_score',
      title: 'Perfect Score',
      description: 'Get a perfect score on any lesson',
      icon: '⭐',
      unlocked: stats.totalLessons > 0 && stats.averageScore >= 100,
      progress: stats.averageScore >= 100 ? 1 : 0,
      target: 1,
      reward: { xp: 100, feathers: 10 }
    },
    {
      id: 'league_promotion',
      title: 'League Promoter',
      description: 'Get promoted to a higher league',
      icon: '🏆',
      unlocked: user.league !== 'Bronze',
      progress: user.league !== 'Bronze' ? 1 : 0,
      target: 1,
      reward: { xp: 300, feathers: 30 }
    },
    {
      id: 'social_learner',
      title: 'Social Learner',
      description: 'Follow 10 other learners',
      icon: '👥',
      unlocked: user.following.length >= 10,
      progress: Math.min(user.following.length, 10),
      target: 10,
      reward: { xp: 150, feathers: 15 }
    },
    {
      id: 'time_invested',
      title: 'Time Investor',
      description: 'Spend 10 hours learning',
      icon: '⏰',
      unlocked: stats.totalTimeSpent >= 600, // 10 hours in minutes
      progress: Math.min(stats.totalTimeSpent, 600),
      target: 600,
      reward: { xp: 400, feathers: 40 }
    }
  ];

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalAchievements = achievements.length;

  res.json({
    success: true,
    data: {
      achievements,
      unlockedCount,
      totalAchievements,
      completionPercentage: Math.round((unlockedCount / totalAchievements) * 100)
    }
  });
}));

// @route   GET /api/quests/progress
// @desc    Get quest progress summary
// @access  Private
router.get('/progress', authMiddleware, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const stats = await Progress.getUserStats(req.user._id);

  // Get today's progress
  const today = new Date();
  const todayStart = new Date(today);
  todayStart.setHours(0, 0, 0, 0);

  const todayProgress = await Progress.find({
    user: req.user._id,
    status: 'completed',
    completedAt: { $gte: todayStart }
  });

  const summary = {
    today: {
      lessonsCompleted: todayProgress.length,
      timeSpent: Math.round(todayProgress.reduce((total, p) => total + p.timeSpent, 0) / 60),
      xpEarned: todayProgress.reduce((total, p) => total + p.xpEarned, 0),
      feathersEarned: todayProgress.reduce((total, p) => total + p.feathersEarned, 0)
    },
    overall: {
      totalLessons: stats.completedLessons,
      totalTimeSpent: Math.round(stats.totalTimeSpent),
      totalXp: user.xp,
      totalFeathers: user.feathers,
      currentStreak: user.streak,
      currentLevel: user.level,
      currentLeague: user.league
    }
  };

  res.json({
    success: true,
    data: { summary }
  });
}));

module.exports = router; 