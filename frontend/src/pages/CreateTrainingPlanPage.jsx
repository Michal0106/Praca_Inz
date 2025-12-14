import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Loader, TrendingUp, Calendar, Target } from "lucide-react";
import Layout from "../components/Layout";
import { trainingPlanAPI } from "../services/api";
import "./CreateTrainingPlanPage.css";

function CreateTrainingPlanPage() {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [generatingProgress, setGeneratingProgress] = useState(0);
  const [generatingMessage, setGeneratingMessage] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    goal: "",
    targetRaceDate: "",
    targetRaceDistance: "5000",
    targetRaceTime: "",
    weeksCount: 4, 
    sessionsPerWeek: 4,
    trainingDays: [1, 3, 5, 6], 
    currentFitnessLevel: "INTERMEDIATE",
    best400m: "",
    best1km: "",
    best5k: "",
    best10k: "",
    bestHalfMarathon: "",
  });

  const daysOfWeek = [
    { value: 1, label: "Pn" },
    { value: 2, label: "Wt" },
    { value: 3, label: "Śr" },
    { value: 4, label: "Czw" },
    { value: 5, label: "Pt" },
    { value: 6, label: "Sob" },
    { value: 7, label: "Nd" },
  ];

  const raceDistances = [
    { value: "5000", label: "5 km" },
    { value: "10000", label: "10 km" },
    { value: "21097", label: "Półmaraton" },
    { value: "42195", label: "Maraton" },
  ];

  const fitnessLevels = [
    { value: "BEGINNER", label: "Początkujący" },
    { value: "INTERMEDIATE", label: "Średniozaawansowany" },
    { value: "ADVANCED", label: "Zaawansowany" },
    { value: "ELITE", label: "Elita" },
  ];

  useEffect(() => {
    fetchAnalysis();
  }, []);

  const fetchAnalysis = async () => {
    try {
      setError(null);
      const res = await trainingPlanAPI.analyzeTraining();
      setAnalysis(res.data);
      
      if (res.data.bestEfforts) {
        setFormData(prev => ({
          ...prev,
          best400m: res.data.bestEfforts.best400m ? formatTimeForInput(res.data.bestEfforts.best400m) : prev.best400m,
          best1km: res.data.bestEfforts.best1km ? formatTimeForInput(res.data.bestEfforts.best1km) : prev.best1km,
          best5k: res.data.bestEfforts.best5k ? formatTimeForInput(res.data.bestEfforts.best5k) : prev.best5k,
          best10k: res.data.bestEfforts.best10k ? formatTimeForInput(res.data.bestEfforts.best10k) : prev.best10k,
          bestHalfMarathon: res.data.bestEfforts.bestHalfMarathon ? formatTimeForInput(res.data.bestEfforts.bestHalfMarathon) : prev.bestHalfMarathon,
        }));
      }
    } catch (error) {
      if (error.response?.status === 401) {
        navigate("/");
        return;
      }
      console.error("Fetch analysis error:", error);
      setError(
        "Błąd podczas analizy danych treningowych. Upewnij się, że masz zsynchronizowane aktywności ze Strava."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const toggleTrainingDay = (day) => {
    setFormData((prev) => {
      const days = prev.trainingDays.includes(day)
        ? prev.trainingDays.filter((d) => d !== day)
        : [...prev.trainingDays, day].sort((a, b) => a - b);

      return {
        ...prev,
        trainingDays: days,
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.sessionsPerWeek > formData.trainingDays.length) {
      alert(
        "Liczba treningów w tygodniu nie może być większa niż liczba wybranych dni treningowych"
      );
      return;
    }

    if (!formData.goal.trim()) {
      alert("Wpisz swój cel treningowy");
      return;
    }

    if (!formData.targetRaceDate) {
      alert("Wybierz datę docelowego biegu");
      return;
    }

    setGenerating(true);
    setError(null);
    setGeneratingProgress(0);
    setGeneratingMessage('Rozpoczynanie...');

    try {
      const payload = {
        goal: formData.goal,
        targetRaceDate: formData.targetRaceDate,
        targetRaceDistance: parseInt(formData.targetRaceDistance),
        targetRaceTime: formData.targetRaceTime || null,
        weeksCount: parseInt(formData.weeksCount),
        sessionsPerWeek: parseInt(formData.sessionsPerWeek),
        trainingDays: formData.trainingDays,
        currentFitnessLevel: formData.currentFitnessLevel,
        userBestEfforts: {
          best400m: parseTimeInput(formData.best400m),
          best1km: parseTimeInput(formData.best1km),
          best5k: parseTimeInput(formData.best5k),
          best10k: parseTimeInput(formData.best10k),
          bestHalfMarathon: parseTimeInput(formData.bestHalfMarathon),
        },
      };

      console.log('Generowanie planu treningowego z postępem...');
      
      const plan = await trainingPlanAPI.generatePlanSSE(payload, (progress, message) => {
        setGeneratingProgress(progress);
        setGeneratingMessage(message);
        console.log(`Progress: ${progress}% - ${message}`);
      });
      
      navigate(`/training-plans/${plan.id}`);
    } catch (error) {
      console.error("Generate plan error:", error);
      
      let errorMessage = "Błąd podczas generowania planu. Spróbuj ponownie.";
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
    } finally {
      setGenerating(false);
      setGeneratingProgress(0);
      setGeneratingMessage('');
    }
  };

  const formatPace = (seconds) => {
    if (!seconds) return "-";
    const mins = Math.floor(seconds / 60);
    const secs = Math.round(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatTimeForInput = (seconds) => {
    if (!seconds) return "";
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.round(seconds % 60);
    
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const parseTimeInput = (timeStr) => {
    if (!timeStr) return null;
    const parts = timeStr.split(':').map(p => parseInt(p) || 0);
    if (parts.length === 3) {
      return parts[0] * 3600 + parts[1] * 60 + parts[2];
    } else if (parts.length === 2) {
      return parts[0] * 60 + parts[1];
    }
    return null;
  };

  if (loading) {
    return (
      <Layout>
        <div className="create-plan-page">
          <div className="loading">Analizowanie danych treningowych...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="create-plan-page">
        <button className="back-btn" onClick={() => navigate("/training-plans")}>
          <ArrowLeft size={20} />
          Powrót do planów
        </button>

        <div className="page-header">
          <h1>Wygeneruj plan treningowy</h1>
          <p className="subtitle">
            Spersonalizowany plan oparty na Twoich danych ze Strava i metodyce
            Jacka Danielsa
          </p>
        </div>

        {error && <div className="error-message">{error}</div>}

        {analysis && (
          <div className="analysis-section">
            <h2>Twoja aktualna forma (ostatnie 12 tygodni)</h2>
            <div className="analysis-stats">
              <div className="stat-item">
                <span className="stat-label">Śr. dystans tygodniowo</span>
                <span className="stat-value">
                  {analysis.avgWeeklyDistance?.toFixed(1) || "0.0"} km
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Liczba treningów</span>
                <span className="stat-value">{analysis.totalActivities || 0}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Śr. tempo</span>
                <span className="stat-value">
                  {formatPace(analysis.avgPace)}
                </span>
              </div>
            </div>
            
            <h3 style={{ marginTop: '2rem', marginBottom: '1rem' }}>Twoje rekordy osobiste</h3>
            <div className="analysis-stats">
              {analysis.bestEfforts?.best400m && (
                <div className="stat-item">
                  <span className="stat-label">Najlepsze 400m</span>
                  <span className="stat-value">
                    {Math.floor(analysis.bestEfforts.best400m / 60)}:
                    {Math.round(analysis.bestEfforts.best400m % 60)
                      .toString()
                      .padStart(2, "0")}
                  </span>
                </div>
              )}
              {analysis.bestEfforts?.best1km && (
                <div className="stat-item">
                  <span className="stat-label">Najlepsze 1 km</span>
                  <span className="stat-value">
                    {Math.floor(analysis.bestEfforts.best1km / 60)}:
                    {Math.round(analysis.bestEfforts.best1km % 60)
                      .toString()
                      .padStart(2, "0")}
                  </span>
                </div>
              )}
              {analysis.bestEfforts?.best5k && (
                <div className="stat-item">
                  <span className="stat-label">Najlepsze 5 km</span>
                  <span className="stat-value">
                    {Math.floor(analysis.bestEfforts.best5k / 60)}:
                    {Math.round(analysis.bestEfforts.best5k % 60)
                      .toString()
                      .padStart(2, "0")}
                  </span>
                </div>
              )}
              {analysis.bestEfforts?.best10k && (
                <div className="stat-item">
                  <span className="stat-label">Najlepsze 10 km</span>
                  <span className="stat-value">
                    {Math.floor(analysis.bestEfforts.best10k / 60)}:
                    {Math.round(analysis.bestEfforts.best10k % 60)
                      .toString()
                      .padStart(2, "0")}
                  </span>
                </div>
              )}
              {analysis.bestEfforts?.bestHalfMarathon && (
                <div className="stat-item">
                  <span className="stat-label">Najlepszy półmaraton</span>
                  <span className="stat-value">
                    {Math.floor(analysis.bestEfforts.bestHalfMarathon / 3600)}:
                    {Math.floor((analysis.bestEfforts.bestHalfMarathon % 3600) / 60)
                      .toString()
                      .padStart(2, "0")}:
                    {Math.round(analysis.bestEfforts.bestHalfMarathon % 60)
                      .toString()
                      .padStart(2, "0")}
                  </span>
                </div>
              )}
            </div>
            
            {(!analysis.bestEfforts?.best5k || !analysis.bestEfforts?.best10k) && (
              <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#666' }}>
                💡 Wskazówka: Jeśli nie masz niektórych rekordów w systemie, możesz wpisać szacowane czasy w formularzu poniżej.
              </p>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-section">
            <h3>Rekordy osobiste (opcjonalne)</h3>
            <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '1rem' }}>
              Uzupełnij swoje najlepsze czasy. Jeśli masz dane ze Strava, zostaną automatycznie wypełnione. 
              Możesz je edytować lub dodać brakujące. Format: MM:SS lub HH:MM:SS
            </p>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="best400m">Najlepszy czas na 400m</label>
                <input
                  type="text"
                  id="best400m"
                  name="best400m"
                  value={formData.best400m}
                  onChange={handleInputChange}
                  placeholder="np. 1:30"
                  pattern="([0-9]{1,2}:)?[0-9]{1,2}:[0-9]{2}"
                />
              </div>

              <div className="form-group">
                <label htmlFor="best1km">Najlepszy czas na 1 km</label>
                <input
                  type="text"
                  id="best1km"
                  name="best1km"
                  value={formData.best1km}
                  onChange={handleInputChange}
                  placeholder="np. 4:30"
                  pattern="([0-9]{1,2}:)?[0-9]{1,2}:[0-9]{2}"
                />
              </div>

              <div className="form-group">
                <label htmlFor="best5k">Najlepszy czas na 5 km</label>
                <input
                  type="text"
                  id="best5k"
                  name="best5k"
                  value={formData.best5k}
                  onChange={handleInputChange}
                  placeholder="np. 25:00"
                  pattern="([0-9]{1,2}:)?[0-9]{1,2}:[0-9]{2}"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="best10k">Najlepszy czas na 10 km</label>
                <input
                  type="text"
                  id="best10k"
                  name="best10k"
                  value={formData.best10k}
                  onChange={handleInputChange}
                  placeholder="np. 52:00"
                  pattern="([0-9]{1,2}:)?[0-9]{1,2}:[0-9]{2}"
                />
              </div>

              <div className="form-group">
                <label htmlFor="bestHalfMarathon">Najlepszy czas na półmaraton</label>
                <input
                  type="text"
                  id="bestHalfMarathon"
                  name="bestHalfMarathon"
                  value={formData.bestHalfMarathon}
                  onChange={handleInputChange}
                  placeholder="np. 1:45:00"
                  pattern="([0-9]{1,2}:)?[0-9]{1,2}:[0-9]{2}"
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Cel treningowy</h3>
            <div className="form-group">
              <label htmlFor="goal">
                Opisz swój cel (np. "Ukończyć maraton poniżej 4 godzin")
              </label>
              <textarea
                id="goal"
                name="goal"
                value={formData.goal}
                onChange={handleInputChange}
                placeholder="Wpisz swój cel treningowy..."
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="targetRaceDistance">Dystans docelowy</label>
                <select
                  id="targetRaceDistance"
                  name="targetRaceDistance"
                  value={formData.targetRaceDistance}
                  onChange={handleInputChange}
                >
                  {raceDistances.map((dist) => (
                    <option key={dist.value} value={dist.value}>
                      {dist.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="targetRaceDate">Data docelowego biegu</label>
                <input
                  type="date"
                  id="targetRaceDate"
                  name="targetRaceDate"
                  value={formData.targetRaceDate}
                  onChange={handleInputChange}
                  min={new Date().toISOString().split("T")[0]}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="targetRaceTime">
                  Docelowy czas (opcjonalnie, np. 03:30:00)
                </label>
                <input
                  type="text"
                  id="targetRaceTime"
                  name="targetRaceTime"
                  value={formData.targetRaceTime}
                  onChange={handleInputChange}
                  placeholder="HH:MM:SS"
                  pattern="[0-9]{2}:[0-9]{2}:[0-9]{2}"
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Parametry planu</h3>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="weeksCount">
                  Liczba tygodni ({formData.weeksCount})
                </label>
                <input
                  type="range"
                  id="weeksCount"
                  name="weeksCount"
                  min="4"
                  max="24"
                  value={formData.weeksCount}
                  onChange={handleInputChange}
                />
                <small className="form-hint">
                  Zalecane: 4-8 tygodni (szybsze generowanie). Dłuższe plany mogą trwać kilka minut.
                </small>
              </div>

              <div className="form-group">
                <label htmlFor="sessionsPerWeek">
                  Treningów w tygodniu ({formData.sessionsPerWeek})
                </label>
                <input
                  type="range"
                  id="sessionsPerWeek"
                  name="sessionsPerWeek"
                  min="3"
                  max="7"
                  value={formData.sessionsPerWeek}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="currentFitnessLevel">Poziom zaawansowania</label>
                <select
                  id="currentFitnessLevel"
                  name="currentFitnessLevel"
                  value={formData.currentFitnessLevel}
                  onChange={handleInputChange}
                >
                  {fitnessLevels.map((level) => (
                    <option key={level.value} value={level.value}>
                      {level.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Preferowane dni treningowe (wybierz minimum 3)</label>
              <div className="training-days-selector">
                {daysOfWeek.map((day) => (
                  <button
                    key={day.value}
                    type="button"
                    className={`day-button ${
                      formData.trainingDays.includes(day.value) ? "selected" : ""
                    }`}
                    onClick={() => toggleTrainingDay(day.value)}
                  >
                    {day.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="info-message">
            <strong>Informacja:</strong> Generowanie planu używa lokalnego modelu AI Qwen2.5.
            Plan zostanie stworzony na podstawie Twoich danych treningowych i będzie zawierał 
            szczegółowe opisy każdego treningu.
          </div>

          {generating && (
            <div className="progress-container">
              <div className="progress-header">
                <Loader size={20} className="spin" />
                <span className="progress-message">{generatingMessage}</span>
              </div>
            </div>
          )}

          <div className="form-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate("/training-plans")}
              disabled={generating}
            >
              Anuluj
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={generating || formData.trainingDays.length < 3}
            >
              {generating ? (
                <>
                  <Loader size={20} className="spin" />
                  Generowanie planu...
                </>
              ) : (
                <>Wygeneruj plan</>
              )}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}

export default CreateTrainingPlanPage;
