import { X, Clock, Target, Activity } from "lucide-react";
import "./SessionModal.css";

function SessionModal({ session, intervals, onClose }) {
  if (!session) return null;

  let parsedIntervals = null;
  try {
    if (typeof session.intervals === 'string') {
      parsedIntervals = JSON.parse(session.intervals);
    } else if (session.intervals && typeof session.intervals === 'object') {
      parsedIntervals = session.intervals;
    } else if (intervals) {
      parsedIntervals = intervals;
    }
  } catch (e) {
    console.error('Error parsing intervals:', e);
    parsedIntervals = null;
  }

  const formatDuration = (value, isMinutes = true) => {
    if (!value || value === 0) return "Brak danych";
    
    const minutes = isMinutes ? value : Math.round(value / 60);
    
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins} min`;
  };

  const getIntensityColor = (intensity) => {
    switch (intensity) {
      case "EASY":
        return "#10b981";
      case "MODERATE":
        return "#f59e0b";
      case "HARD":
        return "#ef4444";
      case "VERY_HARD":
        return "#dc2626";
      default:
        return "#6b7280";
    }
  };

  const getIntensityLabel = (intensity) => {
    if (!intensity) return "Brak danych";
    const intensityUpper = intensity.toUpperCase();
    switch (intensityUpper) {
      case "EASY":
        return "Łatwa";
      case "MODERATE":
        return "Umiarkowana";
      case "HARD":
        return "Ciężka";
      case "VERY_HARD":
      case "VERY HARD":
        return "Bardzo ciężka";
      default:
        return intensity;
    }
  };

  const getTypeLabel = (type) => {
    if (!type) return "Trening";
    const typeUpper = type.toUpperCase();
    switch (typeUpper) {
      case "EASY_RUN":
        return "Bieg regeneracyjny";
      case "LONG_RUN":
        return "Bieg długi";
      case "TEMPO_RUN":
        return "Bieg tempo";
      case "INTERVAL":
      case "INTERVALS":
        return "Interwały";
      case "RECOVERY":
        return "Regeneracja";
      case "STRENGTH":
        return "Siłowy";
      case "CROSS_TRAINING":
        return "Trening krzyżowy";
      case "REST":
        return "Odpoczynek";
      case "RACE_PACE":
        return "Tempo wyścigowe";
      case "FARTLEK":
        return "Fartlek";
      default:
        return type.replace(/_/g, " ");
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content session-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>{session.name || getTypeLabel(session.workoutType || session.sessionType)}</h2>
          <button className="modal-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="modal-body">
          <div className="session-summary">
            <div className="summary-item">
              <Clock size={20} />
              <div>
                <div className="summary-label">Czas trwania</div>
                <div className="summary-value">
                  {session.targetDuration 
                    ? formatDuration(session.targetDuration, true)
                    : formatDuration(session.duration, false)}
                </div>
              </div>
            </div>

            {(session.targetDistance || session.distance) && (
              <div className="summary-item">
                <Target size={20} />
                <div>
                  <div className="summary-label">Dystans</div>
                  <div className="summary-value">
                    {session.targetDistance 
                      ? session.targetDistance.toFixed(1) 
                      : (session.distance / 1000).toFixed(1)} km
                  </div>
                </div>
              </div>
            )}

            {session.targetPace && (
              <div className="summary-item">
                <Activity size={20} />
                <div>
                  <div className="summary-label">Tempo docelowe</div>
                  <div className="summary-value">{session.targetPace}</div>
                </div>
              </div>
            )}

            <div className="summary-item">
              <Activity size={20} />
              <div>
                <div className="summary-label">Intensywność</div>
                <div className="summary-value">
                  <span
                    className="intensity-badge"
                    style={{
                      backgroundColor: getIntensityColor(session.intensity),
                    }}
                  >
                    {getIntensityLabel(session.intensity)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {session.description && (
            <div className="session-description">
              <h3>Opis treningu</h3>
              <p>{session.description}</p>
            </div>
          )}

          {parsedIntervals && (
            <div className="interval-details">
              <h3>Struktura treningu interwałowego</h3>
              <div className="interval-sequence">
                {parsedIntervals.warmup && (
                  <div className="interval-phase warmup">
                    <div className="phase-content">
                      <div className="phase-label">Rozgrzewka</div>
                      <div className="phase-value">{parsedIntervals.warmup}</div>
                    </div>
                  </div>
                )}
                {parsedIntervals.intervals && (
                  <div className="interval-phase main-work">
                    <div className="phase-content">
                      <div className="phase-label">Część główna</div>
                      <div className="phase-value">{parsedIntervals.intervals}</div>
                      {parsedIntervals.recovery && (
                        <div className="phase-recovery">
                          <span className="recovery-text">{parsedIntervals.recovery}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                {parsedIntervals.cooldown && (
                  <div className="interval-phase cooldown">
                    <div className="phase-content">
                      <div className="phase-label">Wyciszenie</div>
                      <div className="phase-value">{parsedIntervals.cooldown}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {session.targetHeartRateZone && (
            <div className="heart-rate-zone">
              <h3>Strefa tętna</h3>
              <p className="zone-text">{session.targetHeartRateZone}</p>
            </div>
          )}

          <div className="session-notes">
            <h3>Wskazówki</h3>
            <ul>
              {(session.sessionType === "EASY_RUN" || session.workoutType === "EASY_RUN") && (
                <>
                  <li>
                    Utrzymuj komfortowe tempo, przy którym możesz swobodnie
                    rozmawiać
                  </li>
                  <li>Skup się na technice biegu i relaksacji</li>
                </>
              )}
              {(session.sessionType === "LONG_RUN" || session.workoutType === "LONG_RUN") && (
                <>
                  <li>
                    Rozpocznij w wolnym tempie i stopniowo zwiększaj
                    intensywność
                  </li>
                  <li>Pamiętaj o regularnym nawadnianiu</li>
                </>
              )}
              {(session.sessionType === "INTERVAL" || session.sessionType === "INTERVALS" || 
                session.workoutType === "INTERVALS") && (
                <>
                  <li>Rozgrzewka 10-15 minut w łatwym tempie</li>
                  <li>
                    Przerwy między interwałami: aktywny odpoczynek (trucht)
                  </li>
                  <li>Zakończ 10-minutową rozciągką</li>
                </>
              )}
              {(session.sessionType === "RECOVERY" || session.workoutType === "RECOVERY") && (
                <>
                  <li>
                    To trening regeneracyjny - priorytetem jest odpoczynek
                  </li>
                  <li>Możesz wykonać lekki stretching lub spacer</li>
                </>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SessionModal;
