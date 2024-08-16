import mongoose from 'mongoose';
import { handleSaveError, runValidatorsAtUpdate } from './hooks.js';

const { Schema, model } = mongoose;

const timeSlotShema = new Schema({
  time: String,
});

const DoctorCalendarSchema = new Schema({
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    required: true,
  },
  date: String,
  timeSlots: [timeSlotShema],
});

DoctorCalendarSchema.post('save', handleSaveError);

DoctorCalendarSchema.pre('findOneAndUpdate', runValidatorsAtUpdate);

DoctorCalendarSchema.post('findOneAndUpdate', handleSaveError);

const DoctorCalendar = model('doctorCalendar', DoctorCalendarSchema);

export default DoctorCalendar;
