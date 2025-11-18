import { Filter, X, Calendar } from 'lucide-react';
import { useFilters } from '../context/FilterContext';
import './GlobalFilters.css';

function GlobalFilters({ showMetric = true, showPeriod = true, showType = true }) {
  const {
    activityType,
    setActivityType,
    period,
    setPeriod,
    metric,
    setMetric,
    availableTypes,
    resetFilters
  } = useFilters();

  const periodOptions = [
    { value: '7', label: 'Ostatnie 7 dni' },
    { value: '30', label: 'Ostatnie 30 dni' },
    { value: '90', label: 'Ostatnie 3 miesiące' },
    { value: '180', label: 'Ostatnie 6 miesięcy' },
    { value: '365', label: 'Ostatni rok' },
    { value: 'all', label: 'Wszystkie dane' }
  ];

  const metricOptions = [
    { value: 'distance', label: 'Dystans' },
    { value: 'duration', label: 'Czas' },
    { value: 'averageSpeed', label: 'Średnia prędkość' },
    { value: 'averageHeartRate', label: 'Średnie tętno' },
    { value: 'elevationGain', label: 'Przewyższenie' },
    { value: 'calories', label: 'Kalorie' }
  ];

  const hasActiveFilters = activityType !== 'all' || period !== '30' || metric !== 'distance';

  return (
    <div className="global-filters">
      <div className="filters-header">
        <div className="filters-title">
          <Filter size={20} />
          <span>Filtry</span>
        </div>
        {hasActiveFilters && (
          <button className="reset-filters" onClick={resetFilters}>
            <X size={16} />
            Resetuj
          </button>
        )}
      </div>

      <div className="filters-content">
        {showType && (
          <div className="filter-group">
            <label htmlFor="activity-type">Typ aktywności</label>
            <select
              id="activity-type"
              value={activityType}
              onChange={(e) => setActivityType(e.target.value)}
              className="filter-select"
            >
              <option value="all">Wszystkie typy</option>
              {availableTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
        )}

        {showPeriod && (
          <div className="filter-group">
            <label htmlFor="period">
              <Calendar size={16} />
              Okres
            </label>
            <select
              id="period"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="filter-select"
            >
              {periodOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {showMetric && (
          <div className="filter-group">
            <label htmlFor="metric">Metryka</label>
            <select
              id="metric"
              value={metric}
              onChange={(e) => setMetric(e.target.value)}
              className="filter-select"
            >
              {metricOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {hasActiveFilters && (
        <div className="active-filters-summary">
          <span className="filters-count">
            {activityType !== 'all' && <span className="filter-badge">{activityType}</span>}
            {period !== '30' && <span className="filter-badge">{periodOptions.find(p => p.value === period)?.label}</span>}
            {metric !== 'distance' && <span className="filter-badge">{metricOptions.find(m => m.value === metric)?.label}</span>}
          </span>
        </div>
      )}
    </div>
  );
}

export default GlobalFilters;
