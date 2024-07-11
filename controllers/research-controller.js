import { ctrlWrapper } from '../decorators/index.js';
import HttpError from '../helpers/HttpError.js';

import Research from '../models/Researches.js';

const getResearches = async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;

  const skip = (page - 1) * limit;
  const researches = await Research.find().skip(skip).limit(limit);
  if (!researches.length) {
    throw HttpError(404, 'Researches not found');
  }

  const totalDocuments = await Research.countDocuments();

  const totalPages = Math.ceil(totalDocuments / limit);

  res.status(200).json({
    researches,
    currentPage: page,
    totalPages,
    totalDocuments,
  });
  res.status(error.statusCode || 500).json({ message: error.message });
};

export default {
  getResearches: ctrlWrapper(getResearches),
};
