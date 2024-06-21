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

const findUsersByEmails = async (req, res) => {
  const { emails } = req.body;

  if (!Array.isArray(emails)) {
    throw HttpError(400, 'Invalid input. Array expected');
  }
  const users = await User.find({ email: { $in: emails } }).select('_id');

  res.status(200).json({ users });
};

export default {
  subscribeOnDoctor: ctrlWrapper(subscribeOnDoctor),
  unsubscribeOnDoctor: ctrlWrapper(unsubscribeOnDoctor),
  getDoctors: ctrlWrapper(getDoctors),
  findUsersByEmails: ctrlWrapper(findUsersByEmails),
};
