import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getPlayroomById } from "../services/playroomService";
import { useAuth } from "../context/AuthContext";
import "../styles/PlayroomDetails.css";
import ImageGallery from "../components/ImageGallery";
import Reviews from "../components/Reviews";

const PlayroomDetails = () => {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [playroom, setPlayroom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPriceModal, setShowPriceModal] = useState(false);
  const reviewsRef = useRef(null);

  useEffect(() => {
    loadPlayroom();
  }, [id]);

  useEffect(() => {
    // Proveri da li URL ima #reviews hash
    if (window.location.hash === "#reviews" && playroom) {
      setTimeout(() => {
        const element = document.getElementById("reviews-section");
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }, 500);
    }
  }, [playroom]);

  const loadPlayroom = async () => {
    setLoading(true);
    const result = await getPlayroomById(id);
    if (result.success) {
      setPlayroom(result.data);
    }
    setLoading(false);
  };

  const handleBook = () => {
    if (!isAuthenticated) {
      navigate("/login");
    } else {
      navigate(`/book/${id}`);
    }
  };

  if (loading) {
    return <div className="container loading">Učitavanje...</div>;
  }

  if (!playroom) {
    return (
      <div className="container">
        <h1>Igraonica nije pronađena</h1>
      </div>
    );
  }

  const featureNames = {
    animatori: "🎭 Animatori",
    kafic: "☕ Kafić",
    parking: "🅿️ Parking",
    rođendani: "🎂 Rođendani",
    wifi: "📶 WiFi",
    trampoline: "🤸 Trampoline",
    kliziste: "⛸️ Klizalište",
  };

  return (
    <div className="container playroom-details">
      <button className="btn-back" onClick={() => navigate("/playrooms")}>
        ← Nazad na igraonice
      </button>

      <div className="details-card">
        {/* Galerija slika */}
        <ImageGallery
          images={playroom.slike || []}
          playroomName={playroom.naziv}
        />
        <div className="details-header">
          <h1>{playroom.naziv}</h1>
          <div className="playroom-rating-large">
            <div className="stars-large">
              {"★".repeat(Math.floor(playroom.rating || 0))}
              {"☆".repeat(5 - Math.floor(playroom.rating || 0))}
            </div>
            <span className="rating-number-large">
              {playroom.rating?.toFixed(1) || 0}
            </span>
            <span
              className="review-count-link-large"
              onClick={() =>
                document
                  .getElementById("reviews-section")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              style={{
                cursor: "pointer",
                color: "#2196f3",
                textDecoration: "underline",
              }}
            >
              ({playroom.reviewCount || 0} recenzija)
            </span>
          </div>
        </div>

        <div className="details-location">
          📍 {playroom.adresa}, {playroom.grad}
        </div>

        <div className="details-info-grid">
          <div className="info-item">
            <strong>📞 Telefon:</strong> {playroom.kontaktTelefon}
          </div>
          <div className="info-item">
            <strong>📧 Email:</strong> {playroom.kontaktEmail}
          </div>
          <div className="info-item">
            <strong>👥 Kapacitet:</strong> {playroom.kapacitet} dece
          </div>
        </div>

        <div className="details-description">
          <h3>Opis</h3>
          <p>{playroom.opis}</p>
        </div>

        {/* Dugme za cenovnik */}
        <div className="details-price">
          <button className="btn-price" onClick={() => setShowPriceModal(true)}>
            💰 Pogledaj cenovnik
          </button>
        </div>

        <div className="details-features">
          <h3>Pogodnosti</h3>
          <div className="features-list">
            {playroom.pogodnosti?.map((feature, index) => (
              <span key={index} className="feature-badge">
                {featureNames[feature] || feature}
              </span>
            ))}
          </div>
        </div>

        <div className="details-working-hours">
          <h3>Radno vreme</h3>
          <div className="hours-list">
            {Object.entries(playroom.radnoVreme || {}).map(([dan, vreme]) => {
              const dani = {
                ponedeljak: "Ponedeljak",
                utorak: "Utorak",
                sreda: "Sreda",
                cetvrtak: "Četvrtak",
                petak: "Petak",
                subota: "Subota",
                nedelja: "Nedelja",
              };
              return (
                <div key={dan} className="hour-item">
                  <span className="day">{dani[dan]}:</span>
                  <span>
                    {vreme?.od} - {vreme?.do}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <button className="btn-book-large" onClick={handleBook}>
          Rezerviši termin
        </button>
      </div>

      {/* Modal za cenovnik */}
      {showPriceModal && (
        <div className="price-modal" onClick={() => setShowPriceModal(false)}>
          <div
            className="price-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="price-modal-header">
              <h2>Cenovnik - {playroom.naziv}</h2>
              <button
                className="price-modal-close"
                onClick={() => setShowPriceModal(false)}
              >
                ✖
              </button>
            </div>
            <div className="price-modal-body">
              {/* Osnovne cene */}
              <div className="price-group">
                <h3>🎟️ Ulaznice</h3>
                <div className="price-item">
                  <span>Cena po detetu:</span>
                  <strong>{playroom.cenovnik?.osnovni} RSD</strong>
                </div>
                {playroom.cenovnik?.poRoditelju > 0 && (
                  <div className="price-item">
                    <span>Cena po roditelju (pratilac):</span>
                    <strong>{playroom.cenovnik.poRoditelju} RSD</strong>
                  </div>
                )}
                {playroom.cenovnik?.produzeno > 0 && (
                  <div className="price-item">
                    <span>Produženo vreme (po satu):</span>
                    <strong>{playroom.cenovnik.produzeno} RSD</strong>
                  </div>
                )}
                {playroom.cenovnik?.vikend > 0 && (
                  <div className="price-item">
                    <span>Vikend cena:</span>
                    <strong>{playroom.cenovnik.vikend} RSD</strong>
                  </div>
                )}
              </div>

              {/* Fiksni paketi */}
              {playroom.cenovnik?.fiksniPaketi?.length > 0 && (
                <div className="price-group">
                  <h3>🎁 Fiksni paketi</h3>
                  {playroom.cenovnik.fiksniPaketi.map((paket, idx) => (
                    <div key={idx} className="price-item">
                      <span>{paket.naziv}:</span>
                      <strong>{paket.cena} RSD</strong>
                      {paket.opis && (
                        <span className="price-desc">({paket.opis})</span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Opcione pogodnosti */}
              {playroom.opcije?.length > 0 && (
                <div className="price-group">
                  <h3>🎪 Dodatne pogodnosti (opciono)</h3>
                  {playroom.opcije.map((opcija, idx) => (
                    <div key={idx} className="price-item">
                      <span>{opcija.naziv}:</span>
                      <strong>{opcija.cena} RSD</strong>
                      {opcija.tip === "po_osobi" && (
                        <span className="price-type">(po osobi)</span>
                      )}
                      {opcija.opis && (
                        <span className="price-desc">({opcija.opis})</span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Besplatne pogodnosti */}
              {playroom.pogodnosti?.length > 0 && (
                <div className="price-group">
                  <h3>✨ Besplatne pogodnosti</h3>
                  <div className="free-features">
                    {playroom.pogodnosti.map((feat, idx) => (
                      <span key={idx} className="free-feature">
                        ✓ {feat}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <Reviews playroomId={playroom._id} />
    </div>
  );
};

export default PlayroomDetails;
