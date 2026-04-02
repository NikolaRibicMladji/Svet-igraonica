import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/global.css";

const Register = () => {
  const navigate = useNavigate();
  const { register, isAuthenticated, loading: authLoading } = useAuth();

  const [formData, setFormData] = useState({
    ime: "",
    prezime: "",
    email: "",
    password: "",
    telefon: "",
    role: "roditelj",
  });

  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate("/");
    }
  }, [authLoading, isAuthenticated, navigate]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const validatePasswords = () => {
    if (formData.password.length < 6) {
      setPasswordError("Lozinka mora imati najmanje 6 karaktera.");
      return false;
    }

    if (formData.password !== confirmPassword) {
      setPasswordError("Lozinke se ne podudaraju.");
      return false;
    }

    setPasswordError("");
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.ime.trim()) {
      setError("Unesite ime.");
      return;
    }

    if (!formData.prezime.trim()) {
      setError("Unesite prezime.");
      return;
    }

    if (!formData.email.trim()) {
      setError("Unesite email adresu.");
      return;
    }

    if (!formData.telefon.trim()) {
      setError("Unesite telefon.");
      return;
    }

    if (!validatePasswords()) {
      return;
    }

    setSubmitting(true);

    const result = await register({
      ...formData,
      ime: formData.ime.trim(),
      prezime: formData.prezime.trim(),
      email: formData.email.trim(),
      telefon: formData.telefon.trim(),
    });

    if (result?.success) {
      if (formData.role === "vlasnik") {
        navigate("/manage-playroom");
      } else {
        navigate("/");
      }
    } else {
      setError(result?.error || "Greška pri registraciji.");
    }

    setSubmitting(false);
  };

  return (
    <div className="container">
      <h1>Registracija</h1>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="register-ime">Ime</label>
          <input
            id="register-ime"
            type="text"
            name="ime"
            value={formData.ime}
            onChange={handleChange}
            required
            autoComplete="given-name"
          />
        </div>

        <div className="form-group">
          <label htmlFor="register-prezime">Prezime</label>
          <input
            id="register-prezime"
            type="text"
            name="prezime"
            value={formData.prezime}
            onChange={handleChange}
            required
            autoComplete="family-name"
          />
        </div>

        <div className="form-group">
          <label htmlFor="register-email">Email</label>
          <input
            id="register-email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            autoComplete="email"
          />
        </div>

        <div className="form-group">
          <label htmlFor="register-password">Lozinka</label>
          <input
            id="register-password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            minLength="6"
            autoComplete="new-password"
          />
        </div>

        <div className="form-group">
          <label htmlFor="register-confirm-password">Potvrdite lozinku</label>
          <input
            id="register-confirm-password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            autoComplete="new-password"
          />
          {passwordError && (
            <div
              className="error-message"
              style={{ marginTop: "5px", fontSize: "0.8rem" }}
            >
              {passwordError}
            </div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="register-telefon">Telefon</label>
          <input
            id="register-telefon"
            type="tel"
            name="telefon"
            value={formData.telefon}
            onChange={handleChange}
            required
            autoComplete="tel"
          />
        </div>

        <div className="form-group">
          <label htmlFor="register-role">Tip korisnika</label>
          <select
            id="register-role"
            name="role"
            value={formData.role}
            onChange={handleChange}
          >
            <option value="roditelj">Roditelj</option>
            <option value="vlasnik">Vlasnik igraonice</option>
          </select>
        </div>

        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? "Registrujem..." : "Registruj se"}
        </button>
      </form>

      <p>
        Već imate nalog? <Link to="/login">Prijavite se</Link>
      </p>
    </div>
  );
};

export default Register;
