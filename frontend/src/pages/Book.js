import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getPlayroomById } from "../services/playroomService";
import { getTimeSlots, createBooking } from "../services/bookingService";
import { useAuth } from "../context/AuthContext";
import "../styles/Book.css";

const Book = () => {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [playroom, setPlayroom] = useState(null);
  const [timeSlots, setTimeSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [brojDece, setBrojDece] = useState(1);
  const [napomena, setNapomena] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    loadPlayroom();
  }, [id]);

  useEffect(() => {
    if (playroom) {
      loadTimeSlots();
    }
  }, [selectedDate, playroom]);

  const loadPlayroom = async () => {
    const result = await getPlayroomById(id);
    if (result.success) {
      setPlayroom(result.data);
    }
  };

  const toggleOption = (opcija) => {
    setSelectedOptions((prev) => {
      if (prev.find((o) => o.naziv === opcija.naziv)) {
        return prev.filter((o) => o.naziv !== opcija.naziv);
      } else {
        return [...prev, opcija];
      }
    });
  };

  const ukupnaCena =
    (selectedSlot?.cena || 0) * brojDece +
    selectedOptions.reduce((sum, opt) => sum + opt.cena, 0);

  const loadTimeSlots = async () => {
    setLoading(true);
    setSelectedSlot(null);
    const result = await getTimeSlots(id, selectedDate);
    if (result.success) {
      setTimeSlots(result.data);
      console.log("Učitani termini:", result.data);
    } else {
      setError("Greška pri učitavanju termina");
    }
    setLoading(false);
  };

  const handleBook = async () => {
    if (!selectedSlot) {
      setError("Izaberite termin");
      return;
    }

    setSubmitting(true);
    setError("");

    const result = await createBooking({
      playroomId: id,
      datum: selectedDate,
      vremeOd: selectedSlot.vremeOd,
      vremeDo: selectedSlot.vremeDo,
      brojDece,
      napomena,
      selectedOptions: selectedOptions.map((opt) => opt.naziv), // prosledi izabrane opcije
    });

    if (result.success) {
      navigate("/my-bookings");
    } else {
      setError(result.error);
    }
    setSubmitting(false);
  };

  const formatDate = (dateString) => {
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return new Date(dateString).toLocaleDateString("sr-RS", options);
  };

  const getSlotStatus = (slot) => {
    if (slot.zauzeto) {
      return { text: "ZAUZETO", class: "slot-full", disabled: true };
    }
    return { text: "SLOBODNO", class: "slot-free", disabled: false };
  };

  if (!playroom) {
    return <div className="container loading">Učitavanje...</div>;
  }

  return (
    <div className="container book-page">
      <button
        className="back-link"
        onClick={() => navigate(`/playrooms/${id}`)}
      >
        ← Nazad na igraonicu
      </button>

      <div className="book-card">
        <div className="book-header">
          <h1>Rezerviši termin</h1>
          <div className="playroom-badge">
            <h2>{playroom.naziv}</h2>
            <p className="location">
              📍 {playroom.adresa}, {playroom.grad}
            </p>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="date-selector">
          <label>📅 Izaberite datum</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            min={new Date().toISOString().split("T")[0]}
            className="date-input"
          />
        </div>

        <div className="slots-section">
          <h3>Dostupni termini za {formatDate(selectedDate)}</h3>

          {loading ? (
            <div className="loading-slots">Učitavanje termina...</div>
          ) : timeSlots.length === 0 ? (
            <div className="no-slots">
              <p>😢 Nema dostupnih termina za izabrani datum.</p>
              <p>Molimo izaberite drugi datum ili kontaktirajte igraonicu.</p>
            </div>
          ) : (
            <div className="slots-grid">
              {timeSlots.map((slot) => {
                const status = getSlotStatus(slot);
                const isSelected = selectedSlot?._id === slot._id;

                return (
                  <div
                    key={slot._id}
                    className={`slot-card ${status.class} ${isSelected ? "selected" : ""}`}
                    onClick={() => !status.disabled && setSelectedSlot(slot)}
                  >
                    <div className="slot-time">
                      <span className="time-icon">⏰</span>
                      <span className="time-range">
                        {slot.vremeOd} - {slot.vremeDo}
                      </span>
                    </div>
                    <div className="slot-info">
                      <div className="slot-price">
                        <span className="price-amount">{slot.cena} RSD</span>
                        <span className="price-unit">/ dete</span>
                      </div>
                      <div className="slot-capacity">
                        <span>
                          👥 Slobodno: {slot.slobodno}/{slot.maxDece}
                        </span>
                      </div>
                    </div>
                    <div className={`slot-status-badge ${status.class}`}>
                      {status.text}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {selectedSlot && !loading && timeSlots.length > 0 && (
          <div className="booking-form">
            <h3>Detalji rezervacije</h3>
            <div className="selected-slot-summary">
              <p>
                ⏰ {selectedSlot.vremeOd} - {selectedSlot.vremeDo}
              </p>
              <p>💰 {selectedSlot.cena} RSD po detetu</p>
              <p>👥 Slobodno mesta: {selectedSlot.slobodno}</p>
            </div>

            <div className="form-group">
              <label>👶 Broj dece</label>
              <input
                type="number"
                min="1"
                max={selectedSlot?.slobodno || 30}
                value={brojDece}
                onChange={(e) =>
                  setBrojDece(
                    Math.min(
                      selectedSlot?.slobodno || 30,
                      parseInt(e.target.value) || 1,
                    ),
                  )
                }
                className="kids-input"
              />
            </div>

            {/* OPCIONE POGODNOSTI */}
            {playroom.opcije && playroom.opcije.length > 0 && (
              <div className="options-section">
                <h4>🎪 Dodatne pogodnosti (opciono)</h4>
                <div className="options-grid">
                  {playroom.opcije.map((opcija, index) => (
                    <div key={index} className="option-card">
                      <label className="option-checkbox">
                        <input
                          type="checkbox"
                          checked={selectedOptions.some(
                            (o) => o.naziv === opcija.naziv,
                          )}
                          onChange={() => toggleOption(opcija)}
                        />
                        <span className="option-name">{opcija.naziv}</span>
                        <span className="option-price">+{opcija.cena} RSD</span>
                      </label>
                      {opcija.opis && (
                        <p className="option-desc">{opcija.opis}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="form-group">
              <label>📝 Napomena (opciono)</label>
              <textarea
                rows="3"
                value={napomena}
                onChange={(e) => setNapomena(e.target.value)}
                placeholder="Npr. alergije, posebni zahtevi, dolazak sa kolicima..."
                className="note-input"
              />
            </div>

            <div className="price-summary">
              <div className="summary-row">
                <span>Broj dece:</span>
                <strong>{brojDece}</strong>
              </div>
              <div className="summary-row">
                <span>Cena po detetu:</span>
                <strong>{selectedSlot.cena} RSD</strong>
              </div>
              {selectedOptions.length > 0 && (
                <div className="summary-row options-summary">
                  <span>Dodatne pogodnosti:</span>
                  <div className="options-total">
                    {selectedOptions.map((opt, idx) => (
                      <div key={idx} className="option-line">
                        {opt.naziv}: +{opt.cena} RSD
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="summary-total">
                <span>Ukupno za plaćanje:</span>
                <strong className="total-amount">{ukupnaCena} RSD</strong>
              </div>
            </div>

            <button
              className="btn-book"
              onClick={handleBook}
              disabled={submitting}
            >
              {submitting ? "Rezervišem..." : "✅ Potvrdi rezervaciju"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Book;
