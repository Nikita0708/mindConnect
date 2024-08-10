import express from 'express';
import calendarController from '../../controllers/calendar-controller.js';
import { authenticate, calendar } from '../../middlewares/index.js';
const calendarRouter = express.Router();

calendarRouter.post(
  '/add-calendar/:date',
  authenticate,
  calendar,
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
  calendarController.updateNote
);
calendarRouter.post(
  '/update-status/:date',
  authenticate,
  calendarController.setStatus
);

calendarRouter.delete(
  '/delete/:calendarId',
  authenticate,
  calendarController.deleteCalendarById
);

calendarRouter.get(
  '/previous-calendar/:calendarId',
  authenticate,
  calendarController.getPrevCalendar
);

calendarRouter.get(
  '/next-calendar/:calendarId',
  authenticate,
  calendarController.getNextCalendar
);

calendarRouter.get(
  '/all-dates',
  authenticate,
  calendarController.allCalendarDates
);

export default calendarRouter;
