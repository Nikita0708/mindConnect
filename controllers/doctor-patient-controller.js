import { HttpError } from '../helpers/index.js';
import { ctrlWrapper } from '../decorators/index.js';
import User from '../models/User.js';

const addPatient = async (req, res) => {
  const { patientId } = req.params;
  const { _id } = req.user;

  const patient = await User.findByIdAndUpdate(
    { _id: patientId },
    {
      patientDoctor: _id,
    }
  );
  const doctor = await User.findById(_id);
  doctor.doctorPatients.push(patientId);
  doctor.save();
  res
    .status(200)
    .json({ message: 'You successfully added a patient', patient });
};

const removePatient = async (req, res) => {
  const { patientId } = req.params;
  const { _id } = req.user;

  const doctor = await User.findById(_id);
  if (!doctor.doctorPatients.includes(patientId)) {
    throw HttpError(404, 'Your patient is not found');
  }
  doctor.doctorPatients.remove(patientId);
  doctor.save();

  const patient = await User.findByIdAndUpdate(
    { _id: patientId },
    {
      patientDoctor: null,
    }
  );
  res.status(200).json({ message: 'You successfully removed patient' });
};

export default {
  addPatient: ctrlWrapper(addPatient),
  removePatient: ctrlWrapper(removePatient),
};
