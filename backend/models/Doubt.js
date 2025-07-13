import mongoose from 'mongoose';

const doubtSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  question: { type: String, required: true },
  answer: { type: String },
  askedAt: { type: Date, default: Date.now }
});

const Doubt = mongoose.model('Doubt', doubtSchema);
export default Doubt;
