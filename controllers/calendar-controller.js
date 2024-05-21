import Calendar from '../models/Calendar.js';
import { HttpError } from '../helpers/index.js';
import { ctrlWrapper } from '../decorators/index.js';

const addCalendar = async (req, res, next) => {
  const { _id: owner } = req.user;
  const { date } = req.params;
  const { note } = req.body;

  if (!note) {
    return next(new HttpError(400, 'Note is required'));
  }

  const conditions = { owner, date };

  try {
    const updatedCalendar = await Calendar.findOneAndUpdate(
      conditions,
      {
        $push: {
          notes: {
            note,
          },
        },
        date: date,
      },
      { new: true, upsert: true }
    );

    if (!updatedCalendar) {
      throw new HttpError(404, 'Calendar entry not found');
    }

    res.status(200).json(updatedCalendar);
  } catch (error) {
    next(error);
  }
};

export default {
  addCalendar: ctrlWrapper(addCalendar),
};
