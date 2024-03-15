import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { HttpError } from '../helpers/index.js';
import { ctrlWrapper } from '../decorators/index.js';
import { v2 as cloudinary } from 'cloudinary';

const { API_KEY_JWT } = process.env;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API,
  api_secret: process.env.CLOUDINARY_SECRET,
});

const signup = async (req, res) => {
  const { firstName, email, password } = req.body;
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
    user: { email: userInfo.email, userName: firstName },
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
  const { email, firstName, lastName, number, avatarUrl } = req.user;
  res.json({
    email,
    firstName,
    lastName,
    number,
    image,
  });
};

const updateUserInfo = async (req, res) => {
  const { firstName, lastName, number, image } = req.body;

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

  const finalAvatarUrl = image || uploadedAvatarUrl || req.user.image;

  const updatedUserData = {
    firstName,
    lastName,
    number,
    image: finalAvatarUrl,
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

export default {
  signup: ctrlWrapper(signup),
  signin: ctrlWrapper(signin),
  getCurrent: ctrlWrapper(getCurrent),
  updateUserInfo: ctrlWrapper(updateUserInfo),
  logout: ctrlWrapper(logout),
};
