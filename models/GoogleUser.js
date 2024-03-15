import mongoose from 'mongoose';

const { Schema, model } = mongoose;

import { handleSaveError, runValidatorsAtUpdate } from './hooks.js';

const GoogleUserSchema = new Schema({
  googleId: {
    type: String,
    required: true,
  },
  displayName: {
    type: String,
    required: true,
  },
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  image: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

GoogleUserSchema.post('save', handleSaveError);

GoogleUserSchema.pre('findOneAndUpdate', runValidatorsAtUpdate);

GoogleUserSchema.post('findOneAndUpdate', handleSaveError);

const GoogleUser = model('GoogleUser', GoogleUserSchema);

export default GoogleUser;
