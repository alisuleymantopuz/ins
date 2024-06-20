import express from 'express';
import passport from 'passport';
import { Strategy as OAuth2Strategy } from 'passport-oauth2';
import axios from 'axios';

const authRouter = express.Router();

passport.use(new OAuth2Strategy({
  authorizationURL: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
  tokenURL: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
  clientID: process.env.OUTLOOK_CLIENT_ID!,
  clientSecret: process.env.OUTLOOK_CLIENT_SECRET!,
  callbackURL: 'http://localhost:3000/auth/callback',
  scope: ['openid', 'profile', 'User.Read', 'Mail.Read']
}, async (accessToken: string, refreshToken: string, profile: any, done: (error: any, user?: any) => void) => {
  try {
    const response = await axios.get('https://graph.microsoft.com/v1.0/me', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    const user = { accessToken, userId: response.data.id, email: response.data.mail };
    return done(null, user);
  } catch (error) {
    return done(error);
  }
}));

passport.serializeUser((user: any, done) => {
  done(null, user);
});

passport.deserializeUser((obj: any, done) => {
  done(null, obj);
});

authRouter.get('/outlook', passport.authenticate('oauth2'));

authRouter.get('/callback',
  passport.authenticate('oauth2', { failureRedirect: '/' }),
  (req, res) => {
    // Successful authentication, redirect home with token and userId
    const { accessToken, userId } = req.user as any;
    res.redirect(`http://localhost:3001/?token=${accessToken}&userId=${userId}`);
  }
);

export { authRouter };
