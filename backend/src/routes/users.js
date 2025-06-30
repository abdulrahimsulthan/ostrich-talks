const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Progress = require('../models/Progress');
const { asyncHandler, AppError } = require('../middleware/errorHandler');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/users/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', authMiddleware, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .populate('followers', 'name profileUri')
    .populate('following', 'name profileUri');

  res.json({
    success: true,
    data: { user }
  });
}));

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Bio cannot be more than 200 characters'),
  body('profileUri')
    .optional()
    .isURL()
    .withMessage('Profile URI must be a valid URL')
], authMiddleware, asyncHandler(async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError(errors.array()[0].msg, 400);
  }

  const { name, bio, profileUri } = req.body;
  const updateData = {};

  if (name) updateData.name = name;
  if (bio !== undefined) updateData.bio = bio;
  if (profileUri) updateData.profileUri = profileUri;

  const user = await User.findByIdAndUpdate(
    req.user._id,
    updateData,
    { new: true, runValidators: true }
  ).populate('followers', 'name profileUri')
   .populate('following', 'name profileUri');

  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: { user }
  });
}));

// @route   GET /api/users/stats
// @desc    Get user statistics
// @access  Private
router.get('/stats', authMiddleware, asyncHandler(async (req, res) => {
  const progressStats = await Progress.getUserStats(req.user._id);
  
  // Calculate additional stats
  const totalLessonsCompleted = progressStats.completedLessons;
  const averageScore = progressStats.totalScore || 0;
  const totalTimeSpent = progressStats.totalTimeSpent || 0;
  const totalXpEarned = progressStats.totalXpEarned || 0;
  const totalFeathersEarned = progressStats.totalFeathersEarned || 0;

  // Get user's current stats
  const user = await User.findById(req.user._id);
  
  const stats = {
    // Progress stats
    totalLessonsCompleted,
    averageScore: Math.round(averageScore),
    totalTimeSpent: Math.round(totalTimeSpent / 60), // Convert to minutes
    totalMistakes: progressStats.totalMistakes || 0,
    
    // User stats
    currentLevel: user.level,
    currentXp: user.xp,
    currentFeathers: user.feathers,
    currentWillPower: user.willPower,
    currentStreak: user.streak,
    currentStreakLevel: user.streakLevel,
    
    // Rewards
    totalXpEarned,
    totalFeathersEarned,
    
    // League stats
    currentLeague: user.league,
    leaguePoints: user.leaguePoints,
    
    // Social stats
    followersCount: user.followers.length,
    followingCount: user.following.length
  };

  res.json({
    success: true,
    data: { stats }
  });
}));

// @route   PUT /api/users/settings
// @desc    Update user settings
// @access  Private
router.put('/settings', [
  body('settings.notifications')
    .optional()
    .isBoolean()
    .withMessage('Notifications must be a boolean'),
  body('settings.soundEnabled')
    .optional()
    .isBoolean()
    .withMessage('Sound enabled must be a boolean'),
  body('settings.language')
    .optional()
    .isIn(['en', 'es', 'fr', 'de', 'pt'])
    .withMessage('Invalid language'),
  body('settings.theme')
    .optional()
    .isIn(['light', 'dark', 'auto'])
    .withMessage('Invalid theme')
], authMiddleware, asyncHandler(async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError(errors.array()[0].msg, 400);
  }

  const { settings } = req.body;
  
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { settings: { ...req.user.settings, ...settings } },
    { new: true, runValidators: true }
  );

  res.json({
    success: true,
    message: 'Settings updated successfully',
    data: { settings: user.settings }
  });
}));

// @route   POST /api/users/follow/:userId
// @desc    Follow a user
// @access  Private
router.post('/follow/:userId', authMiddleware, asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (userId === req.user._id.toString()) {
    throw new AppError('You cannot follow yourself', 400);
  }

  const userToFollow = await User.findById(userId);
  if (!userToFollow) {
    throw new AppError('User not found', 404);
  }

  const currentUser = await User.findById(req.user._id);

  // Check if already following
  if (currentUser.following.includes(userId)) {
    throw new AppError('You are already following this user', 400);
  }

  // Add to following
  currentUser.following.push(userId);
  await currentUser.save();

  // Add to user's followers
  userToFollow.followers.push(req.user._id);
  await userToFollow.save();

  res.json({
    success: true,
    message: 'User followed successfully'
  });
}));

// @route   DELETE /api/users/follow/:userId
// @desc    Unfollow a user
// @access  Private
router.delete('/follow/:userId', authMiddleware, asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const currentUser = await User.findById(req.user._id);
  const userToUnfollow = await User.findById(userId);

  if (!userToUnfollow) {
    throw new AppError('User not found', 404);
  }

  // Remove from following
  currentUser.following = currentUser.following.filter(
    id => id.toString() !== userId
  );
  await currentUser.save();

  // Remove from user's followers
  userToUnfollow.followers = userToUnfollow.followers.filter(
    id => id.toString() !== req.user._id.toString()
  );
  await userToUnfollow.save();

  res.json({
    success: true,
    message: 'User unfollowed successfully'
  });
}));

// @route   GET /api/users/search
// @desc    Search users
// @access  Private
router.get('/search', authMiddleware, asyncHandler(async (req, res) => {
  const { q, limit = 10, page = 1 } = req.query;

  if (!q) {
    throw new AppError('Search query is required', 400);
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const users = await User.find({
    $and: [
      { _id: { $ne: req.user._id } }, // Exclude current user
      {
        $or: [
          { name: { $regex: q, $options: 'i' } },
          { email: { $regex: q, $options: 'i' } }
        ]
      }
    ]
  })
  .select('name email profileUri bio followers following')
  .limit(parseInt(limit))
  .skip(skip)
  .populate('followers', 'name profileUri')
  .populate('following', 'name profileUri');

  const total = await User.countDocuments({
    $and: [
      { _id: { $ne: req.user._id } },
      {
        $or: [
          { name: { $regex: q, $options: 'i' } },
          { email: { $regex: q, $options: 'i' } }
        ]
      }
    ]
  });

  res.json({
    success: true,
    data: {
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    }
  });
}));

// @route   GET /api/users/:userId
// @desc    Get user by ID
// @access  Private
router.get('/:userId', authMiddleware, asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const user = await User.findById(userId)
    .select('name email profileUri bio followers following level xp feathers streak league')
    .populate('followers', 'name profileUri')
    .populate('following', 'name profileUri');

  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Check if current user is following this user
  const isFollowing = user.followers.some(
    follower => follower._id.toString() === req.user._id.toString()
  );

  res.json({
    success: true,
    data: {
      user: {
        ...user.toObject(),
        isFollowing
      }
    }
  });
}));

// @route   DELETE /api/users/account
// @desc    Delete user account
// @access  Private
router.delete('/account', authMiddleware, asyncHandler(async (req, res) => {
  // Delete user's progress
  await Progress.deleteMany({ user: req.user._id });

  // Delete user
  await User.findByIdAndDelete(req.user._id);

  res.json({
    success: true,
    message: 'Account deleted successfully'
  });
}));

// @route   PUT /api/users/fcm-token
// @desc    Update user's FCM token
// @access  Private
router.put('/fcm-token', [
  body('fcmToken')
    .notEmpty()
    .withMessage('FCM token is required')
], authMiddleware, asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError(errors.array()[0].msg, 400);
  }

  const { fcmToken } = req.body;
  
  await User.findByIdAndUpdate(
    req.user._id,
    { fcmToken },
    { new: true, runValidators: true }
  );

  res.json({
    success: true,
    message: 'FCM token updated successfully'
  });
}));

module.exports = router; 