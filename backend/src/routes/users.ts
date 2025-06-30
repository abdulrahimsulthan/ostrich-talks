import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { AuthRequest } from '../types';
import User from '../models/User';
import { Response } from 'express';

const router = Router();

// Update user validation
const updateUserValidation = [
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Name cannot be empty'),
  body('avatar')
    .optional()
    .isURL()
    .withMessage('Avatar must be a valid URL')
];

// Get current user profile
router.get('/me', async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user?._id);
    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: 'Unable to find user profile'
      });
    }

    res.json({
      message: 'Profile retrieved successfully',
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        role: user.role
      }
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({
        error: 'Profile retrieval failed',
        message: error.message
      });
    } else {
      res.status(500).json({
        error: 'Profile retrieval failed',
        message: 'An unexpected error occurred'
      });
    }
  }
});

// Update current user profile
router.patch('/me', updateUserValidation, async (req: AuthRequest, res: Response) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, avatar } = req.body;
    const updateData: { name?: string; avatar?: string } = {};

    if (name) updateData.name = name;
    if (avatar) updateData.avatar = avatar;

    const user = await User.findByIdAndUpdate(
      req.user?._id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: 'Unable to update user profile'
      });
    }

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        role: user.role
      }
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({
        error: 'Profile update failed',
        message: error.message
      });
    } else {
      res.status(500).json({
        error: 'Profile update failed',
        message: 'An unexpected error occurred'
      });
    }
  }
});

// Delete current user
router.delete('/me', async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findByIdAndDelete(req.user?._id);
    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: 'Unable to delete user profile'
      });
    }

    res.json({
      message: 'Profile deleted successfully'
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({
        error: 'Profile deletion failed',
        message: error.message
      });
    } else {
      res.status(500).json({
        error: 'Profile deletion failed',
        message: 'An unexpected error occurred'
      });
    }
  }
});

export default router; 