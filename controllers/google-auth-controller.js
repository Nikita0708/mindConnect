// import { HttpError } from '../helpers/index.js';
// import { ctrlWrapper } from '../decorators/index.js';
// import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { OAuth2Client } from 'google-auth-library';

const { API_KEY_JWT } = process.env;

const googleSignIn = async (req, res, next) => {
  // res.header('Access-Control-Allow-Origin', 'frontendlink');
  res.header('Referrer-Policy', 'no-referrer-when-downgrade');
  const redirectUrl =
    'https://mindconnect-vebk.onrender.com/api/auth/getgoogleuserdata';

  const oAuth2Client = new OAuth2Client(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    redirectUrl
  );
  const authorizeUrl = oAuth2Client.generateAuthUrl({
    access_type: 'online',
    scope: 'https://www.googleapis.com/auth/userinfo.profile openid',
    prompt: 'consent',
  });

  res.json({ url: authorizeUrl });
};

const getGoogleUserData = async (access_token) => {
  const response = await fetch(
    `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${access_token}`
  );
  const data = await response.json();
  console.log('data', data);
  return data;
};

const receiveGoogleUserData = async (req, res, next) => {
  const code = req.query.code;
  const redirectUrl =
    'https://mindconnect-vebk.onrender.com/api/auth/getgoogleuserdata';
  const oAuth2Client = new OAuth2Client(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    redirectUrl
  );
  const response = await oAuth2Client.getToken(code);
  await oAuth2Client.setCredentials(response.tokens);
  console.log('Tokens Acquired');
  const user = oAuth2Client.credentials;
  const userData = await getGoogleUserData(user.access_token);

  const isExistUser = await User.findOne({ sub: userData.sub });
  if (isExistUser) {
    const payload = {
      id: isExistUser._id,
    };
    const token = jwt.sign(payload, API_KEY_JWT, { expiresIn: '6h' });
    const refreshToken = jwt.sign(payload, API_KEY_JWT, { expiresIn: '7d' });

    const userInfo = await User.findByIdAndUpdate(isExistUser._id, {
      token,
      refreshToken,
    });
    res.json({
      token: userInfo.token,
      refreshToken: userInfo.refreshToken,
      user: { firstName: userInfo.firstName },
      message: 'You have successfully signed in',
    });
  } else {
    const newUser = await User.create({
      sub: userData.sub,
      firstName: userData.given_name,
      lastName: userData.family_name,
      image: userData.picture,
      email: userData.sub,
    });
    const payload = {
      id: newUser._id,
    };
    const token = jwt.sign(payload, API_KEY_JWT, { expiresIn: '6h' });
    const refreshToken = jwt.sign(payload, API_KEY_JWT, { expiresIn: '7d' });
    const userInfo = await User.findByIdAndUpdate(newUser._id, {
      token,
      refreshToken,
    });
    res.json({
      token: userInfo.token,
      refreshToken: userInfo.refreshToken,
      user: { firstName: userInfo.firstName },
      message: 'You have successfully signed up',
    });
  }
};

export default {
  googleSignIn,
  receiveGoogleUserData,
};
