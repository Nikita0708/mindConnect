import mongoose from 'mongoose';
import { handleSaveError, runValidatorsAtUpdate } from './hooks.js';
const { Schema, model } = mongoose;

const CommentSchema = new Schema({
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    required: true,
  },
  content: String,
  postId: { type: Schema.Types.ObjectId, ref: 'Post' },
  createdAt: { type: Date, default: Date.now },
});

CommentSchema.post('save', handleSaveError);

CommentSchema.pre('findOneAndUpdate', runValidatorsAtUpdate);

CommentSchema.post('findOneAndUpdate', handleSaveError);

const Comment = model('Comment', CommentSchema);

export default Comment;
