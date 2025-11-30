import { createContext, useContext, useState, useEffect } from "react";
import { activitiesAPI } from "../services/api";

const FilterContext = createContext();

export const useFilters = () => {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error("useFilters must be used within FilterProvider");
  }
  return context;
};

export const FilterProvider = ({ children }) => {
  const [activityType, setActivityType] = useState("all");
  const [metric, setMetric] = useState("distance");
  const [availableTypes, setAvailableTypes] = useState([]);
  const [dateRange, setDateRange] = useState({
    start: null,
    end: null,
  });

  useEffect(() => {
    fetchActivityTypes();
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 30);
    setDateRange({ start, end });
  }, []);

  const fetchActivityTypes = async () => {
    try {
      const response = await activitiesAPI.getActivityTypes();
      setAvailableTypes(response.data.types || []);
    } catch (error) {
      console.error("Failed to fetch activity types:", error);
    }
  };

  const resetFilters = () => {
    setActivityType("all");
    setMetric("distance");
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 30);
    setDateRange({ start, end });
  };

  const getFilterParams = () => {
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

    params.metric = metric;

    return params;
  };

  const value = {
    activityType,
    setActivityType,
    metric,
    setMetric,
    dateRange,
    setDateRange,
    availableTypes,
    resetFilters,
    getFilterParams,
  };

  return (
    <FilterContext.Provider value={value}>{children}</FilterContext.Provider>
  );
};
