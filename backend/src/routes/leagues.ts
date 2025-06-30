import { Router, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { AuthRequest, ILeague } from '../types';
import League from '../models/League';
import Progress from '../models/Progress';

const router = Router();

// Validation middleware for creating/updating leagues
const leagueValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ max: 50 })
    .withMessage('Name must be less than 50 characters'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ max: 200 })
    .withMessage('Description must be less than 200 characters'),
  body('level')
    .isInt({ min: 1 })
    .withMessage('Level must be a positive number'),
  body('minPoints')
    .isInt({ min: 0 })
    .withMessage('Minimum points must be a non-negative number'),
  body('maxPoints')
    .isInt({ min: 0 })
    .withMessage('Maximum points must be a non-negative number')
    .custom((value, { req }) => {
      if (value <= req.body.minPoints) {
        throw new Error('Maximum points must be greater than minimum points');
      }
      return true;
    })
];

// Get all leagues
router.get('/', async (_req: AuthRequest, res: Response) => {
  try {
    const leagues = await League.find().sort({ level: 1 });

    res.json({
      message: 'Leagues retrieved successfully',
      leagues: leagues.map((league: ILeague) => ({
        id: league._id,
        name: league.name,
        description: league.description,
        level: league.level,
        minPoints: league.minPoints,
        maxPoints: league.maxPoints
      }))
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({
        error: 'Failed to retrieve leagues',
        message: error.message
      });
    } else {
      res.status(500).json({
        error: 'Failed to retrieve leagues',
        message: 'An unexpected error occurred'
      });
    }
  }
});

// Get user's current league
router.get('/me', async (req: AuthRequest, res: Response) => {
  try {
    // Calculate total points from user's progress
    const progress = await Progress.find({ userId: req.user?._id });
    const totalPoints = progress.reduce((sum, p) => sum + p.score, 0);

    // Find the league that matches the user's points
    const league = await League.findOne({
      minPoints: { $lte: totalPoints },
      maxPoints: { $gt: totalPoints }
    });

    if (!league) {
      return res.status(404).json({
        error: 'League not found',
        message: 'No matching league found for your points'
      });
    }

    res.json({
      message: 'Current league retrieved successfully',
      league: {
        id: league._id,
        name: league.name,
        description: league.description,
        level: league.level,
        minPoints: league.minPoints,
        maxPoints: league.maxPoints,
        currentPoints: totalPoints
      }
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({
        error: 'Failed to retrieve current league',
        message: error.message
      });
    } else {
      res.status(500).json({
        error: 'Failed to retrieve current league',
        message: 'An unexpected error occurred'
      });
    }
  }
});

// Create a new league (admin only)
router.post('/', leagueValidation, async (req: AuthRequest, res: Response) => {
  try {
    // Check if user is admin
    if (req.user?.role !== 'admin') {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Only administrators can create leagues'
      });
    }

    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description, level, minPoints, maxPoints } = req.body;

    // Check if league with same level exists
    const existingLeague = await League.findOne({ level });
    if (existingLeague) {
      return res.status(400).json({
        error: 'League already exists',
        message: `A league with level ${level} already exists`
      });
    }

    const league = await League.create({
      name,
      description,
      level,
      minPoints,
      maxPoints
    });

    res.status(201).json({
      message: 'League created successfully',
      league: {
        id: league._id,
        name: league.name,
        description: league.description,
        level: league.level,
        minPoints: league.minPoints,
        maxPoints: league.maxPoints
      }
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({
        error: 'Failed to create league',
        message: error.message
      });
    } else {
      res.status(500).json({
        error: 'Failed to create league',
        message: 'An unexpected error occurred'
      });
    }
  }
});

// Update a league (admin only)
router.patch('/:id', leagueValidation, async (req: AuthRequest, res: Response) => {
  try {
    // Check if user is admin
    if (req.user?.role !== 'admin') {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Only administrators can update leagues'
      });
    }

    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description, level, minPoints, maxPoints } = req.body;

    // Check if another league with same level exists
    const existingLeague = await League.findOne({
      level,
      _id: { $ne: req.params.id }
    });
    if (existingLeague) {
      return res.status(400).json({
        error: 'League already exists',
        message: `Another league with level ${level} already exists`
      });
    }

    const league = await League.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          name,
          description,
          level,
          minPoints,
          maxPoints
        }
      },
      { new: true, runValidators: true }
    );

    if (!league) {
      return res.status(404).json({
        error: 'League not found',
        message: 'The league you are trying to update does not exist'
      });
    }

    res.json({
      message: 'League updated successfully',
      league: {
        id: league._id,
        name: league.name,
        description: league.description,
        level: league.level,
        minPoints: league.minPoints,
        maxPoints: league.maxPoints
      }
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({
        error: 'Failed to update league',
        message: error.message
      });
    } else {
      res.status(500).json({
        error: 'Failed to update league',
        message: 'An unexpected error occurred'
      });
    }
  }
});

// Delete a league (admin only)
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    // Check if user is admin
    if (req.user?.role !== 'admin') {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Only administrators can delete leagues'
      });
    }

    const league = await League.findByIdAndDelete(req.params.id);
    if (!league) {
      return res.status(404).json({
        error: 'League not found',
        message: 'The league you are trying to delete does not exist'
      });
    }

    res.json({
      message: 'League deleted successfully'
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({
        error: 'Failed to delete league',
        message: error.message
      });
    } else {
      res.status(500).json({
        error: 'Failed to delete league',
        message: 'An unexpected error occurred'
      });
    }
  }
});

export default router; 