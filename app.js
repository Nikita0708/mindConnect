import express from 'express';
import logger from 'morgan';
import cors from 'cors';
import 'dotenv/config';
import passport from 'passport';
import authRouter from './routes/api/auth-router.js';
import session from 'express-session';
import mongoose from 'mongoose';
import MongoStore from 'connect-mongo';

import passportConfig from './utils/config/passport.js';
passportConfig(passport);

const app = express();

const formatsLogger = app.get('env') === 'development' ? 'dev' : 'short';

// Create a MongoStore instance with the appropriate options

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
app.use(cors({ credentials: true }));
app.use(express.json());
app.use(express.static('public'));

app.use('/api/auth', authRouter);

app.use((req, res) => {
  res.status(404).json({ message: 'Not found' });
});

app.use((err, req, res, next) => {
  const { status = 500, message = 'Server error' } = err;
  res.status(status).json({ message });
});

export default app;
