const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
  // Basic lesson information
  title: {
    type: String,
    required: [true, 'Lesson title is required'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Lesson description is required'],
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  
  // Lesson content
  content: {
    type: String,
    required: [true, 'Lesson content is required']
  },
  
  // Lesson type and category
  type: {
    type: String,
    enum: ['vocabulary', 'grammar', 'pronunciation', 'conversation', 'reading', 'listening'],
    required: [true, 'Lesson type is required']
  },
  category: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    required: [true, 'Lesson category is required']
  },
  
  // Difficulty and duration
  difficulty: {
    type: Number,
    min: 1,
    max: 5,
    required: [true, 'Difficulty level is required']
  },
  estimatedDuration: {
    type: Number, // in minutes
    required: [true, 'Estimated duration is required'],
    min: 1
  },
  
  // Lesson structure
  exercises: [{
    type: {
      type: String,
      enum: ['multiple-choice', 'fill-blank', 'matching', 'speaking', 'listening', 'writing'],
      required: true
    },
    question: {
      type: String,
      required: true
    },
    options: [String], // For multiple choice questions
    correctAnswer: {
      type: String,
      required: true
    },
    explanation: String,
    points: {
      type: Number,
      default: 10,
      min: 1
    }
  }],
  
  // Audio and media
  audioUrl: String,
  imageUrl: String,
  videoUrl: String,
  
  // Prerequisites and dependencies
  prerequisites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lesson'
  }],
  
  // Rewards and XP
  xpReward: {
    type: Number,
    default: 50,
    min: 0
  },
  featherReward: {
    type: Number,
    default: 5,
    min: 0
  },
  
  // Lesson status
  isActive: {
    type: Boolean,
    default: true
  },
  isPremium: {
    type: Boolean,
    default: false
  },
  
  // Tags for search and filtering
  tags: [String],
  
  // Metadata
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  language: {
    type: String,
    default: 'en',
    enum: ['en', 'es', 'fr', 'de', 'pt']
  }
}, {
  timestamps: true
});

// Index for better query performance
lessonSchema.index({ type: 1, category: 1, difficulty: 1 });
lessonSchema.index({ tags: 1 });
lessonSchema.index({ isActive: 1, isPremium: 1 });
lessonSchema.index({ title: 'text', description: 'text' });

// Virtual for exercise count
lessonSchema.virtual('exerciseCount').get(function() {
  return this.exercises.length;
});

// Virtual for total points
lessonSchema.virtual('totalPoints').get(function() {
  return this.exercises.reduce((total, exercise) => total + exercise.points, 0);
});

// Static method to find lessons by difficulty
lessonSchema.statics.findByDifficulty = function(difficulty) {
  return this.find({ difficulty, isActive: true });
};

// Static method to find lessons by type
lessonSchema.statics.findByType = function(type) {
  return this.find({ type, isActive: true });
};

// Static method to find lessons by category
lessonSchema.statics.findByCategory = function(category) {
  return this.find({ category, isActive: true });
};

module.exports = mongoose.model('Lesson', lessonSchema); 