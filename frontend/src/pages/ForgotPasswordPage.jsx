import { useState } from "react";
import { Link } from "react-router-dom";
import { authAPI } from "../services/api";
import "./AuthPage.css";

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);

    try {
      await authAPI.requestPasswordReset(email);
      setMessage(
        "Jeśli konto z tym adresem istnieje, wysłaliśmy instrukcje resetu hasła."
      );
    } catch (err) {
      console.error("Forgot password error:", err);
      setError("Nie udało się wysłać prośby o reset hasła.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <h1 className="auth-title">Reset hasła</h1>
          <p className="auth-subtitle">
            Podaj adres e-mail użyty przy rejestracji. Wyślemy link do
            zresetowania hasła.
          </p>

          {message && <div className="auth-message success">{message}</div>}
          {error && <div className="auth-message error">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="email">Adres e-mail</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="twoj.email@example.com"
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              className="auth-btn primary"
              disabled={loading}
            >
              {loading ? "Wysyłanie..." : "Wyślij link resetujący"}
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

export default ForgotPasswordPage;
