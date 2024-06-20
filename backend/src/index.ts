import express from 'express';
import bodyParser from 'body-parser';
import session from 'express-session';
import passport from 'passport';
import cors from 'cors';
import { authRouter } from './auth';
import { emailRouter } from './routes';

const app = express();

app.use(cors()); // Enable CORS
app.use(bodyParser.json());
app.use(session({ secret: 'your_secret_key', resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

app.use('/auth', authRouter);
app.use('/emails', emailRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
