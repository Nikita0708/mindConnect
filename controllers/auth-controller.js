import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { HttpError } from '../helpers/index.js';
import { ctrlWrapper } from '../decorators/index.js';
import { v2 as cloudinary } from 'cloudinary';
import nodemailer from 'nodemailer';
import axios from 'axios';

const { API_KEY_JWT, API_KEY_JWT_REFRESH } = process.env;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API,
  api_secret: process.env.CLOUDINARY_SECRET,
});

const signup = async (req, res) => {
  const {
    firstName,
    email,
    password,
    isDoctor,
    certificate,
    username,
  } = req.body;
  const user = await User.findOne({ email });
  const userNameExists = await User.findOne({ username });
  if (userNameExists) {
    throw HttpError(409, `username ${userNameExists} already in use`);
  }
  if (user) {
    throw HttpError(409, `email ${email} already in use`);
  }

  if (isDoctor && !certificate) {
    throw HttpError(403, 'if you are doctor, you must have a certificate');
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

  const token = jwt.sign(payload, API_KEY_JWT, { expiresIn: '6h' });
  const refreshToken = jwt.sign(payload, API_KEY_JWT_REFRESH, {
    expiresIn: '7d',
  });
  const userInfo = await User.findByIdAndUpdate(newUser._id, {
    token,
    refreshToken,
  });

  try {
    const r = await axios.put(
      'https://api.chatengine.io/users/',
      {
        username: username,
        secret: username,
        first_name: firstName,
      },
      { headers: { 'private-key': process.env.CHAT_ENGINE_PRIVATE_KEY } }
    );
    return res.status(r.status).json(r.data);
  } catch (error) {
    return res.status(error.response.status).json(error.response.data);
  }

  res.status(201).json({
    token: userInfo.token,
    refreshToken: userInfo.refreshToken,
    user: { email: userInfo.email, username: username, userName: firstName },
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

  const token = jwt.sign(payload, API_KEY_JWT, { expiresIn: '6h' });
  const refreshToken = jwt.sign(payload, API_KEY_JWT_REFRESH, {
    expiresIn: '7d',
  });
  const userInfo = await User.findByIdAndUpdate(user._id, {
    token,
    refreshToken,
  });

  res.json({
    token: userInfo.token,
    refreshToken: userInfo.refreshToken,
    user: { email: userInfo.email },
    message: 'You have successfully signed in',
  });
};

const getCurrent = async (req, res) => {
  const {
    _id,
    email,
    firstName,
    lastName,
    phoneNumber,
    age,
    city,
    country,
    image,
    certificate,
    description,
    isDoctor,
    username,
  } = req.user;
  res.json({
    id: _id,
    email,
    firstName,
    lastName,
    phoneNumber,
    image,
    certificate,
    description,
    phoneNumber,
    age,
    city,
    country,
    isDoctor,
    username,
  });
};

const updateUserInfo = async (req, res) => {
  const {
    firstName,
    lastName,
    number,
    image,
    description,
    country,
    city,
    age,
  } = req.body;

  const { _id, isDoctor } = req.user;

  let uploadedAvatarUrl = null;

  if (req.file) {
    const { path: temporaryName } = req.file;

    try {
      const existingUser = await User.findById(_id);
      if (existingUser.image) {
        const publicId = existingUser.image.split('/').pop().split('.')[0];
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

  const finalAvatarUrl = image || uploadedAvatarUrl || req.user.image;

  if (!isDoctor && description) {
    throw HttpError(403, 'you are not a doctor to change your description');
  }

  const updatedUserData = {
    firstName: firstName || req.user.firstName,
    lastName: lastName || req.user.lastName,
    number: number || req.user.number,
    description: description || req.user.description,
    age: age || req.user.age,
    city: city || req.user.city,
    country: country || req.user.country,
    image: finalAvatarUrl || req.user.iamge,
  };

  await User.findByIdAndUpdate(_id, updatedUserData);

  res.status(200).json(updatedUserData);
};

const logout = async (req, res) => {
  const { _id } = req.user;
  await User.findByIdAndUpdate(_id, { token: '', refreshToken: '' });

  res.json({
    message: 'Logout success',
  });
};

const refreshToken = async (req, res) => {
  const { refreshToken } = req.body;
  const userData = jwt.verify(refreshToken, process.env.API_KEY_JWT_REFRESH);

  const existingUser = await User.findById(userData.id);

  if (refreshToken === existingUser.refreshToken) {
    const payload = {
      id: existingUser._id,
    };
    const token = jwt.sign(payload, API_KEY_JWT, { expiresIn: '6h' });
    const newRefreshToken = jwt.sign(payload, API_KEY_JWT_REFRESH, {
      expiresIn: '7d',
    });

    const userInfo = await User.findByIdAndUpdate(existingUser._id, {
      token,
      refreshToken: newRefreshToken,
    });
    res.json({
      token: userInfo.token,
      refreshToken: userInfo.refreshToken,
    });
  } else {
    throw HttpError(401, 'refresh token is not valid');
  }
};

const requestPasswordReset = async (req, res) => {
  const { email } = req.body;
  const existingUser = await User.findOne({ email });

  if (!existingUser) {
    throw HttpError(400, 'User with this email does not exist');
  }

  const FIVE_MINUTES = 5 * 60 * 1000;
  const now = Date.now();

  if (
    existingUser.resetPasswordRequestedAt &&
    now - existingUser.resetPasswordRequestedAt < FIVE_MINUTES
  ) {
    throw HttpError(
      400,
      'password reset was already requested, wait for 15 minutes'
    );
  }
  const payload = {
    id: existingUser._id,
  };
  const token = jwt.sign(payload, API_KEY_JWT, { expiresIn: '15m' });

  await User.findByIdAndUpdate(existingUser._id, {
    resetPasswordtoken: token,
    resetPasswordRequestedAt: now,
  });

  const transporter = nodemailer.createTransport({
    service: 'Hotmail',
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    to: existingUser.email,
    from: process.env.EMAIL,
    subject: 'Password Reset Mind Connect',
    text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n
           Please click on the following link, or paste this into your browser to complete the process:\n\n
           https://${req.headers.host}/auth/reset-password/${token}\n\n
           If you did not request this, please ignore this email and your password will remain unchanged.\n`,
  };

  transporter.sendMail(mailOptions, (err) => {
    if (err) {
      return res.status(500).json('Error sending email.');
    }
    res.status(200).json('Password reset link sent.');
  });
};

const verifyToken = async (req, res) => {
  const token = req.params.token;
  const decoded = jwt.verify(token, process.env.API_KEY_JWT);

  const user = await User.findOne({
    _id: decoded.id,
    resetPasswordtoken: token,
  });

  if (!user) {
    throw HttpError(400, 'Password reset token is invalid or expired.');
  }
  res.status(200).json('token valid');
};

const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.API_KEY_JWT);
    const user = await User.findOne({
      _id: decoded.id,
      resetPasswordtoken: token,
    });

    if (!user) {
      throw HttpError(400, 'Password reset token is invalid or expired.');
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.findByIdAndUpdate(user._id, {
      password: hashedPassword,
      resetPasswordtoken: '',
    });
    res.status(200).json('Password has been reset.');
  } catch (err) {
    res.status(500).json('Error resetting password.');
  }
};

const findUsersByEmails = async (req, res) => {
  const { emails } = req.body;

  if (!Array.isArray(emails)) {
    throw HttpError(400, 'Invalid input. Array expected');
  }
  const users = await User.find({ email: { $in: emails } }).select('_id');
  const userIds = users.map((user) => user._id);

  res.status(200).json({ userIds });
};

export default {
  signup: ctrlWrapper(signup),
  signin: ctrlWrapper(signin),
  getCurrent: ctrlWrapper(getCurrent),
  updateUserInfo: ctrlWrapper(updateUserInfo),
  logout: ctrlWrapper(logout),
  refreshtoken: ctrlWrapper(refreshToken),
  requestPasswordReset: ctrlWrapper(requestPasswordReset),
  resetPassword: ctrlWrapper(resetPassword),
  verifyToken: ctrlWrapper(verifyToken),
  findUsersByEmails: ctrlWrapper(findUsersByEmails),
};
