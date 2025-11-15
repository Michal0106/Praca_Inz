import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';
import AnalyticsPage from './pages/AnalyticsPage';
import DataPage from './pages/DataPage';
import TrainingPlanPage from './pages/TrainingPlanPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/data" element={<DataPage />} />
        <Route path="/training-plan" element={<TrainingPlanPage />} />
      </Routes>
    </Router>
  );
}

export default App;
