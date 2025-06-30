const express = require('express');
const User = require('../models/User');
const Progress = require('../models/Progress');
const { asyncHandler, AppError } = require('../middleware/errorHandler');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/leagues/leaderboard
// @desc    Get league leaderboard
// @access  Private
router.get('/leaderboard', authMiddleware, asyncHandler(async (req, res) => {
  const { league, limit = 50, page = 1 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const filter = {};
  if (league) filter.league = league;

  const leaderboard = await User.find(filter)
    .select('name profileUri level xp feathers streak league leaguePoints')
    .sort({ leaguePoints: -1, xp: -1 })
    .limit(parseInt(limit))
    .skip(skip);

  const total = await User.countDocuments(filter);

  // Get user's rank
  const userRank = await User.countDocuments({
    ...filter,
    $or: [
      { leaguePoints: { $gt: req.user.leaguePoints } },
      {
        leaguePoints: req.user.leaguePoints,
        xp: { $gt: req.user.xp }
      }
    ]
  });

  res.json({
    success: true,
    data: {
      leaderboard,
      userRank: userRank + 1,
      userStats: {
        name: req.user.name,
        profileUri: req.user.profileUri,
        level: req.user.level,
        xp: req.user.xp,
        feathers: req.user.feathers,
        streak: req.user.streak,
        league: req.user.league,
        leaguePoints: req.user.leaguePoints
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

// @route   GET /api/leagues/current
// @desc    Get current user's league information
// @access  Private
router.get('/current', authMiddleware, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  // Get league requirements and rewards
  const leagueInfo = {
    Bronze: { minPoints: 0, maxPoints: 999, promotionPoints: 1000, rewards: { feathers: 10 } },
    Silver: { minPoints: 1000, maxPoints: 2499, promotionPoints: 2500, rewards: { feathers: 25 } },
    Gold: { minPoints: 2500, maxPoints: 4999, promotionPoints: 5000, rewards: { feathers: 50 } },
    Platinum: { minPoints: 5000, maxPoints: 9999, promotionPoints: 10000, rewards: { feathers: 100 } },
    Diamond: { minPoints: 10000, maxPoints: 19999, promotionPoints: 20000, rewards: { feathers: 200 } },
    Master: { minPoints: 20000, maxPoints: null, promotionPoints: null, rewards: { feathers: 500 } }
  };

  const currentLeague = leagueInfo[user.league];
  const nextLeague = user.league === 'Master' ? null : 
    Object.keys(leagueInfo)[Object.keys(leagueInfo).indexOf(user.league) + 1];

  // Calculate progress to next league
  let progressToNext = 0;
  if (nextLeague && currentLeague.maxPoints) {
    const pointsInCurrentLeague = user.leaguePoints - currentLeague.minPoints;
    const totalPointsNeeded = currentLeague.maxPoints - currentLeague.minPoints;
    progressToNext = Math.min(100, Math.round((pointsInCurrentLeague / totalPointsNeeded) * 100));
  }

  // Get weekly stats
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - 7);

  const weeklyStats = await Progress.aggregate([
    {
      $match: {
        user: req.user._id,
        status: 'completed',
        completedAt: { $gte: weekStart }
      }
    },
    {
      $group: {
        _id: null,
        lessonsCompleted: { $sum: 1 },
        totalXp: { $sum: '$xpEarned' },
        totalFeathers: { $sum: '$feathersEarned' },
        averageScore: { $avg: '$score' }
      }
    }
  ]);

  res.json({
    success: true,
    data: {
      currentLeague: user.league,
      leaguePoints: user.leaguePoints,
      leagueWeek: user.leagueWeek,
      currentLeagueInfo: currentLeague,
      nextLeague,
      progressToNext,
      weeklyStats: weeklyStats[0] || {
        lessonsCompleted: 0,
        totalXp: 0,
        totalFeathers: 0,
        averageScore: 0
      }
    }
  });
}));

// @route   POST /api/leagues/update-points
// @desc    Update user's league points (called after lesson completion)
// @access  Private
router.post('/update-points', authMiddleware, asyncHandler(async (req, res) => {
  const { points, lessonScore } = req.body;

  if (!points || points < 0) {
    throw new AppError('Invalid points value', 400);
  }

  const user = await User.findById(req.user._id);
  const oldLeague = user.league;
  const oldPoints = user.leaguePoints;

  // Update league points
  user.leaguePoints += points;

  // Check for league promotion
  const leagueThresholds = {
    Bronze: 1000,
    Silver: 2500,
    Gold: 5000,
    Platinum: 10000,
    Diamond: 20000
  };

  let promoted = false;
  let newLeague = user.league;

  for (const [league, threshold] of Object.entries(leagueThresholds)) {
    if (user.leaguePoints >= threshold && user.league !== league) {
      newLeague = league;
      promoted = true;
    }
  }

  if (promoted) {
    user.league = newLeague;
    user.leagueWeek = 1; // Reset week for new league
  } else {
    // Increment week if in same league
    user.leagueWeek += 1;
  }

  await user.save();

  res.json({
    success: true,
    message: promoted ? `Congratulations! You've been promoted to ${newLeague} league!` : 'Points updated successfully',
    data: {
      oldLeague,
      newLeague: user.league,
      oldPoints,
      newPoints: user.leaguePoints,
      pointsGained: points,
      promoted,
      leagueWeek: user.leagueWeek
    }
  });
}));

// @route   GET /api/leagues/friends
// @desc    Get friends leaderboard
// @access  Private
router.get('/friends', authMiddleware, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('following', 'name profileUri level xp feathers streak league leaguePoints');

  // Get friends' stats
  const friends = user.following.map(friend => ({
    _id: friend._id,
    name: friend.name,
    profileUri: friend.profileUri,
    level: friend.level,
    xp: friend.xp,
    feathers: friend.feathers,
    streak: friend.streak,
    league: friend.league,
    leaguePoints: friend.leaguePoints
  }));

  // Sort by league points
  friends.sort((a, b) => b.leaguePoints - a.leaguePoints);

  // Add current user to the list
  const currentUser = {
    _id: user._id,
    name: user.name,
    profileUri: user.profileUri,
    level: user.level,
    xp: user.xp,
    feathers: user.feathers,
    streak: user.streak,
    league: user.league,
    leaguePoints: user.leaguePoints,
    isCurrentUser: true
  };

  const allUsers = [currentUser, ...friends];
  allUsers.sort((a, b) => b.leaguePoints - a.leaguePoints);

  // Find current user's rank
  const userRank = allUsers.findIndex(user => user.isCurrentUser) + 1;

  res.json({
    success: true,
    data: {
      friends: friends.slice(0, 10), // Top 10 friends
      allUsers: allUsers.slice(0, 20), // Top 20 including current user
      userRank,
      totalFriends: friends.length
    }
  });
}));

// @route   GET /api/leagues/history
// @desc    Get user's league history
// @access  Private
router.get('/history', authMiddleware, asyncHandler(async (req, res) => {
  const { limit = 20, page = 1 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  // This would typically come from a separate LeagueHistory model
  // For now, we'll return a placeholder structure
  const history = [];

  res.json({
    success: true,
    data: {
      history,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: 0,
        pages: 0
      }
    }
  });
}));

// @route   GET /api/leagues/rewards
// @desc    Get league rewards information
// @access  Private
router.get('/rewards', authMiddleware, asyncHandler(async (req, res) => {
  const rewards = {
    Bronze: {
      name: 'Bronze League',
      minPoints: 0,
      maxPoints: 999,
      rewards: {
        weekly: { feathers: 10, xp: 100 },
        promotion: { feathers: 50, xp: 500 }
      },
      description: 'Start your journey here!'
    },
    Silver: {
      name: 'Silver League',
      minPoints: 1000,
      maxPoints: 2499,
      rewards: {
        weekly: { feathers: 25, xp: 250 },
        promotion: { feathers: 100, xp: 1000 }
      },
      description: 'You\'re getting better!'
    },
    Gold: {
      name: 'Gold League',
      minPoints: 2500,
      maxPoints: 4999,
      rewards: {
        weekly: { feathers: 50, xp: 500 },
        promotion: { feathers: 200, xp: 2000 }
      },
      description: 'Excellent progress!'
    },
    Platinum: {
      name: 'Platinum League',
      minPoints: 5000,
      maxPoints: 9999,
      rewards: {
        weekly: { feathers: 100, xp: 1000 },
        promotion: { feathers: 500, xp: 5000 }
      },
      description: 'You\'re a serious learner!'
    },
    Diamond: {
      name: 'Diamond League',
      minPoints: 10000,
      maxPoints: 19999,
      rewards: {
        weekly: { feathers: 200, xp: 2000 },
        promotion: { feathers: 1000, xp: 10000 }
      },
      description: 'Elite level achieved!'
    },
    Master: {
      name: 'Master League',
      minPoints: 20000,
      maxPoints: null,
      rewards: {
        weekly: { feathers: 500, xp: 5000 },
        promotion: { feathers: 2500, xp: 25000 }
      },
      description: 'The ultimate achievement!'
    }
  };

  res.json({
    success: true,
    data: { rewards }
  });
}));

module.exports = router; 