import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Trophy, Calendar } from "lucide-react";
import Layout from "../components/Layout";
import GlobalFilters from "../components/GlobalFilters";
import ActivityModal from "../components/ActivityModal";
import { useFilters } from "../context/FilterContext";
import { dataAPI, activitiesAPI } from "../services/api";
import "./BestEffortsPage.css";

function BestEffortsPage() {
  const [bestEfforts, setBestEfforts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const navigate = useNavigate();
  const { activityType, dateRange } = useFilters();

  useEffect(() => {
    fetchBestEfforts();
  }, []);

  useEffect(() => {
    if (!loading) {
      fetchBestEfforts();
    }
  }, [activityType, dateRange?.start, dateRange?.end, loading]);

  const fetchBestEfforts = async () => {
    try {
      const params = {};
      
      if (activityType !== "all") {
        params.type = activityType;
      }
      
      if (dateRange.start) {
        params.startDate = dateRange.start.toISOString();
      }
      
      if (dateRange.end) {
        params.endDate = dateRange.end.toISOString();
      }

      const response = await dataAPI.getBestEfforts(params);
      setBestEfforts(response.data.bestEfforts || []);
    } catch (error) {
      if (error.response?.status === 401) {
        navigate("/");
      }
      console.error("Fetch best efforts error:", error);
    } finally {
      setLoading(false);
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

  const formatEffortTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}:${secs.toString().padStart(2, '0')}` : `${secs}s`;
  };

  const formatPace = (seconds, meters) => {
    if (!meters || meters === 0) return '-';
    const paceSecondsPerKm = (seconds / meters) * 1000;
    const mins = Math.floor(paceSecondsPerKm / 60);
    const secs = Math.floor(paceSecondsPerKm % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}/km`;
  };

  if (loading) {
    return (
      <Layout>
        <div className="loading">Ładowanie rekordów...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="best-efforts-page">
        <div className="page-header">
          <div className="header-title">
            <Trophy size={32} />
            <h1>Najlepsze Wyniki</h1>
          </div>
          <p className="page-description">
            Twoje rekordy na różnych dystansach ze wszystkich aktywności
          </p>
        </div>

        <GlobalFilters showMetric={false} />

        {bestEfforts.length === 0 ? (
          <div className="no-data-container">
            <Trophy size={64} className="no-data-icon" />
            <h3>Brak danych o najlepszych wynikach</h3>
            <p>
              Synchronizuj aktywności ze Stravą, aby zobaczyć swoje rekordy na różnych dystansach
            </p>
          </div>
        ) : (
          <div className="efforts-grid">
            {bestEfforts.map((effort, index) => (
              <div 
                key={index} 
                className="effort-record-card"
                onClick={() => effort.activityId && handleActivityClick(effort.activityId)}
              >
                <div className="effort-header">
                  <Trophy className="trophy-icon" size={24} />
                  <h3 className="effort-name">{effort.name}</h3>
                </div>
                
                <div className="effort-main">
                  <div className="effort-time-large">
                    {formatEffortTime(effort.elapsed_time)}
                  </div>
                  <div className="effort-pace-large">
                    {formatPace(effort.elapsed_time, effort.distance)}
                  </div>
                </div>

                <div className="effort-details">
                  <div className="effort-distance-info">
                    {(effort.distance / 1000).toFixed(2)} km
                  </div>
                  {effort.moving_time && effort.moving_time !== effort.elapsed_time && (
                    <div className="effort-moving-time">
                      Czas ruchu: {formatEffortTime(effort.moving_time)}
                    </div>
                  )}
                </div>

                {effort.activityName && (
                  <div className="effort-activity-info">
                    <Calendar size={14} />
                    <span className="activity-name">{effort.activityName}</span>
                  </div>
                )}

                {effort.activityDate && (
                  <div className="effort-date">
                    {new Date(effort.activityDate).toLocaleDateString("pl-PL", {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {showModal && (
          <ActivityModal
            activity={selectedActivity}
            onClose={() => {
              setShowModal(false);
              setSelectedActivity(null);
            }}
          />
        )}
      </div>
    </Layout>
  );
}

export default BestEffortsPage;
