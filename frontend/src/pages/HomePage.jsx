import { Activity, TrendingUp, Calendar, MessageSquare, GitCompare } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./HomePage.css";

function HomePage() {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate("/login");
  };

  const handleRegister = () => {
    navigate("/register");
  };

  return (
    <div className="home-page">
      <div className="hero-section">
        <div className="hero-content">
          <div className="logo">
            <Activity size={60} />
          </div>
          <h1>Training Analytics</h1>
          <p className="subtitle">
            Analizuj swoje treningi, śledź postępy i otrzymuj spersonalizowane
            plany treningowe
          </p>

          <div className="auth-buttons">
            <button className="auth-btn primary-btn" onClick={handleLogin}>
              Zaloguj się
            </button>

            <button className="auth-btn secondary-btn" onClick={handleRegister}>
              Zarejestruj się
            </button>
          </div>
        </div>

        <div className="features">
          <div className="feature-card">
            <TrendingUp size={40} />
            <h3>Zaawansowana Analiza</h3>
            <p>Szczegółowe wykresy i statystyki Twoich treningów</p>
          </div>{" "}
          <div className="feature-card">
            <Activity size={40} />
            <h3>Rekordy i Dane</h3>
            <p>Śledź swoje osiągnięcia i najlepsze wyniki</p>
          </div>
          <div className="feature-card">
            <Calendar size={40} />
            <h3>Plan Treningowy</h3>
            <p>
              Otrzymaj spersonalizowany plan dopasowany do Twoich możliwości
            </p>
          </div>
          <div className="feature-card">
            <MessageSquare size={40} />
            <h3>Asystent AI</h3>
            <p>
              Porozmawiaj z AI o swoim treningu i otrzymaj personalizowane porady
            </p>
          </div>
          <div className="feature-card">
            <GitCompare size={40} />
            <h3>Porównaj Treningi</h3>
            <p>
              Porównaj dwa treningi i analizuj różnice w wydajności
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
