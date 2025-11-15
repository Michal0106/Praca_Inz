import passport from 'passport';
import { Strategy as OAuth2Strategy } from 'passport-oauth2';

const configurePassport = () => {
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser((id, done) => {
    done(null, { id });
  });

  const stravaClientId = process.env.STRAVA_CLIENT_ID;
  const stravaClientSecret = process.env.STRAVA_CLIENT_SECRET;
  const stravaCallbackUrl = process.env.STRAVA_CALLBACK_URL;

  if (!stravaClientId || !stravaClientSecret || !stravaCallbackUrl) {
    console.warn('Strava OAuth credentials not configured. Strava authentication will not be available.');
    return passport;
  }

  passport.use('strava', new OAuth2Strategy({
      authorizationURL: 'https://www.strava.com/oauth/authorize',
      tokenURL: 'https://www.strava.com/oauth/token',
      clientID: stravaClientId,
      clientSecret: stravaClientSecret,
      callbackURL: stravaCallbackUrl,
      scope: 'activity:read_all,profile:read_all'
    },
    (accessToken, refreshToken, profile, done) => {
      return done(null, { accessToken, refreshToken, source: 'STRAVA' });
    }
  ));

  return passport;
};

export default configurePassport();
