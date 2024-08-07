import express from 'express';
import logger from 'morgan';
import cors from 'cors';
import 'dotenv/config';
import passport from 'passport';
import session from 'express-session';
import MongoStore from 'connect-mongo';

import authRouter from './routes/api/auth-router.js';
import calendarRouter from './routes/api/calendar-router.js';
import postsRouter from './routes/api/post-router.js';
import doctorPatientRouter from './routes/api/doctor-patient-router.js';
import userRouter from './routes/api/user-router.js';

import passportConfig from './utils/config/passport.js';
import cookieParser from 'cookie-parser';
import researchRouter from './routes/api/researches-router.js';
import chatRouter from './routes/api/chat-router.js';
passportConfig(passport);

const app = express();

const formatsLogger = app.get('env') === 'development' ? 'dev' : 'short';

app.use(
  session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.dbUrlMongoDB }),
  })
);
app.use(passport.initialize());
app.use(passport.session());

app.use(logger(formatsLogger));
app.use(cors({ credentials: true, origin: true }));
app.use(cookieParser());
app.use(express.json());
app.use(express.static('public'));

app.use('/api/auth', authRouter);
app.use('/api/calendar', calendarRouter);
app.use('/api/post', postsRouter);
app.use('/api/doctor-patient', doctorPatientRouter);
app.use('/api/user', userRouter);
app.use('/api/researches', researchRouter);
app.use('/api/ai', chatRouter);

// app.use((req, res) => {
//   res.status(404).json({ message: 'Not found' });
// });

app.use((err, req, res, next) => {
  const { status = 500, message = 'Server error' } = err;
  res.status(status).json({ message });
});

export default app;
