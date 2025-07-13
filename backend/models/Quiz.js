import mongoose from 'mongoose';

const quizSchema = new mongoose.Schema({
  title: { type: String, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // teacher
  batch: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch', required: true },
  source: { type: String, enum: ['ai', 'manual'], required: true },
  deadline: { type: Date },
  duration: { type: Number, required: true, default: 30 }, // ✅ duration in minutes
  avgScore: { type: Number, default: 0 },
  questions: [
    {
      question: { type: String, required: true },
      options: [{ type: String, required: true }],
      correctAnswer: { type: Number, required: true }
    }
  ]
}, { timestamps: true });

const Quiz = mongoose.model('Quiz', quizSchema);
export default Quiz;
