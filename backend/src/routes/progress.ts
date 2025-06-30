import { Router, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { AuthRequest } from '../types';
import Progress from '../models/Progress';
import Lesson from '../models/Lesson';

const router = Router();

// Validation middleware for updating progress
const progressValidation = [
  body('lessonId')
    .notEmpty()
    .withMessage('Lesson ID is required')
    .isMongoId()
    .withMessage('Invalid lesson ID'),
  body('completed')
    .optional()
    .isBoolean()
    .withMessage('Completed must be a boolean'),
  body('score')
    .isInt({ min: 0, max: 100 })
    .withMessage('Score must be between 0 and 100')
];

// Get user's progress for all lessons
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const progress = await Progress.find({ userId: req.user?._id })
      .populate('lessonId')
      .sort({ updatedAt: -1 });

    res.json({
      message: 'Progress retrieved successfully',
      progress: progress.map(p => ({
        id: p._id,
        lessonId: p.lessonId,
        completed: p.completed,
        score: p.score,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt
      }))
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({
        error: 'Failed to retrieve progress',
        message: error.message
      });
    } else {
      res.status(500).json({
        error: 'Failed to retrieve progress',
        message: 'An unexpected error occurred'
      });
    }
  }
});

// Get user's progress for a specific lesson
router.get('/:lessonId', async (req: AuthRequest, res: Response) => {
  try {
    const progress = await Progress.findOne({
      userId: req.user?._id,
      lessonId: req.params.lessonId
    }).populate('lessonId');

    if (!progress) {
      return res.status(404).json({
        error: 'Progress not found',
        message: 'No progress found for this lesson'
      });
    }

    res.json({
      message: 'Progress retrieved successfully',
      progress: {
        id: progress._id,
        lessonId: progress.lessonId,
        completed: progress.completed,
        score: progress.score,
        createdAt: progress.createdAt,
        updatedAt: progress.updatedAt
      }
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({
        error: 'Failed to retrieve progress',
        message: error.message
      });
    } else {
      res.status(500).json({
        error: 'Failed to retrieve progress',
        message: 'An unexpected error occurred'
      });
    }
  }
});

// Update or create progress for a lesson
router.post('/', progressValidation, async (req: AuthRequest, res: Response) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { lessonId, completed, score } = req.body;

    // Check if lesson exists
    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      return res.status(404).json({
        error: 'Lesson not found',
        message: 'The lesson does not exist'
      });
    }

    // Update or create progress
    const progress = await Progress.findOneAndUpdate(
      {
        userId: req.user?._id,
        lessonId
      },
      {
        $set: {
          completed,
          score
        }
      },
      {
        new: true,
        upsert: true,
        runValidators: true
      }
    );

    res.json({
      message: 'Progress updated successfully',
      progress: {
        id: progress._id,
        lessonId: progress.lessonId,
        completed: progress.completed,
        score: progress.score,
        createdAt: progress.createdAt,
        updatedAt: progress.updatedAt
      }
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({
        error: 'Failed to update progress',
        message: error.message
      });
    } else {
      res.status(500).json({
        error: 'Failed to update progress',
        message: 'An unexpected error occurred'
      });
    }
  }
});

// Delete progress for a lesson
router.delete('/:lessonId', async (req: AuthRequest, res: Response) => {
  try {
    const progress = await Progress.findOneAndDelete({
      userId: req.user?._id,
      lessonId: req.params.lessonId
    });

    if (!progress) {
      return res.status(404).json({
        error: 'Progress not found',
        message: 'No progress found for this lesson'
      });
    }

    res.json({
      message: 'Progress deleted successfully'
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({
        error: 'Failed to delete progress',
        message: error.message
      });
    } else {
      res.status(500).json({
        error: 'Failed to delete progress',
        message: 'An unexpected error occurred'
      });
    }
  }
});

export default router; 