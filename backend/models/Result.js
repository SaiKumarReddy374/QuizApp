// models/Result.js

import mongoose from 'mongoose';

const resultSchema = new mongoose.Schema({
  quiz: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: true
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  score: {
    type: Number,
    required: true
  },
  correctAnswers: {
    type: Number,
    required: true
  },
  timeSpent: {
    type: String,
    required: true
  },
  completedAt: {
    type: Date,
    default: Date.now
  },
  answers: [
    {
      questionIndex: {
        type: Number,
        required: true
      },
      selectedOption: {
        type: Number,
        required: false // ✅ allow undefined (skipped)
      }
    }
  ]
});

// 1. Prevent duplicate submissions: unique per quiz + student
resultSchema.index({ quiz: 1, student: 1 }, { unique: true });

// 2. Fast fetching of all results for a student (student dashboard)
resultSchema.index({ student: 1, completedAt: -1 });

export default mongoose.model('Result', resultSchema);
