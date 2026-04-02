import React, { useEffect, useState } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import "../styles/OwnerDashboard.css";

const OwnerDashboard = () => {
  const { user, loading: authLoading } = useAuth();

  const [stats, setStats] = useState(null);
  const [myPlayrooms, setMyPlayrooms] = useState([]);
  const [selectedPlayroomId, setSelectedPlayroomId] = useState("");
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading) {
      fetchMyPlayrooms();
    }
  }, [authLoading]);

  useEffect(() => {
    if (selectedPlayroomId) {
      fetchStats(selectedPlayroomId);
    } else {
      setStats(null);
    }
  }, [selectedPlayroomId]);

  const fetchMyPlayrooms = async () => {
    try {
      setLoading(true);
      setError("");

      const resPlayrooms = await api.get("/playrooms/mine/my-playrooms");
      const playrooms = Array.isArray(resPlayrooms.data?.data)
        ? resPlayrooms.data.data
        : [];

      setMyPlayrooms(playrooms);

      if (playrooms.length > 0) {
        setSelectedPlayroomId(playrooms[0]._id);
      } else {
        setSelectedPlayroomId("");
        setStats(null);
      }
    } catch (err) {
      console.error("Greška pri učitavanju igraonica:", err);
      setError(
        err?.response?.data?.message ||
          "Greška pri učitavanju podataka za dashboard.",
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async (playroomId) => {
    try {
      setStatsLoading(true);
      setError("");

      const resStats = await api.get(`/playrooms/${playroomId}/stats`);
      setStats(resStats.data?.data || null);
    } catch (err) {
      console.error("Greška pri učitavanju statistike:", err);
      setError(
        err?.response?.data?.message ||
          "Greška pri učitavanju statistike igraonice.",
      );
      setStats(null);
    } finally {
      setStatsLoading(false);
    }
  };

  if (authLoading || loading) {
    return <div className="loading-container">⏳ Učitavanje podataka...</div>;
  }

  if (user?.role !== "vlasnik" && user?.role !== "admin") {
    return (
      <div className="dashboard-container">
        <div className="error-message">
          Ova stranica je dostupna samo vlasnicima igraonica.
        </div>
      </div>
    );
  }

  if (error && myPlayrooms.length === 0) {
    return (
      <div className="dashboard-container">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  if (myPlayrooms.length === 0) {
    return (
      <div className="dashboard-container">
        <header className="dashboard-header">
          <h2>Zdravo, {user?.ime || "vlasniče"} 👋</h2>
        </header>

        <div className="empty-state">
          <p>Još nemate kreiranu nijednu igraonicu.</p>
          <p>Prvo kreirajte svoju igraonicu da biste videli statistiku.</p>
        </div>
      </div>
    );
  }

  const selectedPlayroom =
    myPlayrooms.find((playroom) => playroom._id === selectedPlayroomId) ||
    myPlayrooms[0];

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h2>Zdravo, {user?.ime || "vlasniče"} 👋</h2>
        <p className="playroom-name">
          📍{" "}
          {stats?.playroomName || selectedPlayroom?.naziv || "Moja igraonica"}
        </p>
      </header>

      {myPlayrooms.length > 1 && (
        <div className="dashboard-playroom-select">
          <label htmlFor="dashboard-playroom-select">
            Izaberite igraonicu:
          </label>
          <select
            id="dashboard-playroom-select"
            value={selectedPlayroomId}
            onChange={(e) => setSelectedPlayroomId(e.target.value)}
          >
            {myPlayrooms.map((playroom) => (
              <option key={playroom._id} value={playroom._id}>
                {playroom.naziv}
              </option>
            ))}
          </select>
        </div>
      )}

      {error && <div className="error-message">{error}</div>}

      {statsLoading ? (
        <div className="loading-container">⏳ Učitavanje statistike...</div>
      ) : (
        <div className="stats-grid">
          <div className="stat-card blue">
            <span className="stat-icon">📊</span>
            <div className="stat-info">
              <h3>{stats?.totalBookings ?? 0}</h3>
              <p>Ukupno rezervacija</p>
            </div>
          </div>

          <div className="stat-card green">
            <span className="stat-icon">✅</span>
            <div className="stat-info">
              <h3>{stats?.confirmedBookings ?? 0}</h3>
              <p>Potvrđene rezervacije</p>
            </div>
          </div>

          <div className="stat-card orange">
            <span className="stat-icon">🎉</span>
            <div className="stat-info">
              <h3>{stats?.completedBookings ?? 0}</h3>
              <p>Završene rezervacije</p>
            </div>
          </div>

          <div className="stat-card purple">
            <span className="stat-icon">💰</span>
            <div className="stat-info">
              <h3>{stats?.totalRevenue ?? 0} RSD</h3>
              <p>Ukupna zarada</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OwnerDashboard;
