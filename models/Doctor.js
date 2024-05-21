import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const DoctorSchema = new Schema({
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
  qualifications: String,
  token: String,
  refreshToken: String,
  resetPasswordtoken: String,
  resetPasswordRequestedAt: { type: Date },
  image: String,
});
