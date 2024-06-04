import { HttpError } from '../helpers/index.js';
import { ctrlWrapper } from '../decorators/index.js';
import User from '../models/User.js';

const doctorPatient = async (req, res, next) => {
  const { patientId } = req.params;
  const { _id } = req.user;

  const patient = await User.findById({ _id: patientId });
  if (!patient) {
    throw HttpError(404, 'Patient is not found');
  }
  if (patientId === _id) {
    throw HttpError(403, 'You cannot add yourself as a doctor');
  }
  if (patient.isDoctor === true) {
    throw HttpError(403, 'You cannot add a doctor as a patient');
  }
  if (patient.patientDoctor) {
    throw HttpError(
      403,
      'Patient already has a doctor, or it is yours patient'
    );
  }
  next();
};

export default ctrlWrapper(doctorPatient);
