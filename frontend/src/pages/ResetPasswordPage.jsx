import { useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { authAPI } from "../services/api";
import "./AuthPage.css";

function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get("token") || "";
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!token) {
      setError("Brak tokenu resetującego. Użyj linku z wiadomości e-mail.");
      return;
    }

    if (password !== password2) {
      setError("Hasła nie są takie same.");
      return;
    }

    if (password.length < 8) {
      setError("Hasło musi mieć co najmniej 8 znaków.");
      return;
    }

    setLoading(true);
    try {
      await authAPI.resetPassword({ token, password });
      setMessage("Hasło zostało zmienione. Możesz się teraz zalogować.");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      console.error("Reset password error:", err);
      setError(
        err.response?.data?.error ||
          "Nie udało się zresetować hasła. Link mógł wygasnąć."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <h1 className="auth-title">Ustaw nowe hasło</h1>

          {message && <div className="auth-message success">{message}</div>}
          {error && <div className="auth-message error">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="password">Nowe hasło</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password2">Powtórz hasło</label>
              <input
                id="password2"
                type="password"
                value={password2}
                onChange={(e) => setPassword2(e.target.value)}
                required
                minLength={8}
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              className="auth-btn primary"
              disabled={loading}
            >
              {loading ? "Zapisywanie..." : "Zapisz nowe hasło"}
            </button>
          </form>

          <div className="auth-links">
            <Link to="/login">← Wróć do logowania</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResetPasswordPage;