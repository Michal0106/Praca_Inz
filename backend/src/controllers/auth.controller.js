import passport from '../config/passport.js';
import prisma from '../config/database.js';
import { stravaService } from '../services/strava.service.js';

export const stravaAuth = passport.authenticate('strava', { 
  scope: 'activity:read_all,profile:read_all'
});

export const stravaCallback = async (req, res) => {
  try {
    const { code } = req.query;
    
    const tokenData = await stravaService.exchangeToken(code);
    const athleteData = await stravaService.getAthleteProfile(tokenData.access_token);
    
    let user = await prisma.user.findUnique({
      where: { stravaId: athleteData.id.toString() }
    });
    
    if (!user) {
      user = await prisma.user.create({
        data: {
          stravaId: athleteData.id.toString(),
          email: athleteData.email,
          userStats: {
            create: {}
          }
        }
      });
    }
    
    req.session.userId = user.id;
    req.session.accessToken = tokenData.access_token;
    req.session.refreshToken = tokenData.refresh_token;
    req.session.source = 'STRAVA';
    
    res.redirect(`${process.env.CLIENT_URL}/dashboard?auth=success`);
  } catch (error) {
    console.error('Strava auth error:', error);
    res.redirect(`${process.env.CLIENT_URL}?auth=error`);
  }
};

export const garminAuth = (req, res) => {
  res.status(501).json({ 
    message: 'Garmin authentication not yet implemented',
    note: 'Garmin Connect API requires special partnership agreement'
  });
};

export const garminCallback = (req, res) => {
  res.status(501).json({ 
    message: 'Garmin authentication not yet implemented'
  });
};

export const logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to logout' });
    }
    res.json({ message: 'Logged out successfully' });
  });
};

export const getCurrentUser = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.session.userId },
      include: {
        userStats: true
      }
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ 
      user: {
        id: user.id,
        email: user.email,
        hasStravaData: !!user.stravaId,
        hasGarminData: !!user.garminId,
        stats: user.userStats
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user data' });
  }
};
