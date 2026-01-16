import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { RefreshCw, LogOut, Home } from "lucide-react";
import Layout from "../components/Layout";
import GlobalFilters from "../components/GlobalFilters";
import ActivityModal from "../components/ActivityModal";
import { useFilters } from "../context/FilterContext";
import { useAuth } from "../hooks/useAuth";
import { authAPI, activitiesAPI } from "../services/api";
import "./DashboardPage.css";
import {Flame} from "lucide-react";
import { goalsAPI } from "../services/api";

function DashboardPage() {
  const { isLoading: authLoading } = useAuth();
  const [user, setUser] = useState(null);
  const [activities, setActivities] = useState([]);
  const [filteredStats, setFilteredStats] = useState({
    totalActivities: 0,
    totalDistance: 0,
    totalDuration: 0,
    totalElevationGain: 0,
  });
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [activitiesPerPage] = useState(10);
  const navigate = useNavigate();
  const { activityType, dateRange } = useFilters();
  const params = new URLSearchParams(window.location.search);

if (params.get("auth") === "success") {
  const access = params.get("access");
  const refresh = params.get("refresh");

  if (access && refresh) {
      localStorage.setItem("accessToken", access);
      localStorage.setItem("refreshToken", refresh);
      window.location.replace("/dashboard");
  }
}

  useEffect(() => {
    fetchUserData();
  }, []);

  useEffect(() => {
    if (!loading) {
      fetchActivities();
      setCurrentPage(1); 
    }
  }, [activityType, dateRange?.start, dateRange?.end, loading]);

  const fetchUserData = async () => {
    try {
      const { data } = await authAPI.getCurrentUser();
      setUser(data.user);

      await fetchActivities();
      await fetchGoal();
    } catch (error) {
      if (error.response?.status === 401) {
        navigate("/");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchActivities = async () => {
    try {
      const params = { limit: 1000 }; 

      if (activityType !== "all") {
        params.type = activityType;
      }

      if (dateRange.start) {
        params.startDate = dateRange.start.toISOString();
      }

      if (dateRange.end) {
        params.endDate = dateRange.end.toISOString();
      }

      const activitiesData = await activitiesAPI.getActivities(params);
      const fetchedActivities = activitiesData.data.activities || [];
      
      setActivities(fetchedActivities);

      const stats = {
        totalActivities: fetchedActivities.length,
        totalDistance: fetchedActivities.reduce((sum, a) => sum + (a.distance || 0), 0),
        totalDuration: fetchedActivities.reduce((sum, a) => sum + (a.duration || 0), 0),
        totalElevationGain: fetchedActivities.reduce((sum, a) => sum + (a.elevationGain || 0), 0),
      };
      setFilteredStats(stats);
    } catch (error) {
      console.error("Fetch activities error:", error);
      setFilteredStats({
        totalActivities: 0,
        totalDistance: 0,
        totalDuration: 0,
        totalElevationGain: 0,
      });
    }
  };


  const [goalData, setGoalData] = useState(null);

  const fetchGoal = async () => {
    try {
      const { data } = await goalsAPI.getCurrent();
      setGoalData(data);
    } catch (e) {
    }
  };



  const goalUnit = (goal) => {
  if (!goal) return "";
  switch (goal.type) {
    case "DISTANCE_KM": return "km";
    case "DURATION_MIN": return "min";
    case "ELEVATION_M": return "m";
    case "ACTIVITIES_COUNT": return "treningów";
    default: return "";
    }
  };

  const goalLabel = (goal) => {
    if (!goal) return "";
    const period = goal.period === "WEEK" ? "w tym tygodniu" : "w tym miesiącu";
    switch (goal.type) {
      case "DISTANCE_KM": return `Dystans ${period}`;
      case "DURATION_MIN": return `Czas ${period}`;
      case "ELEVATION_M": return `Przewyższenie ${period}`;
      case "ACTIVITIES_COUNT": return `Liczba treningów ${period}`;
      default: return `Cel ${period}`;
    }
  };



  const handleSync = async () => {
    if (!user?.hasStravaData) {
      const confirmLink = confirm(
        "Aby synchronizować dane ze Stravą, musisz najpierw połączyć swoje konto.\n\n" +
          "Czy chcesz przejść do ustawień konta?",
      );
      if (confirmLink) {
        navigate("/account");
      }
      return;
    }

    setSyncing(true);
    try {
      const response = await activitiesAPI.syncActivities();
      
      await fetchUserData();
      
      let message = "Dane zsynchronizowane pomyślnie!";
      if (response.data.newActivitiesCount > 0) {
        message += `\n\nNowe aktywności: ${response.data.newActivitiesCount}`;
      }
      message += `\n\n💡 Aby pobrać szczegóły (best efforts, odcinki, GPS), kliknij na aktywność i użyj przycisku na dole.`;
      
      alert(message);
    } catch (error) {
      console.error("Sync error:", error);
      
      if (error.response?.status === 429) {
        const resetDate = error.response.data?.rateLimitReset;
        let message = "Osiągnięto limit zapytań do Strava API.\n\n";
        
        if (resetDate) {
          const resetTime = new Date(resetDate);
          const now = new Date();
          const minutesUntilReset = Math.ceil((resetTime - now) / 60000);
          
          if (minutesUntilReset > 0) {
            message += `Limit zostanie zresetowany za około ${minutesUntilReset} minut.\n\n`;
          }
        }
        
        message += "Strava API pozwala na:\n" +
                   "• 100 zapytań na 15 minut\n" +
                   "• 1000 zapytań dziennie\n\n" +
                   "Spróbuj ponownie później.";
        
        alert(message);
      } else if (error.response?.status === 401 || error.response?.data?.requiresStravaLink) {
        await fetchUserData();
        
        const confirmLink = confirm(
          "Twoje połączenie ze Stravą wygasło i wymaga ponownej autoryzacji.\n\n" +
            "Czy chcesz przejść do ustawień konta, aby połączyć się ponownie?",
        );
        if (confirmLink) {
          navigate("/account");
        }
      } else {
        alert(
          "Błąd podczas synchronizacji danych: " +
            (error.response?.data?.error || error.message),
        );
      }
    } finally {
      setSyncing(false);
    }
  };

  const handleActivityClick = async (activityId) => {
    try {
      const res = await activitiesAPI.getActivityById(activityId);
      setSelectedActivity(res.data.activity);
      setShowModal(true);
    } catch (error) {
      console.error("Fetch activity details error:", error);
    }
  };

  const handleRefreshActivity = async () => {
    if (selectedActivity) {
      try {
        const res = await activitiesAPI.getActivityById(selectedActivity.id);
        setSelectedActivity(res.data.activity);
      } catch (error) {
        console.error("Refresh activity error:", error);
      }
    }
  };

  const handleLogout = async () => {
    try {
      await authAPI.logout();
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const getActivityTypeColor = (type) => {
    const colors = {
      'Run': '#ff6b6b',
      'Ride': '#4ecdc4',
      'Swim': '#45b7d1',
      'Walk': '#96ceb4',
      'Hike': '#96d252ff',
      'VirtualRide': '#a29bfe',
      'VirtualRun': '#fd79a8',
      'Workout': '#ffc04cff',
      'WeightTraining': '#e17055',
      'Yoga': '#dfe6e9',
      'default': '#667eea'
    };
    return colors[type] || colors.default;
  };

  if (authLoading || loading) {
    return (
      <Layout>
        <div className="loading">Ładowanie...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="dashboard-page">
        <div className="dashboard-header">
          <div>
            <div className="dashboard-title-row">
              <Home size={32} className="dashboard-title-icon" />
              <h1 className="dashboard-title">Panel główny</h1>
            </div>
            
            <p className="user-email">
              {user?.email}
              {user?.hasStravaData && (
                <span
                  style={{
                    marginLeft: "10px",
                    color: "#fc5200",
                    fontSize: "0.9em",
                  }}
                >
                  Połączono ze Stravą
                </span>
              )}
            </p>
          </div>
          <div className="header-actions">
            <button
              className="sync-btn"
              onClick={handleSync}
              disabled={syncing}
              title="Synchronizuj aktywności, Best Efforts i Laps"
            >
              <RefreshCw size={20} className={syncing ? "spinning" : ""} />
              {syncing ? "Synchronizacja..." : "Synchronizuj dane"}
            </button>
            <button className="logout-btn" onClick={handleLogout}>
              <LogOut size={20} />
              Wyloguj
            </button>
          </div>
        </div>

        <div
          className={`goal-tile ${goalData?.goal ? "goal-active" : "goal-empty"}`}
          onClick={() => navigate("/goals")}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && navigate("/goals")}
        >
          <div className="goal-tile-left">
            <div className="goal-icon">
              <Flame size={26} />
            </div>
                    
            <div className="goal-text">
              <div className="goal-title">Cel i postęp</div>
                    
              {goalData?.goal ? (
                <div className="goal-sub">
                  {goalLabel(goalData.goal)} ·{" "}
                  <strong>
                    {goalData.progress.current} / {goalData.progress.target} {goalData.progress.unit}
                  </strong>
                </div>
              ) : (
                <div className="goal-sub muted">Nie ustawiono celu — kliknij, aby dodać</div>
              )}
            </div>
          </div>
            
          {goalData?.goal && (
            <div className="goal-right">
              <div className="goal-percent">{goalData.progress.percent}%</div>
              <div className="goal-bar">
                <div className="goal-bar-fill" style={{ width: `${goalData.progress.percent}%` }} />
              </div>
            </div>
          )}
        </div>


        <GlobalFilters showMetric={false} />

        <div className="stats-grid">
          <div className="stat-card">
            <h3>Łączna liczba treningów</h3>
            <p className="stat-value">{filteredStats?.totalActivities || 0}</p>
          </div>
          <div className="stat-card">
            <h3>Całkowity dystans</h3>
            <p className="stat-value">
              {((filteredStats?.totalDistance || 0) / 1000).toFixed(1)} km
            </p>
          </div>
          <div className="stat-card">
            <h3>Całkowity czas</h3>
            <p className="stat-value">
              {Math.floor((filteredStats?.totalDuration || 0) / 3600)} godz.{" "}
              {Math.floor(((filteredStats?.totalDuration || 0) % 3600) / 60)} min
            </p>
          </div>
          <div className="stat-card">
            <h3>Suma podejść</h3>
            <p className="stat-value">
              {(filteredStats?.totalElevationGain || 0).toFixed(0)} m
            </p>
          </div>
        </div>

        <div className="recent-activities">
          <h2>Ostatnie aktywności</h2>
          {activities.length === 0 ? (
            <p className="no-data">
              Brak aktywności. Kliknij "Synchronizuj dane" aby załadować
              treningi.
            </p>
          ) : (
            <>
              <div className="activities-list">
                {activities
                  .slice((currentPage - 1) * activitiesPerPage, currentPage * activitiesPerPage)
                  .map((activity) => (
                    <div 
                      key={activity.id} 
                      className="activity-item"
                      onClick={() => handleActivityClick(activity.id)}
                    >
                      <div className="activity-main">
                        <div className="activity-header">
                          <h4>{activity.name}</h4>
                          <span 
                            className="activity-type-badge"
                            style={{ backgroundColor: getActivityTypeColor(activity.type) }}
                          >
                            {activity.type}
                          </span>
                        </div>
                        <p className="activity-date">
                          {new Date(activity.startDate).toLocaleDateString("pl-PL", {
                            weekday: 'short',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                      <div className="activity-metrics">
                        <div className="metric-item">
                          <div className="metric-content">
                            <span className="metric-value">
                              {(activity.distance / 1000).toFixed(2)}
                            </span>
                            <span className="metric-label">km</span>
                          </div>
                        </div>
                        <div className="metric-item">
                          <div className="metric-content">
                            <span className="metric-value">
                              {Math.floor(activity.duration / 60)}
                            </span>
                            <span className="metric-label">min</span>
                          </div>
                        </div>
                        {activity.averageHeartRate && (
                          <div className="metric-item">
                            <div className="metric-content">
                              <span className="metric-value">
                                {activity.averageHeartRate}
                              </span>
                              <span className="metric-label">bpm</span>
                            </div>
                          </div>
                        )}
                        {activity.elevationGain > 0 && (
                          <div className="metric-item">
                            <div className="metric-content">
                              <span className="metric-value">
                                {Math.round(activity.elevationGain)}
                              </span>
                              <span className="metric-label">wznios</span>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="activity-arrow">→</div>
                    </div>
                  ))}
              </div>
              
              {activities.length > activitiesPerPage && (
                <div className="pagination">
                  <button
                    className="pagination-btn"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    Poprzednia
                  </button>
                  <span className="pagination-info">
                    Strona {currentPage} z {Math.ceil(activities.length / activitiesPerPage)}
                  </span>
                  <button
                    className="pagination-btn"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(activities.length / activitiesPerPage)))}
                    disabled={currentPage === Math.ceil(activities.length / activitiesPerPage)}
                  >
                    Następna
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {showModal && selectedActivity && (
          <ActivityModal
            activity={selectedActivity}
            onRefresh={handleRefreshActivity}
            onClose={() => setShowModal(false)}
          />
        )}
      </div>
    </Layout>
  );
}

export default DashboardPage;
