import mongoose from 'mongoose';

const { Schema } = mongoose;

const taskSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: String,
  isCompleted: { type: Boolean, default: false },
  ratings: [{ type: Number, min: 1, max: 5 }],
}, { timestamps: true });

export default mongoose.model('Task', taskSchema);
    