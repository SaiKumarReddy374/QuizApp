import mongoose from 'mongoose';

const batchSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // teacher
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });


batchSchema.index({ students: 1 });

const Batch = mongoose.model('Batch', batchSchema);
export default Batch;
