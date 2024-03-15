import express from 'express';
import authController from '../../controllers/auth-controller.js';
import { validateBody } from '../../decorators/index.js';
import { authenticate, upload } from '../../middlewares/index.js';
import {
  userSignupSchema,
  userSigninSchema,
  userInfoSchema,
} from '../../utils/validation/authValidationSchema.js';
import passport from 'passport';

const authRouter = express.Router();

const userSignupValidate = validateBody(userSignupSchema);
const userSigninValidate = validateBody(userSigninSchema);
const userInfoValidate = validateBody(userInfoSchema);

authRouter.get(
  '/google',
  passport.authenticate('google', { scope: ['profile'] })
);
authRouter.get(
  '/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    res.status(200).json('you successfully loged in via Google');
  }
);
authRouter.get('/googlelogout', (req, res, next) => {
  req.logout((error) => {
    if (error) {
      return next(error);
    }
    res.json('you successfully loged out');
  });
});

authRouter.post('/signup', userSignupValidate, authController.signup);

authRouter.post('/signin', userSigninValidate, authController.signin);

authRouter.patch(
  '/updatedetails',
  authenticate,
  upload.single('avatar'),
  userInfoValidate,
  authController.updateUserInfo
);

authRouter.get('/current', authenticate, authController.getCurrent);

authRouter.post('/logout', authenticate, authController.logout);

export default authRouter;
