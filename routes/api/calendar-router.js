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
// Add owner middleware
calendarRouter.get(
  '/dates-calendar',
  authenticate,
  calendarController.getCalendarsByDates
);
calendarRouter.delete(
  '/delete-note/:date/notes/:noteId',
  authenticate,
  calendarController.deleteNote
);
calendarRouter.get(
  '/one-calendar/:date',
  authenticate,
  calendarController.getOneCalendar
);
calendarRouter.put(
  '/update-note/:date/notes/:noteId',
  authenticate,
  calendarValidate,
  calendarController.updateNote
);
calendarRouter.post(
  '/update-status/:date',
  authenticate,
  calendarController.setStatus
);

export default calendarRouter;
