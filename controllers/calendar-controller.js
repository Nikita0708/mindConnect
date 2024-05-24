import Calendar from '../models/Calendar.js';
import { HttpError } from '../helpers/index.js';
import { ctrlWrapper } from '../decorators/index.js';

const addCalendar = async (req, res, next) => {
  const { _id: owner } = req.user;
  const { date } = req.params;
  const { time, note } = req.body;

  if (!note) {
    throw HttpError(400, 'Note is required');
  }
  if (!time) {
    throw HttpError(400, 'Time is required');
  }

  const conditions = { owner, date };

  try {
    const updatedCalendar = await Calendar.findOneAndUpdate(
      conditions,
      {
        $push: {
          notes: {
            note,
            time,
          },
        },
        date: date,
      },
      { new: true, upsert: true }
    );

    if (!updatedCalendar) {
      throw HttpError(404, 'Calendar entry not found');
    }

    res.status(200).json(updatedCalendar);
  } catch (error) {
    next(error);
  }
};

const getCalendarsByDates = async (req, res) => {
  const { _id: owner } = req.user;
  const { startDate, endDate } = req.query;

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (isNaN(start) || isNaN(end)) {
    throw HttpError(400, 'Invalid date format');
  }
  if (end < start) {
    throw HttpError(400, 'End date must be after start date');
  }

  const calendars = await Calendar.find({
    owner: owner,
    date: {
      $gte: start,
      $lte: end,
    },
  });

  if (calendars.length === 0) {
    throw HttpError(404, 'Calendars not found');
  }

  res.status(200).json(calendars);
};

const getOneCalendar = async (req, res) => {
  const { _id: owner } = req.user;
  const { date } = req.params;
  const calendar = await Calendar.findOne({ owner, date });

  if (!calendar) {
    throw HttpError(404, 'Calendar not found');
  }
  res.status(200).json(calendar);
};

const deleteNote = async (req, res) => {
  const { _id: owner } = req.user;
  const { date, noteId } = req.params;
  const calendar = await Calendar.findOne({ owner, date });

  if (!calendar) {
    throw HttpError(404, 'Calendar not found');
  }

  const noteItem = calendar.notes.id(noteId);
  if (!noteItem) {
    throw HttpError(404, 'Note not found');
  }
  noteItem.remove();
  await calendar.save();
  res.status(200).json({ message: 'Note deleted successfully', calendar });
};

const updateNote = async (req, res, next) => {
  try {
    const { _id: owner } = req.user;
    const { date, noteId } = req.params;
    const { note, time } = req.body;

    const calendar = await Calendar.findOne({ owner, date });

    if (!calendar) {
      return next(HttpError(404, 'Calendar not found'));
    }

    const noteItem = calendar.notes.id(noteId);
    if (!noteItem) {
      return next(HttpError(404, 'Note not found'));
    }

    // If note is an empty string or undefined, remove the note
    if (note === '' || note === undefined) {
      noteItem.remove();
      await calendar.save();
      return res.status(200).json('Note deleted successfully');
    }

    // Update note and/or time if they are defined
    if (note !== undefined) noteItem.note = note;
    if (time !== undefined) noteItem.time = time;

    await calendar.save();
    res
      .status(200)
      .json({ message: 'Note updated successfully', note: noteItem });
  } catch (error) {
    next(error);
  }
};

export default {
  addCalendar: ctrlWrapper(addCalendar),
  getCalendarsByDates: ctrlWrapper(getCalendarsByDates),
  deleteNote: ctrlWrapper(deleteNote),
  getOneCalendar: ctrlWrapper(getOneCalendar),
  updateNote: ctrlWrapper(updateNote),
};
