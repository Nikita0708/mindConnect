import mongoose from 'mongoose';
import { handleSaveError, runValidatorsAtUpdate } from './hooks.js';
const { Schema, model } = mongoose;

const ReviewSchema = new Schema({
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    required: true,
  },
  content: String,
  doctorId: { type: Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
});

ReviewSchema.post('save', handleSaveError);

ReviewSchema.pre('findOneAndUpdate', runValidatorsAtUpdate);

ReviewSchema.post('findOneAndUpdate', handleSaveError);

const Review = model('Comment', ReviewSchema);

export default Review;
