import React, { useEffect, useState } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import "../styles/OwnerDashboard.css";

const OwnerDashboard = () => {
  const { user } = useAuth();

  const [stats, setStats] = useState(null);
  const [myPlayrooms, setMyPlayrooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError("");

        // 1. Učitaj moje igraonice
        const resPlayrooms = await api.get("/playrooms/mine/my-playrooms");
        const playrooms = resPlayrooms.data?.data || [];
        setMyPlayrooms(playrooms);

        // 2. Ako vlasnik nema nijednu igraonicu
        if (playrooms.length === 0) {
          setStats(null);
          return;
        }

        // 3. Uzmi prvu igraonicu i učitaj statistiku
        const firstPlayroom = playrooms[0];
        const resStats = await api.get(`/playrooms/${firstPlayroom._id}/stats`);
        setStats(resStats.data?.data || null);
      } catch (err) {
        console.error("Greška pri učitavanju dashboard-a:", err);
        setError("Greška pri učitavanju podataka za dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <div className="loading-container">⏳ Učitavanje podataka...</div>;
  }

  if (error) {
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
          <h2>Zdravo, {user?.ime} 👋</h2>
        </header>

        <div className="empty-state">
          <p>Još nemate kreiranu nijednu igraonicu.</p>
          <p>Prvo kreirajte svoju igraonicu da biste videli statistiku.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h2>Zdravo, {user?.ime} 👋</h2>
        <p className="playroom-name">
          📍 {stats?.playroomName || myPlayrooms[0]?.naziv}
        </p>
      </header>

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
    </div>
  );
};

export default OwnerDashboard;
