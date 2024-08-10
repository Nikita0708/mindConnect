import mongoose from 'mongoose';

const { Schema, model } = mongoose;

import { handleSaveError, runValidatorsAtUpdate } from './hooks.js';

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
  },
  password: {
    type: String,
    minlength: 6,
  },
  phoneNumber: {
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
  gender: String,
  isDoctor: {
    type: Boolean,
    default: false,
  },
  certificate: {
    type: Boolean,
    match: true,
  },
  description: {
    type: String,
    min: 10,
    max: 200,
  },
  priceOneHour: {
    price: Number,
    currency: String,
  },
  typeOfConsultation: {
    type: [String],
    enum: ['online\\', 'offline\\'],
  },
  fieldsOfProblems: {
    type: [String],
    enum: [
      'Post-Traumatic Stress Disorder (PTSD)\\',
      'Generalized Anxiety Disorder (GAD)\\',
      'Stress\\',
      'Burnout\\',
      'ADHD\\',
      'Panic Disorder\\',
      'Depression\\',
      'Social Anxiety Disorder\\',
      'Specific Phobias\\',
      'Major Depressive Disorder\\',
      'Bipolar Disorder\\',
      'Schizoaffective Disorder\\',
      'Alcohol Use Disorder\\',
      'Gambling Disorder\\',
      'Substance Use Disorders\\',
      'Gender Dysphoria\\',
      'Dependent Personality Disorder\\',
    ],
  },
  aboutMe: String,
  reviews: [{ type: Schema.Types.ObjectId, ref: 'Review' }],
  languages: {
    type: [String],
  },
  country: String,
  city: String,
  yearsOfExperience: {
    type: Number,
    min: 1,
    max: 70,
  },
  patientDoctor: {
    type: Schema.Types.ObjectId,
    ref: 'user',
  },
  doctorPatients: [
    {
      type: Schema.Types.ObjectId,
      ref: 'user',
    },
  ],
  token: String,
  refreshToken: String,
  resetPasswordtoken: String,
  subscribers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  subscribedTo: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  resetPasswordRequestedAt: { type: Date },
  image: String,
});

UserSchema.post('save', handleSaveError);

UserSchema.pre('findOneAndUpdate', runValidatorsAtUpdate);

UserSchema.post('findOneAndUpdate', handleSaveError);

const User = model('user', UserSchema);

export default User;
