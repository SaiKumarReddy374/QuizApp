import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ['student', 'teacher'], default: 'student' },
  batches: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Batch' }] 
});

const User = mongoose.model('User', userSchema);
export default User;
