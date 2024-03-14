import mongoose from 'mongoose';

const { Schema, model } = mongoose;

import { handleSaveError, runValidatorsAtUpdate } from './hooks.js';

const emailRegexp = /^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/;
const numberRegexp = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;

const UserSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Enter you name'],
      max: 20,
    },
    lastName: {
      type: String,
      max: 20,
    },
    email: {
      type: String,
      match: emailRegexp,
      unique: true,
      required: [true, 'Email is required'],
    },
    password: {
      type: String,
      minlength: 6,
      required: true,
    },
    number: {
      type: String,
      match: numberRegexp,
    },
    age: {
      type: Number,
      min: 10,
      max: 120,
    },
    token: String,
    avatarUrl: String,
  },
  { versionKey: false, timestamps: true }
);

UserSchema.post('save', handleSaveError);

UserSchema.pre('findOneAndUpdate', runValidatorsAtUpdate);

UserSchema.post('findOneAndUpdate', handleSaveError);

const User = model('user', UserSchema);

export default User;
