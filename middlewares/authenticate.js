import jwt from 'jsonwebtoken';
import { HttpError } from '../helpers/index.js';
import { ctrlWrapper } from '../decorators/index.js';
import User from '../models/User.js';

const { API_KEY_JWT } = process.env;

const authenticate = async (req, res, next) => {
  try {
    let user_id;

    // Check for JWT token
    const { authorization = '' } = req.headers;
    const [bearer, token] = authorization.split(' ');
    if (bearer === 'Bearer' && token) {
      const decoded_token = jwt.verify(token, API_KEY_JWT, {
        algorithms: ['HS256'],
      });
      user_id = decoded_token.id;
    } else {
      // If no token, attempt to retrieve user ID from session cookie
      const cookie = req.cookies?.cookie;
      if (cookie && cookie.session) {
        const sessionData = JSON.parse(cookie.session);
        user_id = sessionData.passport?.user;
      }
    }

    // If user ID is not found from token or session cookie, throw error
    if (!user_id) {
      throw HttpError(401, 'Not authorized');
    }

    // Check if user exists in the database
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
