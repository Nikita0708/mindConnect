import mongoose from 'mongoose';
import { handleSaveError, runValidatorsAtUpdate } from './hooks.js';
const { Schema, model } = mongoose;

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
  likes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  comments: [{ type: Schema.Types.ObjectId, ref: 'Comment' }],
  createdAt: { type: Date, default: Date.now },
});

PostSchema.post('save', handleSaveError);

PostSchema.pre('findOneAndUpdate', runValidatorsAtUpdate);

PostSchema.post('findOneAndUpdate', handleSaveError);

const Post = model('Post', PostSchema);

export default Post;
