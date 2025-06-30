import mongoose, { Schema } from 'mongoose';
import { IQuest } from '../types';

const questSchema = new Schema<IQuest>({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [100, 'Title must be less than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [500, 'Description must be less than 500 characters']
  },
  points: {
    type: Number,
    required: [true, 'Points are required'],
    min: [0, 'Points cannot be negative']
  },
  requirements: {
    lessons: [{
      type: Schema.Types.ObjectId,
      ref: 'Lesson',
      required: [true, 'At least one lesson is required']
    }],
    minScore: {
      type: Number,
      required: [true, 'Minimum score is required'],
      min: [0, 'Minimum score cannot be negative'],
      max: [100, 'Minimum score cannot be more than 100']
    }
  }
}, {
  timestamps: true
});

// Ensure quest has at least one lesson
questSchema.pre('save', function(next) {
  if (!this.requirements.lessons.length) {
    next(new Error('At least one lesson is required'));
  } else {
    next();
  }
});

const Quest = mongoose.model<IQuest>('Quest', questSchema);

export default Quest; 