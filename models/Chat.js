import mongoose from 'mongoose';
const { Schema, model } = mongoose;
import { handleSaveError, runValidatorsAtUpdate } from './hooks.js';

const chatSchema = new Schema({
  id: String,
  userId: String,
  createdAt: Date,
  title: String,
  path: String,
  messages: [{ role: String, content: String }],
  sharePath: String,
});

chatSchema.post('save', handleSaveError);

chatSchema.pre('findOneAndUpdate', runValidatorsAtUpdate);

chatSchema.post('findOneAndUpdate', handleSaveError);

const Chat = mongoose.model('Chat', chatSchema);

export default Chat;
