import mongoose from 'mongoose';
import { handleSaveError, runValidatorsAtUpdate } from './hooks.js';

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
  },
  notes: [itemSchema],
});

CalendarSchema.post('save', handleSaveError);

CalendarSchema.pre('findOneAndUpdate', runValidatorsAtUpdate);

CalendarSchema.post('findOneAndUpdate', handleSaveError);

const Calendar = model('calendar', CalendarSchema);

export default Calendar;
