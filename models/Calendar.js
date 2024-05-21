import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const itemSchema = new Schema({
  note: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const CalendarSchema = new Schema({
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  notes: [itemSchema],
});
