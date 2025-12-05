import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Link2,
  Unlink,
  RefreshCw,
  User,
  Mail,
  Calendar,
  CheckCircle,
} from "lucide-react";
import Layout from "../components/Layout";
import { useAuth } from "../hooks/useAuth";
import { authAPI, activitiesAPI } from "../services/api";
import "./AccountPage.css";

function AccountPage() {
  const { isLoading: authLoading } = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [linking, setLinking] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    fetchUserData();

    const stravaLinked = searchParams.get("strava") === "linked";
    const stravaError = searchParams.get("error");

    if (stravaLinked) {
      setShowSuccessMessage(true);
      setSearchParams({});
      setTimeout(() => setShowSuccessMessage(false), 5000);
      setTimeout(() => handleFirstSync(), 1500);
    }

    if (stravaError === "strava_already_linked") {
      alert(
        "To konto Strava jest już połączone z innym użytkownikiem.\n\n" +
          "Jeśli to Twoje konto, zaloguj się używając tego konta Strava lub odłącz je najpierw od starego konta.",
      );
      setSearchParams({});
    } else if (stravaError === "auth_failed") {
      alert(
        "Wystąpił błąd podczas łączenia z kontem Strava.\n\n" +
          "Spróbuj ponownie lub skontaktuj się z administratorem.",
      );
      setSearchParams({});
    }
  }, []);

  const fetchUserData = async () => {
    try {
      const { data } = await authAPI.getCurrentUser();
      setUser(data.user);
    } catch (error) {
      if (error.response?.status === 401) {
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLinkStrava = () => {
    setLinking(true);

    const accessToken = localStorage.getItem("accessToken");

    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3001/api";
    window.location.href = `${apiUrl}/auth/strava?mode=connect&token=${encodeURIComponent(accessToken)}`;
  };

  const handleFirstSync = async () => {
    setSyncing(true);
    try {
      console.log("Auto-sync po połączeniu ze Stravą...");
      const response = await activitiesAPI.syncActivities();
      console.log("Sync response:", response.data);
      await fetchUserData(); // Odśwież dane użytkownika
      alert(
        `Zsynchronizowano aktywności ze Stravą!\n\nNowe aktywności: ${response.data.newActivitiesCount}`,
      );
    } catch (error) {
      console.error("Auto-sync error:", error);
      alert(
        "Błąd podczas automatycznej synchronizacji. Możesz spróbować ręcznie z Dashboard.",
      );
    } finally {
      setSyncing(false);
    }
  };

  const handleUnlinkStrava = async () => {
    if (
      !confirm(
        "Czy na pewno chcesz odłączyć konto Strava? Utracisz dostęp do synchronizacji danych.",
      )
    ) {
      return;
    }

    try {
      await authAPI.unlinkStrava();
      await fetchUserData();
      alert("Konto Strava zostało odłączone pomyślnie.");
    } catch (error) {
      console.error("Unlink Strava error:", error);
      alert(
        "Błąd podczas odłączania konta Strava: " +
          (error.response?.data?.error || error.message),
      );
    }
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
      <div className="account-page">
        {syncing && (
          <div className="syncing-message">
            <RefreshCw size={24} className="spinning" />
            <div>
              <strong>Synchronizacja w toku...</strong>
              <p>Pobieranie aktywności ze Strava. To może potrwać chwilę.</p>
            </div>
          </div>
        )}

        {showSuccessMessage && (
          <div className="success-message">
            <CheckCircle size={24} />
            <div>
              <strong>Połączono pomyślnie!</strong>
              <p>
                Twoje konto Strava zostało połączone. Możesz teraz
                synchronizować aktywności.
              </p>
            </div>
          </div>
        )}

        <div className="account-header">
          <h1>Moje konto</h1>
          <p className="subtitle">Zarządzaj swoim kontem i połączeniami</p>
        </div>

        <div className="account-content">
          <div className="account-section">
            <h2>Informacje o koncie</h2>
            <div className="info-grid">
              {user?.email && (
                <div className="info-item">
                  <Mail size={20} />
                  <div>
                    <label>Email</label>
                    <p>{user.email}</p>
                  </div>
                </div>
              )}
              {user?.isStravaEmail && (
                <div className="info-item">
                  <Mail size={20} />
                  <div>
                    <label>Email</label>
                    <p className="text-muted">Zalogowano przez Strava</p>
                  </div>
                </div>
              )}
              {user?.firstName && (
                <div className="info-item">
                  <User size={20} />
                  <div>
                    <label>Imię i nazwisko</label>
                    <p>
                      {user.firstName} {user.lastName}
                    </p>
                  </div>
                </div>
              )}
              <div className="info-item">
                <Calendar size={20} />
                <div>
                  <label>Data utworzenia</label>
                  <p>
                    {new Date(user?.createdAt || Date.now()).toLocaleDateString(
                      "pl-PL",
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="account-section">
            <h2>Połączenia z aplikacjami</h2>

            <div className="connection-card">
              <div className="connection-header">
                <div className="connection-info">
                  <div className="connection-icon strava-icon">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169" />
                    </svg>
                  </div>
                  <div>
                    <h3>Strava</h3>
                    <p className="connection-description">
                      Synchronizuj aktywności, treningi i statystyki
                    </p>
                  </div>
                </div>
                <div className="connection-status">
                  {user?.hasStravaData ? (
                    <span className="status-badge connected">
                      <span className="status-dot"></span>
                      Połączone
                    </span>
                  ) : (
                    <span className="status-badge disconnected">
                      <span className="status-dot"></span>
                      Niepołączone
                    </span>
                  )}
                </div>
              </div>

              <div className="connection-actions">
                {user?.hasStravaData ? (
                  <>
                    <div className="connection-details">
                      <p> Twoje konto Strava jest połączone</p>
                      <p className="text-muted">
                        Możesz teraz synchronizować swoje aktywności z panelu
                        głównego
                      </p>
                    </div>
                    <button
                      className="btn-secondary"
                      onClick={handleUnlinkStrava}
                    >
                      <Unlink size={18} />
                      Odłącz konto Strava
                    </button>
                  </>
                ) : (
                  <>
                    <div className="connection-details">
                      <p>
                        {" "}
                        Połącz swoje konto Strava, aby synchronizować aktywności
                      </p>
                      <p className="text-muted">
                        Po połączeniu będziesz mógł automatycznie importować
                        wszystkie swoje treningi
                      </p>
                    </div>
                    <button
                      className="btn-primary"
                      onClick={handleLinkStrava}
                      disabled={linking}
                    >
                      <Link2 size={18} className={linking ? "spinning" : ""} />
                      {linking
                        ? "Przekierowywanie..."
                        : "Połącz z kontem Strava"}
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="connection-card disabled">
              <div className="connection-header">
                <div className="connection-info">
                  <div className="connection-icon garmin-icon">
                    <span>G</span>
                  </div>
                  <div>
                    <h3>Garmin Connect</h3>
                    <p className="connection-description">Wkrótce dostępne</p>
                  </div>
                </div>
                <div className="connection-status">
                  <span className="status-badge coming-soon">Wkrótce</span>
                </div>
              </div>
            </div>
          </div>

          {user?.stats && (
            <div className="account-section">
              <h2>Twoje statystyki</h2>
              <div className="stats-grid">
                <div className="stat-box">
                  <span className="stat-value">
                    {user.stats.totalActivities || 0}
                  </span>
                  <span className="stat-label">Aktywności</span>
                </div>
                <div className="stat-box">
                  <span className="stat-value">
                    {((user.stats.totalDistance || 0) / 1000).toFixed(0)} km
                  </span>
                  <span className="stat-label">Dystans</span>
                </div>
                <div className="stat-box">
                  <span className="stat-value">
                    {Math.floor((user.stats.totalDuration || 0) / 3600)} h
                  </span>
                  <span className="stat-label">Czas</span>
                </div>
                <div className="stat-box">
                  <span className="stat-value">
                    {(user.stats.totalElevationGain || 0).toFixed(0)} m
                  </span>
                  <span className="stat-label">Przewyższenie</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

export default AccountPage;
