import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { RefreshCw, LogOut } from 'lucide-react';
import Layout from '../components/Layout';
import GlobalFilters from '../components/GlobalFilters';
import { useFilters } from '../context/FilterContext';
import { authAPI, activitiesAPI } from '../services/api';
import './DashboardPage.css';

function DashboardPage() {
  const [user, setUser] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { activityType, dateRange } = useFilters();

  useEffect(() => {
    fetchUserData();
    if (searchParams.get('auth') === 'success') {
      handleSync();
    }
  }, []);

  useEffect(() => {
    if (!loading) {
      fetchActivities();
    }
  }, [activityType, dateRange]);

  const fetchUserData = async () => {
    try {
      const { data } = await authAPI.getCurrentUser();
      setUser(data.user);
      
      await fetchActivities();
    } catch (error) {
      if (error.response?.status === 401) {
        navigate('/');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchActivities = async () => {
    try {
      const params = { limit: 50 };
      
      if (activityType !== 'all') {
        params.type = activityType;
      }
      
      if (dateRange.start) {
        params.startDate = dateRange.start.toISOString();
      }
      
      if (dateRange.end) {
        params.endDate = dateRange.end.toISOString();
      }
      
      const activitiesData = await activitiesAPI.getActivities(params);
      setActivities(activitiesData.data.activities);
    } catch (error) {
      console.error('Fetch activities error:', error);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      await activitiesAPI.syncActivities();
      await fetchUserData();
      alert('Dane zsynchronizowane pomyślnie!');
    } catch (error) {
      alert('Błąd podczas synchronizacji danych');
    } finally {
      setSyncing(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authAPI.logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (loading) {
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
            <h1>Panel główny</h1>
            <p className="user-email">{user?.email}</p>
          </div>
          <div className="header-actions">
            <button 
              className="sync-btn" 
              onClick={handleSync} 
              disabled={syncing}
            >
              <RefreshCw size={20} className={syncing ? 'spinning' : ''} />
              {syncing ? 'Synchronizacja...' : 'Synchronizuj dane'}
            </button>
            <button className="logout-btn" onClick={handleLogout}>
              <LogOut size={20} />
              Wyloguj
            </button>
          </div>
        </div>

        <GlobalFilters showMetric={false} />

        <div className="stats-grid">
          <div className="stat-card">
            <h3>Łączna liczba treningów</h3>
            <p className="stat-value">{user?.stats?.totalActivities || 0}</p>
          </div>
          <div className="stat-card">
            <h3>Całkowity dystans</h3>
            <p className="stat-value">
              {((user?.stats?.totalDistance || 0) / 1000).toFixed(1)} km
            </p>
          </div>
          <div className="stat-card">
            <h3>Całkowity czas</h3>
            <p className="stat-value">
              {Math.floor((user?.stats?.totalDuration || 0) / 3600)} godz.
            </p>
          </div>
          <div className="stat-card">
            <h3>Suma podejść</h3>
            <p className="stat-value">
              {(user?.stats?.totalElevationGain || 0).toFixed(0)} m
            </p>
          </div>
        </div>

        <div className="recent-activities">
          <h2>Ostatnie aktywności</h2>
          {activities.length === 0 ? (
            <p className="no-data">Brak aktywności. Kliknij "Synchronizuj dane" aby załadować treningi.</p>
          ) : (
            <div className="activities-list">
              {activities.map((activity) => (
                <div key={activity.id} className="activity-item">
                  <div className="activity-info">
                    <h4>{activity.name}</h4>
                    <p className="activity-type">{activity.type}</p>
                    <p className="activity-date">
                      {new Date(activity.startDate).toLocaleDateString('pl-PL')}
                    </p>
                  </div>
                  <div className="activity-stats">
                    <div className="activity-stat">
                      <span className="label">Dystans</span>
                      <span className="value">
                        {(activity.distance / 1000).toFixed(2)} km
                      </span>
                    </div>
                    <div className="activity-stat">
                      <span className="label">Czas</span>
                      <span className="value">
                        {Math.floor(activity.duration / 60)} min
                      </span>
                    </div>
                    {activity.averageHeartRate && (
                      <div className="activity-stat">
                        <span className="label">Śr. tętno</span>
                        <span className="value">
                          {activity.averageHeartRate} bpm
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

export default DashboardPage;
