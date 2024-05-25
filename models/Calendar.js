import mongoose from 'mongoose';
import { handleSaveError, runValidatorsAtUpdate } from './hooks.js';

const { Schema, model } = mongoose;

const timeRegexp = /\b([01]?[0-9]|2[0-3]):[0-5][0-9]\b/;

const itemSchema = new Schema({
  note: { type: String, required: true },
  time: { type: String, match: timeRegexp, required: true },
  createdAt: { type: Date, default: Date.now },
});

const CalendarSchema = new Schema({
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    required: true,
  },
  // add matching regexp to date
  date: {
    type: Date,
  },
  notes: [itemSchema],
  status: {
    type: String,
    enum: ['very bad', 'bad', '50/50', 'ok', 'good', 'very good'],
  },
});

CalendarSchema.post('save', handleSaveError);

CalendarSchema.pre('findOneAndUpdate', runValidatorsAtUpdate);

CalendarSchema.post('findOneAndUpdate', handleSaveError);

const Calendar = model('calendar', CalendarSchema);

export default Calendar;
