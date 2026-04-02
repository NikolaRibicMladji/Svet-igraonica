import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/global.css";

const Login = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, loading: authLoading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate("/");
    }
  }, [authLoading, isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Unesite email adresu.");
      return;
    }

    if (!password.trim()) {
      setError("Unesite lozinku.");
      return;
    }

    setSubmitting(true);

    const result = await login(email.trim(), password);

    if (result?.success) {
      navigate("/");
    } else {
      setError(result?.error || "Greška pri prijavi.");
    }

    setSubmitting(false);
  };

  return (
    <div className="container">
      <h1>Prijava</h1>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="login-email">Email</label>
          <input
            id="login-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </div>

        <div className="form-group">
          <label htmlFor="login-password">Lozinka</label>
          <input
            id="login-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </div>

        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? "Prijavljujem..." : "Prijavi se"}
        </button>
      </form>

      <p>
        Nemate nalog? <Link to="/register">Registrujte se</Link>
      </p>
    </div>
  );
};

export default Login;
