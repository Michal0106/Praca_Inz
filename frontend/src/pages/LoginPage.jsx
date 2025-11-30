import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authAPI } from "../services/api";
import "./AuthPage.css";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await authAPI.login({ email, password });
      const { accessToken, refreshToken, user } = response.data;

      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("user", JSON.stringify(user));

      navigate("/dashboard");
    } catch (err) {
      console.error("Login error:", err);
      setError(
        err.response?.data?.error || "Błąd logowania. Sprawdź email i hasło.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <h1>Zaloguj się</h1>
          <p className="auth-subtitle">
            Witaj ponownie! Zaloguj się do swojego konta.
          </p>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="twoj@email.com"
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Hasło</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
              {loading ? "Logowanie..." : "Zaloguj się"}
            </button>
          </form>

          <div className="auth-links">
            <Link to="/register">Nie masz konta? Zarejestruj się</Link>
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
            <span></span> Zaloguj przez Stravę
          </button>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
