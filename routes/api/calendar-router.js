import express from 'express';
import calendarController from '../../controllers/calendar-controller.js';
import { authenticate } from '../../middlewares/index.js';

const calendarRouter = express.Router();

calendarRouter.post(
  '/add-calendar/:date',
  authenticate,
  calendarController.addCalendar
);

export default calendarRouter;
