import { HttpError } from '../helpers/index.js';

import { ctrlWrapper } from '../decorators/index.js';
import User from '../models/User.js';

const isDoctor = async (req, res, next) => {
  const { _id } = req.user;

  const user = await User.findById(_id);
  if (!user.isDoctor) {
    next(HttpError(403, 'You are not a doctor'));
  } else {
    next();
  }
};

export default ctrlWrapper(isDoctor);
