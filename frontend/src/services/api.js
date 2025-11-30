import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3001/api",
  withCredentials: true,
});

const isTokenExpired = (token) => {
  if (!token) return true;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const expirationTime = payload.exp * 1000; 
    const currentTime = Date.now();
    
    return expirationTime < (currentTime + 5 * 60 * 1000);
  } catch (error) {
    return true;
  }
};

const refreshAccessToken = async () => {
  const refreshToken = localStorage.getItem("refreshToken");
  if (!refreshToken) {
    throw new Error("No refresh token");
  }

  const response = await axios.post(
    `${import.meta.env.VITE_API_URL || "http://localhost:3001/api"}/auth/refresh`,
    { refreshToken },
  );

  const { accessToken } = response.data;
  localStorage.setItem("accessToken", accessToken);
  return accessToken;
};

api.interceptors.request.use(
  async (config) => {
    let token = localStorage.getItem("accessToken");
    
    if (token && isTokenExpired(token)) {
      try {
        token = await refreshAccessToken();
      } catch (error) {
        console.error("Failed to refresh token:", error);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        window.location.href = "/login";
        return Promise.reject(error);
      }
    }
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const token = await refreshAccessToken();
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return api(originalRequest);
      } catch (refreshError) {
        console.error("Failed to refresh token on 401:", refreshError);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export const authAPI = {
  register: (data) => api.post("/auth/register", data),
  login: (data) => api.post("/auth/login", data),
  logout: () => {
    const refreshToken = localStorage.getItem("refreshToken");
    return api.post("/auth/logout", { refreshToken });
  },
  getCurrentUser: () => api.get("/auth/me"),
  refresh: (refreshToken) => api.post("/auth/refresh", { refreshToken }),
  unlinkStrava: () => api.post("/auth/strava/unlink"),
  initAuth: async () => {
    const token = localStorage.getItem("accessToken");
    const refreshToken = localStorage.getItem("refreshToken");
    
    if (!token && !refreshToken) {
      return false;
    }
    
    if (token && isTokenExpired(token)) {
      try {
        await refreshAccessToken();
      } catch (error) {
        console.error("Failed to refresh token on init:", error);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        return false;
      }
    }
    
    return true;
  },
};

export const activitiesAPI = {
  getActivities: (params) => api.get("/activities", { params }),
  getActivityById: (id) => api.get(`/activities/${id}`),
  getActivityTypes: () => api.get("/activities/types"),
  syncActivities: () => api.post("/activities/sync"),
  recalculatePaceData: () => api.post("/activities/recalculate-pace"),
};

export const analyticsAPI = {
  getDistribution: () => api.get("/analytics/distribution"),
  getWeeklyStats: (params) => api.get("/analytics/weekly-stats", { params }),
  getMonthlyTrends: (params) =>
    api.get("/analytics/monthly-trends", { params }),
  getIntensityDistribution: () => api.get("/analytics/intensity-distribution"),
  getProgress: (metric, period) =>
    api.get("/analytics/progress", { params: { metric, period } }),
  compareActivities: (firstId, secondId) =>
    api.get("/analytics/compare", { params: { firstId, secondId } }),
};

export const dataAPI = {
  getUserStats: () => api.get("/data/stats"),
  getLongestActivity: (metric, params) =>
    api.get("/data/longest-activity", { params: { metric, ...params } }),
  getHardestActivity: (params) =>
    api.get("/data/hardest-activity", { params }),
  getRecords: () => api.get("/data/records"),
  getAverages: (groupBy) => api.get("/data/averages", { params: { groupBy } }),
};

export const trainingPlanAPI = {
  getRecommended: () => api.get("/training-plan/recommend"),
  getTemplates: (params) => api.get("/training-plan/templates", { params }),
  getPlanById: (id) => api.get(`/training-plan/${id}`),
  getSessionById: (id) => api.get(`/training-plan/session/${id}`),
};

export default api;
