import { ctrlWrapper } from '../decorators/index.js';

import Research from '../models/Researches.js';

const getResearches = async (req, res) => {
  const researches = await Research.find();
  if (!researches) {
    throw HttpError(404, 'posts not found');
  }
  res.status(200).json(researches);
};

export default {
  getResearches: ctrlWrapper(getResearches),
};
