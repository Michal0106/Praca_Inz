import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Target,
  TrendingUp,
  CheckCircle2,
  Circle,
  ChevronDown,
  ChevronUp,
  CalendarPlus,
} from "lucide-react";
import Layout from "../components/Layout";
import { trainingPlanAPI, authAPI } from "../services/api";
import "./TrainingPlanDetailPage.css";

function TrainingPlanDetailPage() {
  const { planId } = useParams();
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedWeeks, setExpandedWeeks] = useState([0]);
  const [completingWorkout, setCompletingWorkout] = useState(null);
  const [syncingToCalendar, setSyncingToCalendar] = useState(false);
  const [calendarSyncMessage, setCalendarSyncMessage] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPlan();
  }, [planId]);

  const fetchPlan = async () => {
    try {
      setError(null);
      const res = await trainingPlanAPI.getMyPlanById(planId);
      setPlan(res.data.plan);
      
      const currentWeek = findCurrentWeek(res.data.plan.weeks);
      if (currentWeek !== -1) {
        setExpandedWeeks([currentWeek]);
      }
    } catch (error) {
      if (error.response?.status === 401) {
        navigate("/");
        return;
      }
      console.error("Fetch plan error:", error);
      setError("Błąd podczas ładowania planu treningowego");
    } finally {
      setLoading(false);
    }
  };

  const findCurrentWeek = (weeks) => {
    if (!weeks) return -1;
    
    for (let i = 0; i < weeks.length; i++) {
      const hasIncomplete = weeks[i].workouts?.some((w) => !w.completed);
      if (hasIncomplete) return i;
    }
    
    return weeks.length - 1; 
  };

  const toggleWeek = (weekIndex) => {
    setExpandedWeeks((prev) =>
      prev.includes(weekIndex)
        ? prev.filter((i) => i !== weekIndex)
        : [...prev, weekIndex]
    );
  };

  const handleCompleteWorkout = async (workoutId) => {
    const actualDistance = prompt("Dystans (w km, opcjonalnie):");
    const actualDuration = prompt("Czas (w minutach, opcjonalnie):");
    const notes = prompt("Notatki (opcjonalnie):");

    setCompletingWorkout(workoutId);

    try {
      const payload = {
        actualDistance: actualDistance ? parseFloat(actualDistance) * 1000 : null,
        actualDuration: actualDuration ? parseInt(actualDuration) * 60 : null,
        notes: notes || null,
      };

      await trainingPlanAPI.completeWorkout(workoutId, payload);
      await fetchPlan(); 
    } catch (error) {
      console.error("Complete workout error:", error);
      alert("Błąd podczas zapisywania treningu");
    } finally {
      setCompletingWorkout(null);
    }
  };

  const handleSyncToCalendar = async () => {
    setSyncingToCalendar(true);
    setCalendarSyncMessage(null);

    try {
      const response = await trainingPlanAPI.syncToCalendar(planId);
      
      setCalendarSyncMessage({
        type: 'success',
        text: `✅ Zsynchronizowano ${response.data.totalEvents} treningów z Google Calendar!`,
      });
      
      await fetchPlan();
      
      setTimeout(() => setCalendarSyncMessage(null), 5000);
    } catch (error) {
      console.error("Sync to calendar error:", error);
      
      if (error.response?.data?.requiresGoogleAuth) {
        const userConfirmed = window.confirm(
          'Aby zsynchronizować plan z kalendarzem, musisz połączyć konto Google. Czy chcesz to zrobić teraz?'
        );
        
        if (userConfirmed) {
          try {
            const authRes = await authAPI.googleAuth();
            window.location.href = authRes.data.authUrl;
          } catch (authError) {
            console.error('Google auth error:', authError);
            setCalendarSyncMessage({
              type: 'error',
              text: 'Błąd podczas łączenia z Google Calendar',
            });
          }
        }
      } else {
        setCalendarSyncMessage({
          type: 'error',
          text: error.response?.data?.error || 'Błąd podczas synchronizacji z kalendarzem',
        });
      }
      
      setTimeout(() => setCalendarSyncMessage(null), 5000);
    } finally {
      setSyncingToCalendar(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pl-PL", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const getDayName = (dayNum) => {
    const days = [
      "Poniedziałek",
      "Wtorek",
      "Środa",
      "Czwartek",
      "Piątek",
      "Sobota",
      "Niedziela",
    ];
    return days[dayNum - 1] || "";
  };

  const getWorkoutTypeLabel = (type) => {
    const labels = {
      EASY_RUN: "Bieg łatwy",
      LONG_RUN: "Bieg długi",
      TEMPO_RUN: "Bieg tempo",
      INTERVALS: "Interwały",
      THRESHOLD_RUN: "Bieg progowy",
      RECOVERY_RUN: "Bieg regeneracyjny",
      HILL_REPEATS: "Podbieganie",
      FARTLEK: "Fartlek",
      RACE_PACE: "Tempo wyścigowe",
      REST: "Odpoczynek",
    };
    return labels[type] || type;
  };

  const calculateProgress = () => {
    if (!plan || !plan.weeks) return 0;
    
    let totalWorkouts = 0;
    let completedWorkouts = 0;

    plan.weeks.forEach((week) => {
      if (week.workouts) {
        totalWorkouts += week.workouts.length;
        completedWorkouts += week.workouts.filter((w) => w.completed).length;
      }
    });

    return totalWorkouts > 0
      ? Math.round((completedWorkouts / totalWorkouts) * 100)
      : 0;
  };

  if (loading) {
    return (
      <Layout>
        <div className="plan-detail-page">
          <div className="loading">Ładowanie planu...</div>
        </div>
      </Layout>
    );
  }

  if (error || !plan) {
    return (
      <Layout>
        <div className="plan-detail-page">
          <div className="error-message">{error || "Plan nie znaleziony"}</div>
          <button className="btn btn-primary" onClick={() => navigate("/training-plans")}>
            Powrót do planów
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="plan-detail-page">
        <button className="back-btn" onClick={() => navigate("/training-plans")}>
          <ArrowLeft size={20} />
          Powrót do planów
        </button>

        <div className="plan-header">
          <div>
            <h1>{plan.name || plan.goal}</h1>
            <p className="plan-goal">{plan.goal}</p>
          </div>

          <button 
            className="sync-calendar-btn"
            onClick={handleSyncToCalendar}
            disabled={syncingToCalendar}
          >
            <CalendarPlus size={20} />
            {syncingToCalendar ? 'Synchronizacja...' : plan.syncedToCalendar ? 'Aktualizuj kalendarz' : 'Wyślij do kalendarza'}
          </button>
        </div>

        {calendarSyncMessage && (
          <div className={`calendar-sync-message ${calendarSyncMessage.type}`}>
            {calendarSyncMessage.text}
          </div>
        )}

        <div className="plan-stats-row">
          <div className="plan-stats">
            <div className="stat-card">
              <Calendar size={20} />
              <div>
                <div className="stat-label">Data biegu</div>
                <div className="stat-value">{formatDate(plan.targetRaceDate)}</div>
              </div>
            </div>
            <div className="stat-card">
              <Target size={20} />
              <div>
                <div className="stat-label">Czas trwania</div>
                <div className="stat-value">{plan.weeksCount} tygodni</div>
              </div>
            </div>
            <div className="stat-card">
              <TrendingUp size={20} />
              <div>
                <div className="stat-label">Treningów/tydzień</div>
                <div className="stat-value">{plan.sessionsPerWeek}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="progress-section">
          <div className="progress-header">
            <span className="progress-label">Postęp: {calculateProgress()}%</span>
          </div>
          <div className="progress-bar-large">
            <div
              className="progress-fill"
              style={{ width: `${calculateProgress()}%` }}
            />
          </div>
        </div>

        <div className="weeks-container">
          {plan.weeks?.map((week, weekIndex) => (
            <div key={week.id} className="week-card">
              <div
                className="week-header"
                onClick={() => toggleWeek(weekIndex)}
              >
                <div>
                  <h3>Tydzień {week.weekNumber}</h3>
                  {week.weekGoal && <p className="week-goal">{week.weekGoal}</p>}
                </div>
                <div className="week-header-right">
                  <div className="week-meta">
                    <span>
                      {week.workouts?.filter((w) => w.completed).length || 0} /{" "}
                      {week.workouts?.length || 0} treningów
                    </span>
                    {week.totalDistance && (
                      <span>
                        {week.totalDistance.toFixed(1)} km
                      </span>
                    )}
                  </div>
                  {expandedWeeks.includes(weekIndex) ? (
                    <ChevronUp size={20} />
                  ) : (
                    <ChevronDown size={20} />
                  )}
                </div>
              </div>

              {expandedWeeks.includes(weekIndex) && (
                <div className="workouts-list">
                  {week.workouts?.map((workout) => {
                    const isRestDay = workout.workoutType === 'REST';
                    
                    return (
                    <div
                      key={workout.id}
                      className={`workout-card ${workout.completed ? "completed" : ""} ${isRestDay ? "rest-day" : ""}`}
                    >
                      {isRestDay ? (
                        <>
                          <div className="workout-header">
                            <div className="workout-day">
                              {getDayName(workout.dayOfWeek)}
                            </div>
                          </div>
                          
                          <h4 className="workout-name">Dzień odpoczynku</h4>
                          <div className="workout-type rest-type">
                            Regeneracja
                          </div>
                          
                          <p className="rest-description">
                            Aktywna regeneracja organizmu. Możesz wykonać lekki spacer lub stretching.
                          </p>

                          <button
                            className={`complete-btn ${workout.completed ? "completed" : ""}`}
                            onClick={() =>
                              !workout.completed && handleCompleteWorkout(workout.id)
                            }
                            disabled={workout.completed || completingWorkout === workout.id}
                          >
                            {workout.completed ? (
                              <CheckCircle2 size={18} />
                            ) : (
                              <Circle size={18} />
                            )}
                            {workout.completed ? "Ukończono" : "Oznacz jako ukończone"}
                          </button>
                        </>
                      ) : (
                        <>
                      <div className="workout-header">
                        <div className="workout-day">
                          {getDayName(workout.dayOfWeek)}
                        </div>
                      </div>

                      <h4 className="workout-name">{workout.name}</h4>
                      <div className="workout-type">
                        {getWorkoutTypeLabel(workout.workoutType)}
                      </div>

                      {(() => {
                        let parsedIntervals;
                        try {
                          parsedIntervals = typeof workout.intervals === 'string' 
                            ? JSON.parse(workout.intervals) 
                            : workout.intervals;
                        } catch {
                          parsedIntervals = null;
                        }
                        const hasStructure = parsedIntervals && (parsedIntervals.warmup || parsedIntervals.main || parsedIntervals.intervals);

                        return (
                          <>
                            {!hasStructure && <p className="workout-description">{workout.description}</p>}

                            {!hasStructure && (
                              <div className="workout-targets">
                                {workout.targetDistance && (
                                  <div className="target-item">
                                    <span className="target-label">Dystans:</span>
                                    <span className="target-value">
                                      {workout.targetDistance.toFixed(1)} km
                                    </span>
                                  </div>
                                )}
                                {workout.targetDuration && (
                                  <div className="target-item">
                                    <span className="target-label">Czas:</span>
                                    <span className="target-value">
                                      {workout.targetDuration} min
                                    </span>
                                  </div>
                                )}
                                {workout.targetPace && (
                                  <div className="target-item">
                                    <span className="target-label">Tempo:</span>
                                    <span className="target-value">
                                      {workout.targetPace}
                                    </span>
                                  </div>
                                )}
                                {workout.intensity && (
                                  <div className="target-item">
                                    <span className="target-label">Intensywność:</span>
                                    <span className="target-value">{workout.intensity}</span>
                                  </div>
                                )}
                              </div>
                            )}
                          </>
                        );
                      })()}

                      {workout.intervals && (() => {
                        let parsedIntervals;
                        try {
                          parsedIntervals = typeof workout.intervals === 'string' 
                            ? JSON.parse(workout.intervals) 
                            : workout.intervals;
                        } catch {
                          parsedIntervals = null;
                        }
                        
                        return parsedIntervals && (
                          <div className="intervals-section">
                            <div className="interval-phases">
                              {parsedIntervals.warmup && (
                                <div className="interval-phase warmup">
                                  <div className="phase-info">
                                    <div className="phase-title">Rozgrzewka</div>
                                    <div className="phase-desc">{parsedIntervals.warmup}</div>
                                  </div>
                                </div>
                              )}
                              {(parsedIntervals.main || parsedIntervals.intervals) && (
                                <div className="interval-phase main">
                                  <div className="phase-info">
                                    <div className="phase-title">Część główna</div>
                                    <div className="phase-desc">{parsedIntervals.main || parsedIntervals.intervals}</div>
                                    {parsedIntervals.recovery && (
                                      <div className="phase-recovery">
                                        {parsedIntervals.recovery}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                              {parsedIntervals.cooldown && (
                                <div className="interval-phase cooldown">
                                  <div className="phase-info">
                                    <div className="phase-title">Wyciszenie</div>
                                    <div className="phase-desc">{parsedIntervals.cooldown}</div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })()}

                      {workout.completed && (
                        <div className="actual-data">
                          <div className="actual-label">Wykonane:</div>
                          {workout.actualDistance && (
                            <div className="actual-item">
                              Dystans: {(workout.actualDistance / 1000).toFixed(1)} km
                            </div>
                          )}
                          {workout.actualDuration && (
                            <div className="actual-item">
                              Czas: {Math.floor(workout.actualDuration / 60)} min
                            </div>
                          )}
                          {workout.notes && (
                            <div className="actual-item">
                              Notatki: {workout.notes}
                            </div>
                          )}
                        </div>
                      )}

                      <button
                        className={`complete-btn ${workout.completed ? "completed" : ""}`}
                        onClick={() =>
                          !workout.completed && handleCompleteWorkout(workout.id)
                        }
                        disabled={workout.completed || completingWorkout === workout.id}
                      >
                        {workout.completed ? (
                          <CheckCircle2 size={18} />
                        ) : (
                          <Circle size={18} />
                        )}
                        {workout.completed ? "Ukończono" : "Oznacz jako ukończone"}
                      </button>
                      </>
                      )}
                    </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}

export default TrainingPlanDetailPage;
