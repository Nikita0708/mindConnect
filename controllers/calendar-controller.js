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

  try {
    const calendars = await Calendar.find({ owner });

    let highestIndex = 0;
    for (const calendar of calendars) {
      if (calendar.index > highestIndex) {
        highestIndex = calendar.index;
      }
    }

    const conditions = { owner, date };

    const updatedCalendar = await Calendar.findOneAndUpdate(
      conditions,
      {
        $push: {
          notes: {
            note,
            time,
          },
        },
        date,
        $setOnInsert: { index: highestIndex + 1 },
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

const setStatus = async (req, res) => {
  const { _id: owner } = req.user;
  const { status } = req.body;
  const { date } = req.params;
  const conditions = { owner, date };

  if (
    !['very bad', 'bad', '50/50', 'ok', 'good', 'very good'].includes(status)
  ) {
    throw HttpError(400, 'Invalid status');
  }

  const updatedCalendar = await Calendar.findOneAndUpdate(
    conditions,
    {
      status,
    },
    { new: true, upsert: true }
  );
  res.status(200).json(updatedCalendar);
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

const deleteCalendarById = async (req, res) => {
  const { calendarId } = req.params;
  const { _id: owner } = req.user;

  const calendar = await Calendar.findOne({ owner, _id: calendarId });

  if (!calendar || calendar.owner === owner) {
    throw HttpError(404, 'Calendar not found');
  }
  await Calendar.deleteOne({ _id: calendarId });
  res.status(200).json({ message: 'calendar deleted successfully' });
};

const getPrevCalendar = async (req, res) => {
  const { _id: owner } = req.user;
  const { calendarId } = req.params;

  if (!calendarId || calendarId === 'null') {
    // If calendarId is null, undefined, or the string "null", find and return the latest calendar
    const latestCalendar = await Calendar.findOne({ owner }).sort({
      index: -1,
    });

    if (!latestCalendar) {
      throw HttpError(404, 'No calendars found');
    }

    return res.status(200).json(latestCalendar);
  }

  const currentCalendar = await Calendar.findOne({ owner, _id: calendarId });

  if (!currentCalendar) {
    throw HttpError(404, 'Calendar not found');
  }

  const currentCalendarIndex = currentCalendar.index;

  const prevCalendars = await Calendar.find({
    owner,
    index: { $lt: currentCalendarIndex },
  })
    .sort({ index: -1 })
    .limit(1);

  if (prevCalendars.length === 0) {
    throw HttpError(404, 'No previous calendar found');
  }

  const prevCalendar = prevCalendars[0];

  res.status(200).json(prevCalendar);
};

const getNextCalendar = async (req, res) => {
  const { _id: owner } = req.user;
  const { calendarId } = req.params;

  const currentCalendar = await Calendar.findOne({ owner, _id: calendarId });
  if (!currentCalendar) {
    throw HttpError(404, 'Current calendar not found');
  }

  const currentCalendarIndex = currentCalendar.index;

  const nextCalendars = await Calendar.find({
    owner,
    index: { $gt: currentCalendarIndex },
  })
    .sort({ index: 1 })
    .limit(1);

  if (nextCalendars.length === 0) {
    throw HttpError(404, 'No next calendar found');
  }

  const nextCalendar = nextCalendars[0];

  res.status(200).json(nextCalendar);
};

const allCalendarDates = async (req, res) => {
  const { _id: owner } = req.user;

  const calendars = await Calendar.find({ owner });

  // Extract all date values from the calendars, filter out nulls, and format dates
  const dateArray = calendars
    .map((calendar) => calendar.date)
    .filter((date) => date !== null)
    .map((date) => {
      const d = new Date(date);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
        2,
        '0'
      )}-${String(d.getDate()).padStart(2, '0')}`;
    });

  // Remove any duplicate dates and sort them
  const uniqueDates = [...new Set(dateArray)].sort();

  res.status(200).json(uniqueDates);
};

export default {
  addCalendar: ctrlWrapper(addCalendar),
  getCalendarsByDates: ctrlWrapper(getCalendarsByDates),
  deleteNote: ctrlWrapper(deleteNote),
  getOneCalendar: ctrlWrapper(getOneCalendar),
  updateNote: ctrlWrapper(updateNote),
  setStatus: ctrlWrapper(setStatus),
  deleteCalendarById: ctrlWrapper(deleteCalendarById),
  getPrevCalendar: ctrlWrapper(getPrevCalendar),
  getNextCalendar: ctrlWrapper(getNextCalendar),
  allCalendarDates: ctrlWrapper(allCalendarDates),
};
