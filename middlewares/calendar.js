import { HttpError } from '../helpers/index.js';
import { ctrlWrapper } from '../decorators/index.js';

import Calendar from '../models/Calendar.js';

const calendar = async (req, res, next) => {
  try {
    const { _id: owner } = req.user;
    const { date } = req.params;

    const result = await Calendar.findOne({ owner, date });
    if (!result) {
      return next();
    }

    if (result.notes && result.notes.length > 10) {
      throw HttpError(403, 'You can have only 10 notes in one day');
    } else {
      next();
    }
  } catch (error) {
    next(error);
  }
};

export default ctrlWrapper(calendar);
