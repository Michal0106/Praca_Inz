import { Activity, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './HomePage.css';

function HomePage() {
 const navigate = useNavigate();

 const handleLogin = () => {
 navigate('/login');
 };

 const handleRegister = () => {
 navigate('/register');
 };

 const handleStravaAuth = () => {
 window.location.href = 'http://localhost:3001/api/auth/strava';
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
 Analizuj swoje treningi, śledź postępy i otrzymuj spersonalizowane plany treningowe
 </p>
 
 <div className="auth-buttons">
 <button className="auth-btn primary-btn" onClick={handleLogin}>
 Zaloguj się
 </button>
 
 <button className="auth-btn secondary-btn" onClick={handleRegister}>
 Zarejestruj się
 </button>
 
 <div className="divider-text">lub</div>
 
 <button className="auth-btn strava-btn" onClick={handleStravaAuth}>
 Kontynuuj ze Strava
 </button>
 </div>
 </div>
 
 <div className="features">
 <div className="feature-card">
 <TrendingUp size={40} />
 <h3>Zaawansowana Analiza</h3>
 <p>Szczegółowe wykresy i statystyki Twoich treningów</p>
 </div>
 
 <div className="feature-card">
 <Activity size={40} />
 <h3>Rekordy i Dane</h3>
 <p>Śledź swoje osiągnięcia i najlepsze wyniki</p>
 </div> <div className="feature-card">
 <span style={{ fontSize: '40px' }}></span>
 <h3>Plan Treningowy</h3>
 <p>Otrzymaj spersonalizowany plan dopasowany do Twoich możliwości</p>
 </div>
 </div>
 </div>
 </div>
 );
}

export default HomePage;
