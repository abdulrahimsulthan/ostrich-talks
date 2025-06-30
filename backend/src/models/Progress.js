const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
  // User reference
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Lesson reference
  lesson: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lesson',
    required: true
  },
  
  // Progress status
  status: {
    type: String,
    enum: ['not-started', 'in-progress', 'completed', 'failed'],
    default: 'not-started'
  },
  
  // Completion details
  startedAt: {
    type: Date
  },
  completedAt: {
    type: Date
  },
  
  // Performance metrics
  score: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  mistakes: {
    type: Number,
    default: 0,
    min: 0
  },
  timeSpent: {
    type: Number, // in seconds
    default: 0,
    min: 0
  },
  
  // Exercise results
  exerciseResults: [{
    exerciseIndex: {
      type: Number,
      required: true
    },
    isCorrect: {
      type: Boolean,
      required: true
    },
    userAnswer: String,
    correctAnswer: String,
    timeSpent: Number, // in seconds
    points: {
      type: Number,
      default: 0
    }
  }],
  
  // Rewards earned
  xpEarned: {
    type: Number,
    default: 0,
    min: 0
  },
  feathersEarned: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // Streak impact
  streakMaintained: {
    type: Boolean,
    default: false
  },
  
  // Attempts
  attempts: {
    type: Number,
    default: 1,
    min: 1
  },
  
  // Notes and feedback
  notes: String,
  feedback: String
}, {
  timestamps: true
});

// Compound index for user-lesson uniqueness
progressSchema.index({ user: 1, lesson: 1 }, { unique: true });

// Index for querying user progress
progressSchema.index({ user: 1, status: 1 });
progressSchema.index({ user: 1, completedAt: -1 });

// Virtual for completion percentage
progressSchema.virtual('completionPercentage').get(function() {
  if (this.status === 'completed') return 100;
  if (this.status === 'not-started') return 0;
  
  const totalExercises = this.exerciseResults.length;
  if (totalExercises === 0) return 0;
  
  const completedExercises = this.exerciseResults.filter(result => result.isCorrect !== undefined).length;
  return Math.round((completedExercises / totalExercises) * 100);
});

// Virtual for accuracy percentage
progressSchema.virtual('accuracyPercentage').get(function() {
  const totalExercises = this.exerciseResults.length;
  if (totalExercises === 0) return 0;
  
  const correctExercises = this.exerciseResults.filter(result => result.isCorrect).length;
  return Math.round((correctExercises / totalExercises) * 100);
});

// Pre-save middleware to update timestamps
progressSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    if (this.status === 'in-progress' && !this.startedAt) {
      this.startedAt = new Date();
    } else if (this.status === 'completed' && !this.completedAt) {
      this.completedAt = new Date();
    }
  }
  next();
});

// Instance method to calculate score
progressSchema.methods.calculateScore = function() {
  const totalExercises = this.exerciseResults.length;
  if (totalExercises === 0) return 0;
  
  const correctExercises = this.exerciseResults.filter(result => result.isCorrect).length;
  this.score = Math.round((correctExercises / totalExercises) * 100);
  return this.score;
};

// Instance method to add exercise result
progressSchema.methods.addExerciseResult = function(exerciseIndex, isCorrect, userAnswer, correctAnswer, timeSpent, points) {
  this.exerciseResults.push({
    exerciseIndex,
    isCorrect,
    userAnswer,
    correctAnswer,
    timeSpent,
    points: isCorrect ? points : 0
  });
  
  if (!isCorrect) {
    this.mistakes += 1;
  }
  
  this.timeSpent += timeSpent || 0;
  this.calculateScore();
};

// Static method to find user progress
progressSchema.statics.findUserProgress = function(userId, lessonId) {
  return this.findOne({ user: userId, lesson: lessonId });
};

// Static method to find completed lessons for user
progressSchema.statics.findCompletedLessons = function(userId) {
  return this.find({ user: userId, status: 'completed' }).populate('lesson');
};

// Static method to get user statistics
progressSchema.statics.getUserStats = async function(userId) {
  const stats = await this.aggregate([
    { $match: { user: mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: null,
        totalLessons: { $sum: 1 },
        completedLessons: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
        totalScore: { $avg: '$score' },
        totalMistakes: { $sum: '$mistakes' },
        totalTimeSpent: { $sum: '$timeSpent' },
        totalXpEarned: { $sum: '$xpEarned' },
        totalFeathersEarned: { $sum: '$feathersEarned' }
      }
    }
  ]);
  
  return stats[0] || {
    totalLessons: 0,
    completedLessons: 0,
    totalScore: 0,
    totalMistakes: 0,
    totalTimeSpent: 0,
    totalXpEarned: 0,
    totalFeathersEarned: 0
  };
};

module.exports = mongoose.model('Progress', progressSchema); 