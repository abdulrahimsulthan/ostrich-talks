const express = require('express');
const { body, validationResult } = require('express-validator');
const Lesson = require('../models/Lesson');
const Progress = require('../models/Progress');
const User = require('../models/User');
const { asyncHandler, AppError } = require('../middleware/errorHandler');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/lessons
// @desc    Get all lessons with filters
// @access  Private
router.get('/', authMiddleware, asyncHandler(async (req, res) => {
  const {
    type,
    category,
    difficulty,
    search,
    limit = 20,
    page = 1,
    sort = 'createdAt'
  } = req.query;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const filter = { isActive: true };

  // Apply filters
  if (type) filter.type = type;
  if (category) filter.category = category;
  if (difficulty) filter.difficulty = parseInt(difficulty);
  if (search) {
    filter.$text = { $search: search };
  }

  // Build sort object
  let sortObj = {};
  if (sort === 'difficulty') sortObj.difficulty = 1;
  else if (sort === 'duration') sortObj.estimatedDuration = 1;
  else if (sort === 'popularity') sortObj.popularity = -1;
  else sortObj.createdAt = -1;

  const lessons = await Lesson.find(filter)
    .populate('createdBy', 'name')
    .sort(sortObj)
    .limit(parseInt(limit))
    .skip(skip);

  const total = await Lesson.countDocuments(filter);

  res.json({
    success: true,
    data: {
      lessons,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    }
  });
}));

// @route   GET /api/lessons/recommended
// @desc    Get recommended lessons for user
// @access  Private
router.get('/recommended', authMiddleware, asyncHandler(async (req, res) => {
  const { limit = 10 } = req.query;
  const user = await User.findById(req.user._id);

  // Get user's completed lessons
  const completedProgress = await Progress.find({
    user: req.user._id,
    status: 'completed'
  }).populate('lesson');

  const completedLessonIds = completedProgress.map(p => p.lesson._id);

  // Get user's in-progress lessons
  const inProgressProgress = await Progress.find({
    user: req.user._id,
    status: 'in-progress'
  }).populate('lesson');

  const inProgressLessonIds = inProgressProgress.map(p => p.lesson._id);

  // Find lessons that match user's level and haven't been completed
  const recommendedLessons = await Lesson.find({
    _id: { $nin: [...completedLessonIds, ...inProgressLessonIds] },
    isActive: true,
    difficulty: { $lte: user.level + 1 }, // Recommend lessons at or slightly above user's level
    category: { $in: ['beginner', 'intermediate'] } // Start with easier categories
  })
  .populate('createdBy', 'name')
  .sort({ difficulty: 1, createdAt: -1 })
  .limit(parseInt(limit));

  res.json({
    success: true,
    data: { lessons: recommendedLessons }
  });
}));

// @route   GET /api/lessons/:lessonId
// @desc    Get lesson by ID
// @access  Private
router.get('/:lessonId', authMiddleware, asyncHandler(async (req, res) => {
  const { lessonId } = req.params;

  const lesson = await Lesson.findById(lessonId)
    .populate('createdBy', 'name')
    .populate('prerequisites', 'title description difficulty');

  if (!lesson) {
    throw new AppError('Lesson not found', 404);
  }

  if (!lesson.isActive) {
    throw new AppError('Lesson is not available', 404);
  }

  // Get user's progress for this lesson
  const progress = await Progress.findUserProgress(req.user._id, lessonId);

  res.json({
    success: true,
    data: {
      lesson,
      progress: progress || null
    }
  });
}));

// @route   POST /api/lessons/:lessonId/start
// @desc    Start a lesson
// @access  Private
router.post('/:lessonId/start', authMiddleware, asyncHandler(async (req, res) => {
  const { lessonId } = req.params;

  const lesson = await Lesson.findById(lessonId);
  if (!lesson || !lesson.isActive) {
    throw new AppError('Lesson not found', 404);
  }

  // Check if user has completed prerequisites
  if (lesson.prerequisites && lesson.prerequisites.length > 0) {
    const prerequisiteProgress = await Progress.find({
      user: req.user._id,
      lesson: { $in: lesson.prerequisites },
      status: 'completed'
    });

    if (prerequisiteProgress.length < lesson.prerequisites.length) {
      throw new AppError('You must complete the prerequisites first', 400);
    }
  }

  // Get or create progress
  let progress = await Progress.findUserProgress(req.user._id, lessonId);
  
  if (!progress) {
    progress = new Progress({
      user: req.user._id,
      lesson: lessonId,
      status: 'in-progress'
    });
  } else if (progress.status === 'completed') {
    throw new AppError('Lesson already completed', 400);
  } else {
    progress.status = 'in-progress';
    progress.attempts += 1;
  }

  await progress.save();

  res.json({
    success: true,
    message: 'Lesson started successfully',
    data: { progress }
  });
}));

// @route   POST /api/lessons/:lessonId/submit
// @desc    Submit lesson answers
// @access  Private
router.post('/:lessonId/submit', [
  body('answers')
    .isArray()
    .withMessage('Answers must be an array'),
  body('answers.*.exerciseIndex')
    .isInt({ min: 0 })
    .withMessage('Exercise index must be a non-negative integer'),
  body('answers.*.userAnswer')
    .notEmpty()
    .withMessage('User answer is required'),
  body('timeSpent')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Time spent must be a non-negative integer')
], authMiddleware, asyncHandler(async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError(errors.array()[0].msg, 400);
  }

  const { lessonId } = req.params;
  const { answers, timeSpent } = req.body;

  const lesson = await Lesson.findById(lessonId);
  if (!lesson || !lesson.isActive) {
    throw new AppError('Lesson not found', 404);
  }

  // Get or create progress
  let progress = await Progress.findUserProgress(req.user._id, lessonId);
  if (!progress) {
    progress = new Progress({
      user: req.user._id,
      lesson: lessonId,
      status: 'in-progress'
    });
  }

  // Process answers
  let totalScore = 0;
  let totalPoints = 0;
  let correctAnswers = 0;

  for (const answer of answers) {
    const exercise = lesson.exercises[answer.exerciseIndex];
    if (!exercise) {
      throw new AppError(`Invalid exercise index: ${answer.exerciseIndex}`, 400);
    }

    const isCorrect = answer.userAnswer.toLowerCase().trim() === 
                     exercise.correctAnswer.toLowerCase().trim();
    
    const points = isCorrect ? exercise.points : 0;
    
    // Add exercise result
    progress.addExerciseResult(
      answer.exerciseIndex,
      isCorrect,
      answer.userAnswer,
      exercise.correctAnswer,
      timeSpent || 0,
      exercise.points
    );

    totalScore += points;
    totalPoints += exercise.points;
    if (isCorrect) correctAnswers++;
  }

  // Calculate final score
  const finalScore = Math.round((correctAnswers / lesson.exercises.length) * 100);
  
  // Determine if lesson is completed (minimum 70% score)
  const isCompleted = finalScore >= 70;
  
  if (isCompleted) {
    progress.status = 'completed';
    progress.score = finalScore;
    
    // Calculate rewards
    const xpReward = Math.round(lesson.xpReward * (finalScore / 100));
    const featherReward = Math.round(lesson.featherReward * (finalScore / 100));
    
    progress.xpEarned = xpReward;
    progress.feathersEarned = featherReward;

    // Update user stats
    const user = await User.findById(req.user._id);
    user.xp += xpReward;
    user.feathers += featherReward;
    
    // Update streak
    const today = new Date();
    const lastLessonDate = user.lastLessonDate ? new Date(user.lastLessonDate) : null;
    
    if (!lastLessonDate || 
        today.getDate() !== lastLessonDate.getDate() || 
        today.getMonth() !== lastLessonDate.getMonth() || 
        today.getFullYear() !== lastLessonDate.getFullYear()) {
      
      // Check if it's consecutive day
      if (lastLessonDate && 
          (today - lastLessonDate) / (1000 * 60 * 60 * 24) === 1) {
        user.streak += 1;
      } else if (!lastLessonDate || 
                 (today - lastLessonDate) / (1000 * 60 * 60 * 24) > 1) {
        user.streak = 1;
      }
      
      user.lastLessonDate = today;
    }
    
    // Update level based on XP
    const newLevel = Math.floor(user.xp / 1000) + 1;
    if (newLevel > user.level) {
      user.level = newLevel;
    }
    
    await user.save();
  } else {
    progress.status = 'failed';
    progress.score = finalScore;
  }

  await progress.save();

  res.json({
    success: true,
    message: isCompleted ? 'Lesson completed successfully!' : 'Lesson failed. Try again!',
    data: {
      score: finalScore,
      correctAnswers,
      totalExercises: lesson.exercises.length,
      isCompleted,
      rewards: isCompleted ? {
        xp: progress.xpEarned,
        feathers: progress.feathersEarned
      } : null,
      progress
    }
  });
}));

// @route   GET /api/lessons/:lessonId/progress
// @desc    Get lesson progress
// @access  Private
router.get('/:lessonId/progress', authMiddleware, asyncHandler(async (req, res) => {
  const { lessonId } = req.params;

  const progress = await Progress.findUserProgress(req.user._id, lessonId);
  
  if (!progress) {
    return res.json({
      success: true,
      data: { progress: null }
    });
  }

  res.json({
    success: true,
    data: { progress }
  });
}));

// @route   DELETE /api/lessons/:lessonId/progress
// @desc    Reset lesson progress
// @access  Private
router.delete('/:lessonId/progress', authMiddleware, asyncHandler(async (req, res) => {
  const { lessonId } = req.params;

  const progress = await Progress.findUserProgress(req.user._id, lessonId);
  
  if (!progress) {
    throw new AppError('No progress found for this lesson', 404);
  }

  await Progress.findByIdAndDelete(progress._id);

  res.json({
    success: true,
    message: 'Lesson progress reset successfully'
  });
}));

module.exports = router; 