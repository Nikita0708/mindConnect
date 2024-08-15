import express from 'express';
import userController from '../../controllers/user-controller.js';
import { authenticate, isDoctor, upload } from '../../middlewares/index.js';

const userRouter = express.Router();

userRouter.patch(
  '/subscribe/:doctorId',
  authenticate,
  userController.subscribeOnDoctor
);

userRouter.patch(
  '/unsubscribe/:doctorId',
  authenticate,
  userController.unsubscribeOnDoctor
);

userRouter.get('/doctors', authenticate, userController.getDoctors);

userRouter.patch(
  '/update-doctor-profile',
  authenticate,
  isDoctor,
  upload.single('image'),
  userController.updateDoctorProfile
);

userRouter.get(
  '/doctor-details/',
  authenticate,
  isDoctor,
  userController.getDoctorDetails
);

userRouter.get(
  '/public-doctor-details/:doctorId',
  authenticate,
  userController.getPublicDoctorDetails
);

userRouter.get(
  '/calendar/:doctorId',
  authenticate,
  userController.getAvailableDates
);

userRouter.post(
  '/calendar',
  authenticate,
  isDoctor,
  userController.addAvailableDates
);

userRouter.delete(
  '/calendar/:calendarId',
  authenticate,
  isDoctor,
  userController.deleteAvailableSlot
);

export default userRouter;
