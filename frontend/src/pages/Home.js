import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/Home.css";

const Home = () => {
  const { user, isAuthenticated } = useAuth();

  const getSecondaryCta = () => {
    if (!isAuthenticated) {
      return {
        to: "/register",
        label: "Registruj se",
      };
    }

    if (user?.role === "vlasnik") {
      return {
        to: "/manage-playroom",
        label: "Upravljaj igraonicom",
      };
    }

    if (user?.role === "admin") {
      return {
        to: "/admin",
        label: "Otvori admin panel",
      };
    }

    return {
      to: "/my-bookings",
      label: "Moje rezervacije",
    };
  };

  const secondaryCta = getSecondaryCta();

  return (
    <>
      <section className="hero">
        <div className="container hero-container">
          <div className="hero-content">
            <h1>
              Najbolja mesta za
              <br />
              igru vašeg deteta
            </h1>

            <p>
              Otkrijte najlepše dečije igraonice u svom gradu i rezervišite
              termin brzo, jednostavno i pregledno.
            </p>

            <div className="hero-buttons">
              <Link to="/playrooms" className="btn btn-primary">
                Potraži igraonicu →
              </Link>

              <Link to={secondaryCta.to} className="btn btn-outline">
                {secondaryCta.label}
              </Link>
            </div>
          </div>

          <div className="hero-image">
            <div className="hero-emoji">🎈</div>
          </div>
        </div>
      </section>

      <section className="how-it-works">
        <div className="container">
          <h2 className="section-title">Kako funkcioniše?</h2>

          <div className="steps">
            <div className="step-card">
              <div className="step-number">1</div>
              <div className="step-icon">🔍</div>
              <h3>Pronađi igraonicu</h3>
              <p>Pretraži igraonice po gradu, ceni, ocenama i pogodnostima.</p>
            </div>

            <div className="step-card">
              <div className="step-number">2</div>
              <div className="step-icon">📅</div>
              <h3>Izaberi termin</h3>
              <p>Pogledaj slobodne termine i izaberi datum koji ti odgovara.</p>
            </div>

            <div className="step-card">
              <div className="step-number">3</div>
              <div className="step-icon">✅</div>
              <h3>Pošalji rezervaciju</h3>
              <p>Unesi podatke i potvrdi rezervaciju u nekoliko klikova.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="why-us">
        <div className="container">
          <h2 className="section-title">Zašto roditelji biraju nas?</h2>

          <div className="features">
            <div className="feature">
              <div className="feature-icon">⚡</div>
              <h3>Brzo i jednostavno</h3>
              <p>Rezervacija termina bez poziva, dopisivanja i čekanja.</p>
            </div>

            <div className="feature">
              <div className="feature-icon">📅</div>
              <h3>Jasni slobodni termini</h3>
              <p>Odmah vidiš koji termini su dostupni za izabrani datum.</p>
            </div>

            <div className="feature">
              <div className="feature-icon">📱</div>
              <h3>Radi na svim uređajima</h3>
              <p>Platforma je prilagođena telefonu, tabletu i računaru.</p>
            </div>

            <div className="feature">
              <div className="feature-icon">⭐</div>
              <h3>Verifikovane igraonice</h3>
              <p>
                Admin proverava igraonice pre nego što postanu javno vidljive.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="cta">
        <div className="container cta-container">
          <h2>Spremni za narednu proslavu ili igru?</h2>
          <p>
            Pregledaj igraonice, uporedi ponudu i rezerviši termin bez stresa.
          </p>

          <Link to="/playrooms" className="btn btn-primary">
            Započni potragu →
          </Link>
        </div>
      </section>
    </>
  );
};

export default Home;
