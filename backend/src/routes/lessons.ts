import { Router, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { AuthRequest, ILesson } from '../types';
import Lesson from '../models/Lesson';

const router = Router();

// Validation middleware for creating/updating lessons
const lessonValidation = [
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
  body('content')
    .trim()
    .notEmpty()
    .withMessage('Content is required'),
  body('difficulty')
    .isIn(['beginner', 'intermediate', 'advanced'])
    .withMessage('Difficulty must be beginner, intermediate, or advanced'),
  body('points')
    .isInt({ min: 0 })
    .withMessage('Points must be a positive number')
];

// Get all lessons
router.get('/', async (_req: AuthRequest, res: Response) => {
  try {
    const lessons = await Lesson.find().sort({ createdAt: -1 });
    
    res.json({
      message: 'Lessons retrieved successfully',
      lessons: lessons.map((lesson: ILesson) => ({
        id: lesson._id,
        title: lesson.title,
        description: lesson.description,
        difficulty: lesson.difficulty,
        points: lesson.points,
        createdAt: lesson.createdAt,
        updatedAt: lesson.updatedAt
      }))
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({
        error: 'Failed to retrieve lessons',
        message: error.message
      });
    } else {
      res.status(500).json({
        error: 'Failed to retrieve lessons',
        message: 'An unexpected error occurred'
      });
    }
  }
});

// Get a specific lesson
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const lesson = await Lesson.findById(req.params.id);
    if (!lesson) {
      return res.status(404).json({
        error: 'Lesson not found',
        message: 'The requested lesson does not exist'
      });
    }

    res.json({
      message: 'Lesson retrieved successfully',
      lesson: {
        id: lesson._id,
        title: lesson.title,
        description: lesson.description,
        content: lesson.content,
        difficulty: lesson.difficulty,
        points: lesson.points,
        createdAt: lesson.createdAt,
        updatedAt: lesson.updatedAt
      }
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({
        error: 'Failed to retrieve lesson',
        message: error.message
      });
    } else {
      res.status(500).json({
        error: 'Failed to retrieve lesson',
        message: 'An unexpected error occurred'
      });
    }
  }
});

// Create a new lesson (admin only)
router.post('/', lessonValidation, async (req: AuthRequest, res: Response) => {
  try {
    // Check if user is admin
    if (req.user?.role !== 'admin') {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Only administrators can create lessons'
      });
    }

    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, content, difficulty, points } = req.body;

    const lesson = await Lesson.create({
      title,
      description,
      content,
      difficulty,
      points
    });

    res.status(201).json({
      message: 'Lesson created successfully',
      lesson: {
        id: lesson._id,
        title: lesson.title,
        description: lesson.description,
        difficulty: lesson.difficulty,
        points: lesson.points,
        createdAt: lesson.createdAt,
        updatedAt: lesson.updatedAt
      }
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({
        error: 'Failed to create lesson',
        message: error.message
      });
    } else {
      res.status(500).json({
        error: 'Failed to create lesson',
        message: 'An unexpected error occurred'
      });
    }
  }
});

// Update a lesson (admin only)
router.patch('/:id', lessonValidation, async (req: AuthRequest, res: Response) => {
  try {
    // Check if user is admin
    if (req.user?.role !== 'admin') {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Only administrators can update lessons'
      });
    }

    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, content, difficulty, points } = req.body;
    const updateData = {
      ...(title && { title }),
      ...(description && { description }),
      ...(content && { content }),
      ...(difficulty && { difficulty }),
      ...(points !== undefined && { points })
    };

    const lesson = await Lesson.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!lesson) {
      return res.status(404).json({
        error: 'Lesson not found',
        message: 'The lesson you are trying to update does not exist'
      });
    }

    res.json({
      message: 'Lesson updated successfully',
      lesson: {
        id: lesson._id,
        title: lesson.title,
        description: lesson.description,
        difficulty: lesson.difficulty,
        points: lesson.points,
        createdAt: lesson.createdAt,
        updatedAt: lesson.updatedAt
      }
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({
        error: 'Failed to update lesson',
        message: error.message
      });
    } else {
      res.status(500).json({
        error: 'Failed to update lesson',
        message: 'An unexpected error occurred'
      });
    }
  }
});

// Delete a lesson (admin only)
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    // Check if user is admin
    if (req.user?.role !== 'admin') {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Only administrators can delete lessons'
      });
    }

    const lesson = await Lesson.findByIdAndDelete(req.params.id);
    if (!lesson) {
      return res.status(404).json({
        error: 'Lesson not found',
        message: 'The lesson you are trying to delete does not exist'
      });
    }

    res.json({
      message: 'Lesson deleted successfully'
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({
        error: 'Failed to delete lesson',
        message: error.message
      });
    } else {
      res.status(500).json({
        error: 'Failed to delete lesson',
        message: 'An unexpected error occurred'
      });
    }
  }
});

export default router; 