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
      const googleCookie = req.cookies?._ga;
      if (googleCookie) {
        // Implement logic to extract and verify user ID from Google cookie
        user_id = extractUserIdFromGoogleCookie(googleCookie);
      }
    }

    if (!user_id) {
      throw HttpError(401, 'Not authorized');
    }

    // Assuming you have access to MongoDB sessions data
    // and can extract the session object
    const session = await getSessionByUserId(user_id);
    if (!session) {
      throw HttpError(401, 'Not authorized');
    }

    // Check if user is logged in or logged out based on session data
    if ('passport' in session) {
      req.user = session['passport']['user'];
    } else {
      throw HttpError(401, 'Not authorized');
    }

    next();
  } catch (error) {
    next(HttpError(401, 'Not authorized'));
  }
};

export default ctrlWrapper(authenticate);
