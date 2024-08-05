import User from '../models/User.js';
import { HttpError } from '../helpers/index.js';
import { ctrlWrapper } from '../decorators/index.js';

const subscribeOnDoctor = async (req, res) => {
  const { _id } = req.user;
  const { doctorId } = req.params;

  const doctor = await User.findById({ _id: doctorId });

  if (!doctor) {
    throw HttpError(404, 'Doctor not found');
  }
  if (doctor.subscribers.includes(_id)) {
    throw HttpError(403, 'Already subscribed');
  }
  doctor.subscribers.push(_id);
  await doctor.save();

  const subscriber = await User.findById(_id);
  if (!subscriber.subscribedTo.includes({ _id: doctorId })) {
    subscriber.subscribedTo.push(doctorId);
    await subscriber.save();
  }
  res.status(200).json('you successfully subscribed');
};

const unsubscribeOnDoctor = async (req, res) => {
  const { _id } = req.user;
  const { doctorId } = req.params;

  const doctor = await User.findById({ _id: doctorId });
  if (!doctor) {
    throw HttpError(404, 'Doctor not found');
  }
  if (!doctor.subscribers.includes(_id)) {
    throw HttpError(403, 'You are not subscribed');
  }

  doctor.subscribers = doctor.subscribers.filter(
    (id) => id.toString() !== _id.toString()
  );
  await doctor.save();

  const subscriber = await User.findById(_id);
  if (subscriber.subscribedTo.includes(doctorId)) {
    subscriber.subscribedTo = subscriber.subscribedTo.filter(
      (id) => id.toString() !== doctorId.toString()
    );
    await subscriber.save();
  }
  res.status(200).json('You unsubscribed');
};

const getDoctors = async (req, res) => {
  const doctors = await User.find({ isDoctor: true });
  if (!doctors) {
    throw HttpError(404, 'Doctors not found');
  }
  res.status(200).json(doctors);
};

const updateDoctorProfile = async (req, res) => {
  const {
    description,
    priceOneHour,
    typeOfConsultation,
    fieldsOfProblems,
    aboutMe,
    languages,
    country,
    city,
    image,
    yearsOfExperience,
    firstName,
    lastName,
    phoneNumber,
    age,
    gender,
  } = req.body;
  const { _id } = req.user;

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

  const updatedDoctorData = {
    firstName: firstName || req.user.firstName,
    lastName: lastName || req.user.lastName,
    phoneNumber: phoneNumber || req.user.phoneNumber,
    description: description || req.user.description,
    image: finalAvatarUrl || req.user.image,
    priceOneHour: {
      price: priceOneHour?.price || req.user.priceOneHour?.price,
      currency: priceOneHour?.currency || req.user.priceOneHour?.currency,
    },
    typeOfConsultation: typeOfConsultation || req.user.typeOfConsultation,
    fieldsOfProblems: fieldsOfProblems || req.user.fieldsOfProblems,
    aboutMe: aboutMe || req.user.aboutMe,
    languages: languages || req.user.languages,
    country: country || req.user.country,
    city: city || req.user.city,
    yearsOfExperience: yearsOfExperience || req.user.yearsOfExperience,
    age: age || req.user.age,
    gender: gender || req.user.gender,
  };

  await User.findByIdAndUpdate(_id, updatedDoctorData);
  res.status(200).json(updatedDoctorData);
};

const getDoctorDetails = async (req, res) => {
  const { doctorId } = req.params;
  const doctor = await User.findOne({ _id: doctorId });

  const doctorData = {
    firstName: doctor.firstName,
    lastName: doctor.lastName,
    phoneNumber: doctor.phoneNumber,
    description: doctor.description,
    image: doctor.image,
    priceOneHour: {
      price: doctor.priceOneHour?.price,
      currency: doctor.priceOneHour?.currency,
    },
    typeOfConsultation: doctor.typeOfConsultation,
    fieldsOfProblems: doctor.fieldsOfProblems,
    aboutMe: doctor.aboutMe,
    languages: doctor.languages,
    country: doctor.country,
    city: doctor.city,
    yearsOfExperience: doctor.yearsOfExperience,
    age: doctor.age,
    gender: doctor.gender,
  };

  res.status(200).json(doctorData);
};

export default {
  subscribeOnDoctor: ctrlWrapper(subscribeOnDoctor),
  unsubscribeOnDoctor: ctrlWrapper(unsubscribeOnDoctor),
  getDoctors: ctrlWrapper(getDoctors),
  updateDoctorProfile: ctrlWrapper(updateDoctorProfile),
  getDoctorDetails: ctrlWrapper(getDoctorDetails),
};
