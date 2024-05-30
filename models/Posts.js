import mongoose from 'mongoose';
import { handleSaveError, runValidatorsAtUpdate } from './hooks.js';
const { Schema, model } = mongoose;

const CommentSchema = new Schema({
  content: String,
  postId: { type: Schema.Types.ObjectId, ref: 'Post' },
  createdAt: { type: Date, default: Date.now },
});

const PostSchema = new Schema({
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    required: true,
  },
  title: {
    type: String,
    requried: true,
  },
  description: {
    type: String,
  },
  image: String,
  likes: {
    type: Number,
    default: 0,
  },
  comments: [{ type: Schema.Types.ObjectId, ref: 'Comment' }],
  createdAt: { type: Date, default: Date.now },
});

PostSchema.post('save', handleSaveError);

PostSchema.pre('findOneAndUpdate', runValidatorsAtUpdate);

PostSchema.post('findOneAndUpdate', handleSaveError);

const Post = model('posts', PostSchema);

export default Post;
