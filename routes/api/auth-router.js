import express from 'express';
import authController from '../../controllers/auth-controller.js';
import googleAuthController from '../../controllers/google-auth-controller.js';
import { validateBody } from '../../decorators/index.js';
import { authenticate, upload } from '../../middlewares/index.js';
import {
  userSignupSchema,
  userSigninSchema,
  userInfoSchema,
} from '../../utils/validation/authValidationSchema.js';

const authRouter = express.Router();

const userSignupValidate = validateBody(userSignupSchema);
const userSigninValidate = validateBody(userSigninSchema);
const userInfoValidate = validateBody(userInfoSchema);

authRouter.get('/googlesignin', googleAuthController.googleSignIn);

authRouter.get(
  '/getgoogleuserdata',
  googleAuthController.receiveGoogleUserData
);

authRouter.post('/signup', userSignupValidate, authController.signup);

authRouter.post('/signin', userSigninValidate, authController.signin);

authRouter.post('/refreshtoken', authController.refreshtoken);

authRouter.patch(
  '/updatedetails',
  authenticate,
  upload.single('avatar'),
  userInfoValidate,
  authController.updateUserInfo
);

authRouter.get('/verify-token/:token', authController.verifyToken);

authRouter.post('/request-password-reset', authController.requestPasswordReset);
authRouter.post('/reset-password/:token', authController.resetPassword);

authRouter.get('/current', authenticate, authController.getCurrent);

authRouter.post('/logout', authenticate, authController.logout);

export default authRouter;
