import express from 'express';
import userController from '../../controllers/user-controller.js';
import { authenticate } from '../../middlewares/index.js';

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

userRouter.get(
  '/users-by-emails',
  authenticate,
  userController.findUsersByEmails
);

export default userRouter;
