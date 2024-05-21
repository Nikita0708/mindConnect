import mongoose from 'mongoose';

const { Schema, model } = mongoose;

import { handleSaveError, runValidatorsAtUpdate } from './hooks.js';

const emailRegexp = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const numberRegexp = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;

const UserSchema = new Schema({
  firstName: {
    type: String,
    max: 20,
  },
  lastName: {
    type: String,
    max: 20,
  },
  email: {
    type: String,
    match: emailRegexp,
  },
  password: {
    type: String,
    minlength: 6,
  },
  number: {
    type: String,
    match: numberRegexp,
  },
  sub: Number,
  age: {
    type: Number,
    min: 10,
    max: 120,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  doctor: Number,
  token: String,
  refreshToken: String,
  resetPasswordtoken: String,
  resetPasswordRequestedAt: { type: Date },
  image: String,
});

UserSchema.post('save', handleSaveError);

UserSchema.pre('findOneAndUpdate', runValidatorsAtUpdate);

UserSchema.post('findOneAndUpdate', handleSaveError);

const User = model('user', UserSchema);

export default User;
