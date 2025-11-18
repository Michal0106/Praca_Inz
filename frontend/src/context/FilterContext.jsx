import { createContext, useContext, useState, useEffect } from 'react';
import { activitiesAPI } from '../services/api';

const FilterContext = createContext();

export const useFilters = () => {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error('useFilters must be used within FilterProvider');
  }
  return context;
};

export const FilterProvider = ({ children }) => {
  const [activityType, setActivityType] = useState('all');
  const [period, setPeriod] = useState('30'); // dni
  const [metric, setMetric] = useState('distance');
  const [availableTypes, setAvailableTypes] = useState([]);
  const [dateRange, setDateRange] = useState({
    start: null,
    end: null
  });

  // Pobierz dostępne typy aktywności
  useEffect(() => {
    fetchActivityTypes();
  }, []);

  const fetchActivityTypes = async () => {
    try {
      const response = await activitiesAPI.getActivityTypes();
      setAvailableTypes(response.data.types || []);
    } catch (error) {
      console.error('Failed to fetch activity types:', error);
    }
  };

  // Oblicz zakres dat na podstawie okresu
  useEffect(() => {
    if (period === 'custom') return;
    
    const end = new Date();
    const start = new Date();
    
    if (period === '7') {
      start.setDate(start.getDate() - 7);
    } else if (period === '30') {
      start.setDate(start.getDate() - 30);
    } else if (period === '90') {
      start.setDate(start.getDate() - 90);
    } else if (period === '180') {
      start.setDate(start.getDate() - 180);
    } else if (period === '365') {
      start.setDate(start.getDate() - 365);
    } else if (period === 'all') {
      start.setFullYear(2000); // Wszystkie dane
    }
    
    setDateRange({ start, end });
  }, [period]);

  const resetFilters = () => {
    setActivityType('all');
    setPeriod('30');
    setMetric('distance');
    setDateRange({ start: null, end: null });
  };

  const getFilterParams = () => {
    const params = {};
    
    if (activityType !== 'all') {
      params.type = activityType;
    }
    
    if (dateRange.start) {
      params.startDate = dateRange.start.toISOString();
    }
    
    if (dateRange.end) {
      params.endDate = dateRange.end.toISOString();
    }
    
    params.metric = metric;
    params.period = period;
    
    return params;
  };

  const value = {
    activityType,
    setActivityType,
    period,
    setPeriod,
    metric,
    setMetric,
    dateRange,
    setDateRange,
    availableTypes,
    resetFilters,
    getFilterParams
  };

  return (
    <FilterContext.Provider value={value}>
      {children}
    </FilterContext.Provider>
  );
};
