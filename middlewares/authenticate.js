import jwt from 'jsonwebtoken';
import { HttpError } from '../helpers/index.js';
import { ctrlWrapper } from '../decorators/index.js';
import User from '../models/User.js';

const { API_KEY_JWT } = process.env;

const authenticate = async (req, res, next) => {
  const { authorization = '' } = req.headers;
  const [bearer, token] = authorization.split(' ');
  if (bearer !== 'Bearer') {
    throw HttpError(401, 'Not authorized');
  }

  try {
    let user_id;
    if (token) {
      const decoded_token = jwt.decode(token, API_KEY_JWT, {
        algorithms: ['HS256'],
      });
      user_id = decoded_token?.id;
    } else {
      // Handle cookie-based authentication
      const cookie = req.cookies?.cookie;
      if (cookie) {
        user_id = cookie?.passport?.user;
      } else {
        throw HttpError(401, 'Not authorized');
      }
    }

    const user = await User.findById(user_id);
    if (!user || !user.token) {
      throw HttpError(401, 'Not authorized');
    }

    req.user = user;
    next();
  } catch (error) {
    next(HttpError(401, 'Not authorized'));
  }
};

export default ctrlWrapper(authenticate);
