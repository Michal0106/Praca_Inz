import { X, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import "./ActivityModal.css";

function ActivityModal({ activity, onClose }) {
  const [showBestEfforts, setShowBestEfforts] = useState(false);
  const [showLaps, setShowLaps] = useState(false);
  const [selectedLap, setSelectedLap] = useState(null);

  if (!activity) return null;

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const formatDistance = (meters) => {
    return (meters / 1000).toFixed(2);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("pl-PL", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
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

  const hasBestEfforts = activity.bestEfforts && Array.isArray(activity.bestEfforts) && activity.bestEfforts.length > 0;
  const hasLaps = activity.laps && Array.isArray(activity.laps) && activity.laps.length > 0;

  const getPaceValue = (lap) => {
    if (!lap.distance || lap.distance === 0) return 0;
    const paceSecondsPerKm = (lap.elapsed_time / lap.distance) * 1000;
    return paceSecondsPerKm;
  };

  const paceValues = hasLaps ? activity.laps.map(lap => getPaceValue(lap)).filter(v => v > 0) : [];
  const maxPaceValue = paceValues.length > 0 ? Math.max(...paceValues) : 0;
  const minPaceValue = paceValues.length > 0 ? Math.min(...paceValues) : 0;
  const minLapDistance = hasLaps ? Math.min(...activity.laps.map(lap => lap.distance)) : 0;
  const maxLapDistance = hasLaps ? Math.max(...activity.laps.map(lap => lap.distance)) : 0;

  const handleLapClick = (lap, index) => {
    setSelectedLap(selectedLap === index ? null : index);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{activity.name || "Aktywność"}</h2>
          <button className="modal-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="modal-body">
          <div className="activity-stats-cards">
            <div className="stat-card-primary">
              <span className="stat-card-label">Dystans</span>
              <div className="stat-card-value-row">
                <span className="stat-card-value">{formatDistance(activity.distance || 0)}</span>
                <span className="stat-card-unit">km</span>
              </div>
            </div>

            <div className="stat-card-primary">
              <span className="stat-card-label">Czas</span>
              <span className="stat-card-value">{formatDuration(activity.duration || 0)}</span>
            </div>

            <div className="stat-card-primary">
              <span className="stat-card-label">Śr. prędkość</span>
              <div className="stat-card-value-row">
                <span className="stat-card-value">{((activity.averageSpeed || 0) * 3.6).toFixed(1)}</span>
                <span className="stat-card-unit">km/h</span>
              </div>
            </div>

            {activity.averageHeartRate && (
              <div className="stat-card-primary">
                <span className="stat-card-label">Śr. tętno</span>
                <div className="stat-card-value-row">
                  <span className="stat-card-value">{activity.averageHeartRate}</span>
                  <span className="stat-card-unit">bpm</span>
                </div>
              </div>
            )}
          </div>

          <div className="activity-info-row">
            <div className="info-item">
              <span className="info-label">Typ</span>
              <span 
                className="info-value activity-type-badge" 
                style={{ backgroundColor: getActivityTypeColor(activity.type) }}
              >
                {activity.type}
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">Data</span>
              <span className="info-value">{formatDate(activity.startDate)}</span>
            </div>
          </div>

          <div className="activity-secondary-stats">
            {activity.maxHeartRate && (
              <div className="secondary-stat">
                <span className="secondary-label">Max tętno</span>
                <span className="secondary-value">{activity.maxHeartRate} bpm</span>
              </div>
            )}

            <div className="secondary-stat">
              <span className="secondary-label">Max prędkość</span>
              <span className="secondary-value">{((activity.maxSpeed || 0) * 3.6).toFixed(1)} km/h</span>
            </div>

            {activity.elevationGain !== undefined && activity.elevationGain !== null && (
              <div className="secondary-stat">
                <span className="secondary-label">Przewyższenie</span>
                <span className="secondary-value">{activity.elevationGain} m</span>
              </div>
            )}

            {activity.calories && (
              <div className="secondary-stat">
                <span className="secondary-label">Kalorie</span>
                <span className="secondary-value">{activity.calories} kcal</span>
              </div>
            )}
          </div>

          {activity.description && (
            <div className="activity-description">
              <h3>Opis</h3>
              <p>{activity.description}</p>
            </div>
          )}

          {hasBestEfforts && (
            <div className="best-efforts-section">
              <button 
                className="best-efforts-toggle"
                onClick={() => setShowBestEfforts(!showBestEfforts)}
              >
                <h3>🏆 Najlepsze wyniki na tym treningu ({activity.bestEfforts.length})</h3>
                {showBestEfforts ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>
              
              {showBestEfforts && (
                <div className="best-efforts-list">
                  {activity.bestEfforts.map((effort, index) => (
                    <div key={index} className="effort-item">
                      <h4>{effort.name}</h4>
                      <div className="effort-stat">
                        <span className="label">Dystans</span>
                        <span className="value">{(effort.distance / 1000).toFixed(2)} km</span>
                      </div>
                      <div className="effort-stat">
                        <span className="label">Czas</span>
                        <span className="value">{formatEffortTime(effort.elapsed_time)}</span>
                      </div>
                      <div className="effort-stat">
                        <span className="label">Tempo</span>
                        <span className="value">{formatPace(effort.elapsed_time, effort.distance)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {hasLaps && (
            <div className="laps-section">
              <button 
                className="best-efforts-toggle"
                onClick={() => setShowLaps(!showLaps)}
              >
                <h3>Odcinki</h3>
                {showLaps ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>
              
              {showLaps && (
                <>
                  <div className="laps-chart">
                {activity.laps.map((lap, index) => {
                  const paceSecondsPerKm = getPaceValue(lap);
                  
                  let heightPercent = 100;
                  const paceRange = maxPaceValue - minPaceValue;
                  if (paceRange > 0) {
                    const normalized = (maxPaceValue - paceSecondsPerKm) / paceRange;
                    heightPercent =  normalized * 80 + 5;
                  }
                  
                  const totalDistance = activity.laps.reduce((sum, l) => sum + l.distance, 0);
                  const widthPercent = totalDistance > 0 ? (lap.distance / totalDistance) * 100 : 100 / activity.laps.length;
                  
                  const isSelected = selectedLap === index;
                  
                  return (
                    <div 
                      key={index} 
                      className="lap-chart-container"
                      style={{ width: `${widthPercent}%` }}
                    >
                      <div 
                        className={`lap-bar ${isSelected ? 'selected' : ''}`}
                        style={{ 
                          height: `${heightPercent}%`,
                          width: '100%'
                        }}
                        onClick={() => handleLapClick(lap, index)}
                        title={`Tempo: ${formatPace(lap.elapsed_time, lap.distance)}, Dystans: ${(lap.distance / 1000).toFixed(2)}km, Wysokość: ${heightPercent.toFixed(1)}%`}
                      />
                      <div className="lap-label">{index + 1}</div>
                    </div>
                  );
                })}
              </div>

              {selectedLap !== null && activity.laps[selectedLap] && (
                <div className="lap-details">
                  <div className="lap-details-header">
                    <h4>Odcinek {selectedLap + 1}</h4>
                    <button 
                      className="lap-close"
                      onClick={() => setSelectedLap(null)}
                    >✕</button>
                  </div>
                  <div className="lap-details-grid">
                    <div className="lap-detail-item">
                      <span className="label">Dystans</span>
                      <span className="value">{(activity.laps[selectedLap].distance / 1000).toFixed(2)} km</span>
                    </div>
                    <div className="lap-detail-item">
                      <span className="label">Czas</span>
                      <span className="value">{formatEffortTime(activity.laps[selectedLap].elapsed_time)}</span>
                    </div>
                    {activity.laps[selectedLap].moving_time && (
                      <div className="lap-detail-item">
                        <span className="label">Czas ruchu</span>
                        <span className="value">{formatEffortTime(activity.laps[selectedLap].moving_time)}</span>
                      </div>
                    )}
                    {activity.laps[selectedLap].average_speed && (
                      <div className="lap-detail-item">
                        <span className="label">Śr. prędkość</span>
                        <span className="value">{(activity.laps[selectedLap].average_speed * 3.6).toFixed(1)} km/h</span>
                      </div>
                    )}
                    {activity.laps[selectedLap].max_speed && (
                      <div className="lap-detail-item">
                        <span className="label">Max prędkość</span>
                        <span className="value">{(activity.laps[selectedLap].max_speed * 3.6).toFixed(1)} km/h</span>
                      </div>
                    )}
                    {activity.laps[selectedLap].average_heartrate && (
                      <div className="lap-detail-item">
                        <span className="label">Śr. tętno</span>
                        <span className="value">{activity.laps[selectedLap].average_heartrate} bpm</span>
                      </div>
                    )}
                    {activity.laps[selectedLap].max_heartrate && (
                      <div className="lap-detail-item">
                        <span className="label">Max tętno</span>
                        <span className="value">{activity.laps[selectedLap].max_heartrate} bpm</span>
                      </div>
                    )}
                    {activity.laps[selectedLap].average_watts && (
                      <div className="lap-detail-item">
                        <span className="label">Śr. moc</span>
                        <span className="value">{activity.laps[selectedLap].average_watts} W</span>
                      </div>
                    )}
                    {activity.laps[selectedLap].total_elevation_gain !== undefined && 
                     activity.laps[selectedLap].total_elevation_gain !== null && (
                      <div className="lap-detail-item">
                        <span className="label">Przewyższenie</span>
                        <span className="value">{activity.laps[selectedLap].total_elevation_gain} m</span>
                      </div>
                    )}
                    <div className="lap-detail-item">
                      <span className="label">Tempo</span>
                      <span className="value">{formatPace(activity.laps[selectedLap].elapsed_time, activity.laps[selectedLap].distance)}</span>
                    </div>
                  </div>
                </div>
              )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ActivityModal;
