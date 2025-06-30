import mongoose, { Schema, Model } from 'mongoose';
import { ILeague } from '../types';

const leagueSchema = new Schema<ILeague>({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name must be less than 50 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [200, 'Description must be less than 200 characters']
  },
  level: {
    type: Number,
    required: [true, 'Level is required'],
    min: [1, 'Level must be at least 1'],
    unique: true
  },
  minPoints: {
    type: Number,
    required: [true, 'Minimum points are required'],
    min: [0, 'Minimum points cannot be negative']
  },
  maxPoints: {
    type: Number,
    required: [true, 'Maximum points are required'],
    min: [0, 'Maximum points cannot be negative'],
    validate: {
      validator: function(this: ILeague, value: number) {
        return value > this.minPoints;
      },
      message: 'Maximum points must be greater than minimum points'
    }
  }
}, {
  timestamps: true
});

// Ensure leagues don't have overlapping point ranges
leagueSchema.pre('save', async function(next) {
  const League = this.constructor as Model<ILeague>;
  const overlappingLeague = await League.findOne({
    _id: { $ne: this._id },
    $or: [
      {
        minPoints: { $lte: this.maxPoints },
        maxPoints: { $gt: this.minPoints }
      },
      {
        minPoints: { $lt: this.maxPoints },
        maxPoints: { $gte: this.minPoints }
      }
    ]
  });

  if (overlappingLeague) {
    next(new Error('League point ranges cannot overlap with existing leagues'));
  } else {
    next();
  }
});

const League = mongoose.model<ILeague>('League', leagueSchema);

export default League; 