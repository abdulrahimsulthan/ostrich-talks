import { Router, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { AuthRequest, IQuest } from '../types';
import Quest from '../models/Quest';
import Progress from '../models/Progress';

const router = Router();

// Validation middleware for creating/updating quests
const questValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 100 })
    .withMessage('Title must be less than 100 characters'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ max: 500 })
    .withMessage('Description must be less than 500 characters'),
  body('points')
    .isInt({ min: 0 })
    .withMessage('Points must be a non-negative number'),
  body('requirements.lessons')
    .isArray()
    .withMessage('Lessons must be an array')
    .custom((lessons: string[]) => {
      if (!lessons.length) {
        throw new Error('At least one lesson is required');
      }
      return true;
    }),
  body('requirements.minScore')
    .isInt({ min: 0, max: 100 })
    .withMessage('Minimum score must be between 0 and 100')
];

// Get all quests
router.get('/', async (_req: AuthRequest, res: Response) => {
  try {
    const quests = await Quest.find()
      .populate('requirements.lessons', 'title description difficulty')
      .sort({ createdAt: -1 });

    res.json({
      message: 'Quests retrieved successfully',
      quests: quests.map((quest: IQuest) => ({
        id: quest._id,
        title: quest.title,
        description: quest.description,
        points: quest.points,
        requirements: quest.requirements,
        createdAt: quest.createdAt,
        updatedAt: quest.updatedAt
      }))
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({
        error: 'Failed to retrieve quests',
        message: error.message
      });
    } else {
      res.status(500).json({
        error: 'Failed to retrieve quests',
        message: 'An unexpected error occurred'
      });
    }
  }
});

// Get a specific quest
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const quest = await Quest.findById(req.params.id)
      .populate('requirements.lessons', 'title description difficulty');

    if (!quest) {
      return res.status(404).json({
        error: 'Quest not found',
        message: 'The requested quest does not exist'
      });
    }

    // If user is authenticated, check their progress
    if (req.user) {
      const progress = await Progress.find({
        userId: req.user._id,
        lessonId: { $in: quest.requirements.lessons }
      });

      const isEligible = progress.every(p => p.score >= quest.requirements.minScore);
      const completedLessons = progress.filter(p => p.completed).length;
      const totalLessons = quest.requirements.lessons.length;

      res.json({
        message: 'Quest retrieved successfully',
        quest: {
          id: quest._id,
          title: quest.title,
          description: quest.description,
          points: quest.points,
          requirements: quest.requirements,
          progress: {
            isEligible,
            completedLessons,
            totalLessons,
            percentComplete: Math.round((completedLessons / totalLessons) * 100)
          },
          createdAt: quest.createdAt,
          updatedAt: quest.updatedAt
        }
      });
    } else {
      res.json({
        message: 'Quest retrieved successfully',
        quest: {
          id: quest._id,
          title: quest.title,
          description: quest.description,
          points: quest.points,
          requirements: quest.requirements,
          createdAt: quest.createdAt,
          updatedAt: quest.updatedAt
        }
      });
    }
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({
        error: 'Failed to retrieve quest',
        message: error.message
      });
    } else {
      res.status(500).json({
        error: 'Failed to retrieve quest',
        message: 'An unexpected error occurred'
      });
    }
  }
});

// Create a new quest (admin only)
router.post('/', questValidation, async (req: AuthRequest, res: Response) => {
  try {
    // Check if user is admin
    if (req.user?.role !== 'admin') {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Only administrators can create quests'
      });
    }

    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, points, requirements } = req.body;

    const quest = await Quest.create({
      title,
      description,
      points,
      requirements
    });

    res.status(201).json({
      message: 'Quest created successfully',
      quest: {
        id: quest._id,
        title: quest.title,
        description: quest.description,
        points: quest.points,
        requirements: quest.requirements,
        createdAt: quest.createdAt,
        updatedAt: quest.updatedAt
      }
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({
        error: 'Failed to create quest',
        message: error.message
      });
    } else {
      res.status(500).json({
        error: 'Failed to create quest',
        message: 'An unexpected error occurred'
      });
    }
  }
});

// Update a quest (admin only)
router.patch('/:id', questValidation, async (req: AuthRequest, res: Response) => {
  try {
    // Check if user is admin
    if (req.user?.role !== 'admin') {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Only administrators can update quests'
      });
    }

    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, points, requirements } = req.body;

    const quest = await Quest.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          title,
          description,
          points,
          requirements
        }
      },
      { new: true, runValidators: true }
    ).populate('requirements.lessons', 'title description difficulty');

    if (!quest) {
      return res.status(404).json({
        error: 'Quest not found',
        message: 'The quest you are trying to update does not exist'
      });
    }

    res.json({
      message: 'Quest updated successfully',
      quest: {
        id: quest._id,
        title: quest.title,
        description: quest.description,
        points: quest.points,
        requirements: quest.requirements,
        createdAt: quest.createdAt,
        updatedAt: quest.updatedAt
      }
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({
        error: 'Failed to update quest',
        message: error.message
      });
    } else {
      res.status(500).json({
        error: 'Failed to update quest',
        message: 'An unexpected error occurred'
      });
    }
  }
});

// Delete a quest (admin only)
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    // Check if user is admin
    if (req.user?.role !== 'admin') {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Only administrators can delete quests'
      });
    }

    const quest = await Quest.findByIdAndDelete(req.params.id);
    if (!quest) {
      return res.status(404).json({
        error: 'Quest not found',
        message: 'The quest you are trying to delete does not exist'
      });
    }

    res.json({
      message: 'Quest deleted successfully'
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({
        error: 'Failed to delete quest',
        message: error.message
      });
    } else {
      res.status(500).json({
        error: 'Failed to delete quest',
        message: 'An unexpected error occurred'
      });
    }
  }
});

export default router; 