import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { HttpError } from '../helpers/index.js';
import { ctrlWrapper } from '../decorators/index.js';
import { v2 as cloudinary } from 'cloudinary';
const { CLIENT_ID } = process.env;
const { CLIENT_SECRET } = process.env;
import { OAuth2Client } from 'google-auth-library';

const { API_KEY_JWT } = process.env;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API,
  api_secret: process.env.CLOUDINARY_SECRET,
});

const signup = async (req, res) => {
  const { name, email, password } = req.body;
  const user = await User.findOne({ email });
  if (user) {
    throw HttpError(409, `email ${email} already in use`);
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await User.create({
    ...req.body,
    password: hashedPassword,
    createdAt: new Date(),
  });

  const payload = {
    id: newUser._id,
  };

  const token = jwt.sign(payload, API_KEY_JWT, { expiresIn: '23h' });
  const userInfo = await User.findByIdAndUpdate(newUser._id, { token });

  res.status(201).json({
    token: userInfo.token,
    user: { email: userInfo.email, userName: name },
    message: 'You have successfully signed up',
  });
};

const signin = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    throw HttpError(401, 'Email or password is wrong');
  }
  const passwordCompare = await bcrypt.compare(password, user.password);
  if (!passwordCompare) {
    throw HttpError(401, 'Email or password is wrong');
  }

  const payload = {
    id: user._id,
  };

  const token = jwt.sign(payload, API_KEY_JWT, { expiresIn: '23h' });
  const userInfo = await User.findByIdAndUpdate(user._id, { token });

  res.json({
    token: userInfo.token,
    user: { email: userInfo.email },
    message: 'You have successfully signed in',
  });
};

const getCurrent = async (req, res) => {
  const { email, name, lastName, number, avatarUrl } = req.user;
  res.json({
    email,
    name,
    lastName,
    number,
    avatarUrl,
  });
};

const updateUserInfo = async (req, res) => {
  const { name, lastName, number, avatarUrl } = req.body;

  const { _id } = req.user;

  let uploadedAvatarUrl = null;

  if (req.file) {
    const { path: temporaryName } = req.file;

    try {
      const existingUser = await User.findById(_id);
      if (existingUser.avatarUrl) {
        const publicId = existingUser.avatarUrl.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(`avatarsMindConnect/${publicId}`);
      }
      const result = await cloudinary.uploader.upload(temporaryName, {
        folder: 'avatarsMindConnect',
      });

      uploadedAvatarUrl = result.secure_url;
    } catch (err) {
      return next(err);
    }
  }

  const finalAvatarUrl = avatarUrl || uploadedAvatarUrl || req.user.avatarURL;

  const updatedUserData = {
    name,
    lastName,
    number,
    avatarUrl: finalAvatarUrl,
  };
  await User.findByIdAndUpdate(_id, updatedUserData);

  res.status(200).json(updatedUserData);
};

const logout = async (req, res) => {
  const { _id } = req.user;
  await User.findByIdAndUpdate(_id, { token: '' });

  res.json({
    message: 'Logout success',
  });
};

// Google Auth

const getGoogleUserData = async (access_token) => {
  const response = await fetch(
    `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${access_token}`
  );
  const data = await response.json();
  return {
    token: access_token,
    name: data.given_name,
    Lastname: data.family_name,
    avatarUrl: data.picture,
  };
};

const googleSignIn = async (_, res) => {
  res.header(
    'Access-Control-Allow-Origin',
    'https://mindconnect-vebk.onrender.com'
  );
  res.header('Referrer-Policy', 'no-referrer-when-downgrade');

  const redirectUrl =
    'https://mindconnect-vebk.onrender.com/api/auth/googleUserData';
  const oAuth2Client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, redirectUrl);

  const authorizeUrl = oAuth2Client.generateAuthUrl({
    scope: 'https://www.googleapis.com/auth/userinfo.profile openid',
    prompt: 'consent',
  });
  res.json({ url: authorizeUrl });
};

const receiveGoogleUserData = async (req, res) => {
  const code = req.query.code;
  try {
    const redirectUrl =
      'https://mindconnect-vebk.onrender.com/api/auth/googleUserData';
    const oAuth2Client = new OAuth2Client(
      CLIENT_ID,
      CLIENT_SECRET,
      redirectUrl
    );
    const tokenResponse = await oAuth2Client.getToken(code);
    await oAuth2Client.setCredentials(tokenResponse.tokens);
    const { tokens } = tokenResponse;
    const user = oAuth2Client.credentials;
    const googleUserData = await getGoogleUserData(tokens.access_token);

    const userMongo = await User.findOne({ email: googleUserData.email });

    if (!userMongo) {
      // Create a new user if not exists
      userMongo = await User.create({
        email: googleUserData.email,
        name: googleUserData.name,
        password: '',
        avatarUrl: googleUserData.avatarUrl,
        createdAt: new Date(),
      });
    }
    await User.findByIdAndUpdate(userMongo._id, { token: tokens.access_token });

    res.status(200).json({
      token: tokens.access_token,
      user: { email: userMongo.email, userName: userMongo.name },
      message: 'You have successfully signed in with Google',
    });
  } catch (err) {
    console.log('error with Google sign-in', err);
    res.status(500).send(err.message); // Send error message in response
  }
};

export default {
  signup: ctrlWrapper(signup),
  signin: ctrlWrapper(signin),
  getCurrent: ctrlWrapper(getCurrent),
  updateUserInfo: ctrlWrapper(updateUserInfo),
  logout: ctrlWrapper(logout),
  googleSignIn: googleSignIn,
  receiveGoogleUserData: receiveGoogleUserData,
};
