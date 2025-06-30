import mongoose, { Schema } from 'mongoose';
import { IProgress } from '../types';

const progressSchema = new Schema<IProgress>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  lessonId: {
    type: Schema.Types.ObjectId,
    ref: 'Lesson',
    required: [true, 'Lesson ID is required']
  },
  completed: {
    type: Boolean,
    default: false
  },
  score: {
    type: Number,
    required: [true, 'Score is required'],
    min: [0, 'Score cannot be negative'],
    max: [100, 'Score cannot be more than 100']
  }
}, {
  timestamps: true
});

// Ensure a user can only have one progress record per lesson
progressSchema.index({ userId: 1, lessonId: 1 }, { unique: true });

const Progress = mongoose.model<IProgress>('Progress', progressSchema);

export default Progress; 