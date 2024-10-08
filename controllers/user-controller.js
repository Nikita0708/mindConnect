import User from '../models/User.js';
import { HttpError } from '../helpers/index.js';
import { ctrlWrapper } from '../decorators/index.js';
import { v2 as cloudinary } from 'cloudinary';
import {
  startOfWeek,
  endOfWeek,
  addWeeks,
  eachDayOfInterval,
  format,
} from 'date-fns';
import DoctorCalendar from '../models/DoctorCalendar.js';
import nodemailer from 'nodemailer';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API,
  api_secret: process.env.CLOUDINARY_SECRET,
});

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

const updateDoctorProfile = async (req, res, next) => {
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
  const doctor = req.user;

  const doctorData = {
    id: doctor._id,
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

const getPublicDoctorDetails = async (req, res) => {
  const { doctorId } = req.params;
  const doctor = await User.findOne({ _id: doctorId });

  const doctorData = {
    id: doctor._id,
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

const getAvailableDates = async (req, res) => {
  const { doctorId } = req.params;
  let weekOffset = parseInt(req.query.weekOffset) || 0; // Prevent negative weekOffset

  if (weekOffset < 0) {
    weekOffset = 0; // Set to 0 or you can return an error if preferred
  } // Calculate the start and end of the desired week

  const currentDate = new Date();
  const start = format(
    startOfWeek(addWeeks(currentDate, weekOffset)),
    'yyyy-MM-dd'
  );
  const end = format(
    endOfWeek(addWeeks(currentDate, weekOffset)),
    'yyyy-MM-dd'
  ); // Get all days of the week

  const daysOfWeek = eachDayOfInterval({
    start: new Date(start),
    end: new Date(end),
  }).map((date) => format(date, 'yyyy-MM-dd')); // Find available slots for the given week

  const availableSlots = await DoctorCalendar.find({
    owner: doctorId,
    date: {
      $gte: start,
      $lte: end,
    },
  }); // Create a map of slots keyed by date

  const slotsMap = availableSlots.reduce((acc, slot) => {
    acc[slot.date] = { _id: slot._id, timeSlots: slot.timeSlots };
    return acc;
  }, {}); // Create the response

  const response = daysOfWeek.map((day) => ({
    date: day,
    _id: slotsMap[day]?._id || null, // Use null if no entry exists
    timeSlots: slotsMap[day]?.timeSlots || [], // If no slots exist, return an empty array
  })); // Return the response

  res.status(200).json(response);
};

const addAvailableDates = async (req, res) => {
  const { date, time } = req.body;
  const { _id: owner } = req.user;

  if (!date || !time) {
    return res
      .status(400)
      .json({ message: 'Date and time are required fields' });
  }
  const formattedDate = format(new Date(date), 'yyyy-MM-dd');

  const conditions = { owner, date };

  const newSlot = await DoctorCalendar.findOneAndUpdate(
    conditions,
    {
      $push: {
        timeSlots: {
          time,
        },
      },
      date: formattedDate,
    },
    { new: true, upsert: true }
  );

  if (!newSlot) {
    throw HttpError(404, 'Calendar entry not found');
  }

  res.status(200).json(newSlot);
};

const deleteAvailableSlot = async (req, res) => {
  const { _id: owner } = req.user;
  const { calendarId, timeSlotId } = req.params;

  const calendar = await DoctorCalendar.findOne({ _id: calendarId });
  console.log(calendar);

  if (!calendar) {
    throw HttpError(404, 'Slot not found');
  }

  const sloteItem = calendar.timeSlots.id(timeSlotId);

  if (!sloteItem) {
    throw HttpError(404, 'No time slot was found');
  }
  sloteItem.remove();
  await calendar.save();
  res.status(200).json({ message: 'successfully deleted entry' });
};

const sendConsultationEmail = async (req, res) => {
  const { date, time, text } = req.body;
  const { doctorId, calendarId, timeSlotId } = req.params;

  // Ensure asynchronous calls are awaited
  const doctor = await User.findOne({ _id: doctorId });
  if (!doctor) {
    HttpError(404, 'Doctor not found');
  }
  const calendar = await DoctorCalendar.findOne({ _id: calendarId });
  if (!calendar) {
    HttpError(404, 'Slot not found');
  }

  const slotItem = calendar.timeSlots.id(timeSlotId);
  if (!slotItem) {
    HttpError(404, 'No time slot was found');
  }

  const transporter = nodemailer.createTransport({
    service: 'Hotmail',
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    to: doctor.email,
    from: process.env.EMAIL,
    subject: 'Invitation received Mind Connect',
    text: `You received an appointment registration at ${time} on ${date}.\n\n
    Here is the message from the patient: ${text} `,
  };

  transporter.sendMail(mailOptions, (err) => {
    if (err) {
      console.error('Error sending email:', err); // Improved logging
      return res.status(500).json({ message: 'Error sending email.' });
    }

    // Remove slotItem if email was sent successfully
    slotItem.remove();
    calendar.save(); // Save the calendar after removing the time slot

    res.status(200).json({ message: 'Invitation sent' });
  });
};

export default {
  subscribeOnDoctor: ctrlWrapper(subscribeOnDoctor),
  unsubscribeOnDoctor: ctrlWrapper(unsubscribeOnDoctor),
  getDoctors: ctrlWrapper(getDoctors),
  updateDoctorProfile: ctrlWrapper(updateDoctorProfile),
  getDoctorDetails: ctrlWrapper(getDoctorDetails),
  getPublicDoctorDetails: ctrlWrapper(getPublicDoctorDetails),
  getAvailableDates: ctrlWrapper(getAvailableDates),
  deleteAvailableSlot: ctrlWrapper(deleteAvailableSlot),
  addAvailableDates: ctrlWrapper(addAvailableDates),
  sendConsultationEmail: ctrlWrapper(sendConsultationEmail),
};
