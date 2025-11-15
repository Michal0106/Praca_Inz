import axios from 'axios';

const STRAVA_API_BASE = 'https://www.strava.com/api/v3';
const STRAVA_OAUTH_BASE = 'https://www.strava.com/oauth';

class StravaService {
  async exchangeToken(code) {
    try {
      const response = await axios.post(`${STRAVA_OAUTH_BASE}/token`, {
        client_id: process.env.STRAVA_CLIENT_ID,
        client_secret: process.env.STRAVA_CLIENT_SECRET,
        code,
        grant_type: 'authorization_code'
      });
      
      return response.data;
    } catch (error) {
      console.error('Strava token exchange error:', error.response?.data || error.message);
      throw error;
    }
  }
  
  async refreshToken(refreshToken) {
    try {
      const response = await axios.post(`${STRAVA_OAUTH_BASE}/token`, {
        client_id: process.env.STRAVA_CLIENT_ID,
        client_secret: process.env.STRAVA_CLIENT_SECRET,
        refresh_token: refreshToken,
        grant_type: 'refresh_token'
      });
      
      return response.data;
    } catch (error) {
      console.error('Strava token refresh error:', error.response?.data || error.message);
      throw error;
    }
  }
  
  async getAthleteProfile(accessToken) {
    try {
      const response = await axios.get(`${STRAVA_API_BASE}/athlete`, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Strava get athlete error:', error.response?.data || error.message);
      throw error;
    }
  }
  
  async getActivities(accessToken, page = 1, perPage = 200) {
    try {
      const response = await axios.get(`${STRAVA_API_BASE}/athlete/activities`, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        },
        params: {
          page,
          per_page: perPage
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Strava get activities error:', error.response?.data || error.message);
      throw error;
    }
  }
  
  async getActivity(accessToken, activityId) {
    try {
      const response = await axios.get(`${STRAVA_API_BASE}/activities/${activityId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Strava get activity error:', error.response?.data || error.message);
      throw error;
    }
  }
}

export const stravaService = new StravaService();
