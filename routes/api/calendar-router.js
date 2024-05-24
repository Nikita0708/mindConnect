import express from 'express';
import calendarController from '../../controllers/calendar-controller.js';
import { authenticate, calendar } from '../../middlewares/index.js';
import { validateBody } from '../../decorators/index.js';
import { calendarSchema } from '../../utils/validation/calendarValidationSchema.js';
const calendarRouter = express.Router();

const calendarValidate = validateBody(calendarSchema);

calendarRouter.post(
  '/add-calendar/:date',
  authenticate,
  calendar,
  calendarValidate,
  calendarController.addCalendar
);
calendarRouter.get(
  '/calendars',
  authenticate,
  calendarController.getCalendarsByDates
);
calendarRouter.delete(
  '/calendar/:date/notes/:noteId',
  authenticate,
  calendarController.deleteNote
);
calendarRouter.get(
  '/calendar/:date',
  authenticate,
  calendarController.getOneCalendar
);
calendarRouter.put(
  '/calendar/:date/notes/:noteId',
  authenticate,
  calendarValidate,
  calendarController.updateNote
);

export default calendarRouter;
