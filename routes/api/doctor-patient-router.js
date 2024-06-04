import express from 'express';
import doctorPatientController from '../../controllers/doctor-patient-controller.js';
import {
  isDoctor,
  authenticate,
  doctorPatient,
} from '../../middlewares/index.js';

const doctorPatientRouter = express.Router();

doctorPatientRouter.post(
  '/add-patient/:patientId',
  authenticate,
  isDoctor,
  doctorPatient,
  doctorPatientController.addPatient
);
doctorPatientRouter.delete(
  '/delete-patient/:patientId',
  authenticate,
  isDoctor,
  doctorPatientController.removePatient
);

export default doctorPatientRouter;
