import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authAPI } from "../services/api";
import "./AuthPage.css";

function RegisterPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Walidacja
    if (formData.password !== formData.confirmPassword) {
      setError("Hasła nie są identyczne");
      setLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      setError("Hasło musi mieć minimum 8 znaków");
      setLoading(false);
      return;
    }

    try {
      const { confirmPassword, ...registerData } = formData;
      await authAPI.register(registerData);

      setSuccess(true);
      // Przekieruj do logowania po 3 sekundach
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      console.error("Registration error:", err);
      setError(
        err.response?.data?.error || "Błąd rejestracji. Spróbuj ponownie.",
      );
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="auth-page">
        <div className="auth-container">
          <div className="auth-card success">
            <div className="success-icon"></div>
            <h1>Rejestracja pomyślna!</h1>
            <p className="auth-subtitle">
              Twoje konto zostało utworzone. Możesz się teraz zalogować!
            </p>
            <p className="redirect-info">
              Za chwilę zostaniesz przekierowany do strony logowania...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <h1>Zarejestruj się</h1>
          <p className="auth-subtitle">
            Stwórz konto i zacznij analizować swoje treningi
          </p>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="firstName">Imię</label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="Jan"
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="lastName">Nazwisko</label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Kowalski"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email">Email *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="twoj@email.com"
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Hasło *</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
                disabled={loading}
              />
              <small>Minimum 8 znaków</small>
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Potwierdź hasło *</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                required
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              className="auth-btn primary"
              disabled={loading}
            >
              {loading ? "Rejestracja..." : "Zarejestruj się"}
            </button>
          </form>

          <div className="auth-links">
            <Link to="/login">Masz już konto? Zaloguj się</Link>
          </div>

          <div className="divider">
            <span>lub</span>
          </div>

          <button
            className="auth-btn strava"
            onClick={() =>
              (window.location.href = "http://localhost:3001/api/auth/strava")
            }
          >
            <span></span> Zarejestruj przez Stravę
          </button>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
