import { X } from 'lucide-react';
import './ActivityModal.css';

function ActivityModal({ activity, onClose }) {
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
    return new Date(dateString).toLocaleDateString('pl-PL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{activity.name || 'Aktywność'}</h2>
          <button className="modal-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>
        
        <div className="modal-body">
          <div className="activity-detail-grid">
            <div className="detail-item">
              <span className="detail-label">Typ</span>
              <span className="detail-value">{activity.type}</span>
            </div>
            
            <div className="detail-item">
              <span className="detail-label">Data</span>
              <span className="detail-value">{formatDate(activity.startDate)}</span>
            </div>
            
            <div className="detail-item">
              <span className="detail-label">Dystans</span>
              <span className="detail-value">{formatDistance(activity.distance || 0)} km</span>
            </div>
            
            <div className="detail-item">
              <span className="detail-label">Czas</span>
              <span className="detail-value">{formatDuration(activity.duration || 0)}</span>
            </div>
            
            {activity.averageHeartRate && (
              <div className="detail-item">
                <span className="detail-label">Śr. tętno</span>
                <span className="detail-value">{activity.averageHeartRate} bpm</span>
              </div>
            )}
            
            {activity.maxHeartRate && (
              <div className="detail-item">
                <span className="detail-label">Max tętno</span>
                <span className="detail-value">{activity.maxHeartRate} bpm</span>
              </div>
            )}
            
            {activity.averageSpeed && (
              <div className="detail-item">
                <span className="detail-label">Śr. prędkość</span>
                <span className="detail-value">{(activity.averageSpeed * 3.6).toFixed(1)} km/h</span>
              </div>
            )}
            
            {activity.maxSpeed && (
              <div className="detail-item">
                <span className="detail-label">Max prędkość</span>
                <span className="detail-value">{(activity.maxSpeed * 3.6).toFixed(1)} km/h</span>
              </div>
            )}
            
            {activity.elevationGain && (
              <div className="detail-item">
                <span className="detail-label">Przewyższenie</span>
                <span className="detail-value">{activity.elevationGain} m</span>
              </div>
            )}
            
            {activity.calories && (
              <div className="detail-item">
                <span className="detail-label">Kalorie</span>
                <span className="detail-value">{activity.calories} kcal</span>
              </div>
            )}
          </div>
          
          {activity.description && (
            <div className="activity-description">
              <h3>Opis</h3>
              <p>{activity.description}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ActivityModal;
