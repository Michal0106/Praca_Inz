import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Calendar, Target, TrendingUp, Trash2 } from "lucide-react";
import Layout from "../components/Layout";
import { trainingPlanAPI } from "../services/api";
import "./MyTrainingPlansPage.css";

function MyTrainingPlansPage() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setError(null);
      const res = await trainingPlanAPI.getMyPlans();
      setPlans(res.data.plans || []);
    } catch (error) {
      if (error.response?.status === 401) {
        navigate("/");
        return;
      }
      console.error("Fetch plans error:", error);
      setError("Błąd podczas ładowania planów treningowych");
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePlan = async (planId, e) => {
    e.stopPropagation();
    if (!confirm("Czy na pewno chcesz usunąć ten plan treningowy?")) {
      return;
    }

    try {
      await trainingPlanAPI.deletePlan(planId);
      setPlans(plans.filter((p) => p.id !== planId));
    } catch (error) {
      console.error("Delete plan error:", error);
      alert("Błąd podczas usuwania planu");
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "ACTIVE":
        return "status-badge active";
      case "COMPLETED":
        return "status-badge completed";
      case "ARCHIVED":
        return "status-badge archived";
      default:
        return "status-badge";
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "ACTIVE":
        return "Aktywny";
      case "COMPLETED":
        return "Ukończony";
      case "ARCHIVED":
        return "Zarchiwizowany";
      default:
        return status;
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

  const calculateProgress = (plan) => {
    if (!plan.weeks || plan.weeks.length === 0) return 0;
    
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
        <div className="my-plans-page">
          <div className="loading">Ładowanie planów...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="my-plans-page">
        <div className="page-header">
          <div>
            <h1>Moje plany treningowe</h1>
            <p className="subtitle">
              Zarządzaj swoimi planami treningowymi wygenerowanymi przez AI
            </p>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => navigate("/training-plans/create")}
          >
            <Plus size={20} />
            Wygeneruj nowy plan
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        {plans.length === 0 && !error ? (
          <div className="empty-state">
            <div className="empty-state-icon">📋</div>
            <h3>Nie masz jeszcze żadnych planów treningowych</h3>
            <p>
              Wygeneruj spersonalizowany plan treningowy oparty na Twoich
              aktywności ze Strava i celach treningowych.
            </p>
            <button
              className="btn btn-primary"
              onClick={() => navigate("/training-plans/create")}
            >
              <Plus size={20} />
              Wygeneruj pierwszy plan
            </button>
          </div>
        ) : (
          <div className="plans-grid">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className="plan-card"
                onClick={() => navigate(`/training-plans/${plan.id}`)}
              >
                <div className="plan-card-header">
                  <h3>{plan.name || plan.goal}</h3>
                  <span className={getStatusBadgeClass(plan.status)}>
                    {getStatusLabel(plan.status)}
                  </span>
                </div>

                <div className="plan-goal">{plan.goal}</div>

                <div className="plan-meta">
                  <span>
                    <Calendar size={16} />
                    {formatDate(plan.targetRaceDate)}
                  </span>
                  <span>
                    <Target size={16} />
                    {plan.weeksCount} tygodni
                  </span>
                  <span>
                    <TrendingUp size={16} />
                    {plan.sessionsPerWeek} treningów/tydzień
                  </span>
                </div>

                <div className="plan-progress">
                  <div className="progress-label">
                    Postęp: {calculateProgress(plan)}%
                  </div>
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: `${calculateProgress(plan)}%` }}
                    />
                  </div>
                </div>

                <button
                  className="delete-btn"
                  onClick={(e) => handleDeletePlan(plan.id, e)}
                  title="Usuń plan"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}

export default MyTrainingPlansPage;
