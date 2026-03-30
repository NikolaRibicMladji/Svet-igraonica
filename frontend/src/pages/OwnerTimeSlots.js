import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getMyPlayrooms } from "../services/playroomService";
import {
  getAllTimeSlotsForOwner,
  manualBookTimeSlot,
} from "../services/bookingService";
import { useAuth } from "../context/AuthContext";
import ManualBookingModal from "../components/ManualBookingModal";
import "../styles/OwnerTimeSlots.css";

const OwnerTimeSlots = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [playrooms, setPlayrooms] = useState([]);
  const [selectedPlayroom, setSelectedPlayroom] = useState("");
  const [timeSlots, setTimeSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [message, setMessage] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    loadPlayrooms();
  }, []);

  useEffect(() => {
    if (selectedPlayroom) {
      loadTimeSlots();
    }
  }, [selectedPlayroom, selectedDate]);

  const loadPlayrooms = async () => {
    setLoading(true);
    setError("");
    setMessage("");

    const result = await getMyPlayrooms();

    if (result.success && result.data.length > 0) {
      setPlayrooms(result.data);
      setSelectedPlayroom(result.data[0]._id);
    } else {
      setPlayrooms([]);
      setError("Nemate nijednu igraonicu. Prvo dodajte igraonicu.");
    }

    setLoading(false);
  };

  const loadTimeSlots = async () => {
    if (!selectedPlayroom) return;

    setLoading(true);
    setError("");
    setMessage("");

    const result = await getAllTimeSlotsForOwner(
      selectedPlayroom,
      selectedDate,
    );

    if (result.success) {
      setTimeSlots(result.data || []);

      if ((result.data || []).length === 0) {
        setError("Nema termina za izabrani datum.");
      }
    } else {
      setTimeSlots([]);
      setError(result.error || "Greška pri učitavanju termina");
    }

    setLoading(false);
  };

  const openManualBooking = (slot) => {
    if (slot.zauzeto) return;
    setSelectedSlot(slot);
    setMessage("");
    setError("");
    setModalOpen(true);
  };

  const closeManualBooking = () => {
    setModalOpen(false);
    setSelectedSlot(null);
  };

  const handleManualBooking = async (bookingData) => {
    if (!selectedSlot?._id) {
      setError("Termin nije izabran");
      return;
    }

    setError("");
    setMessage("");

    const result = await manualBookTimeSlot(selectedSlot._id, bookingData);

    if (result.success) {
      setMessage(result.message || "Termin je uspešno zauzet");
      closeManualBooking();
      await loadTimeSlots();
    } else {
      setError(result.error || "Greška pri ručnom zauzimanju termina");
    }
  };

  const selectedPlayroomData = playrooms.find(
    (p) => p._id === selectedPlayroom,
  );

  if (loading && playrooms.length === 0) {
    return <div className="container loading">Učitavanje...</div>;
  }

  return (
    <div className="container owner-slots-page">
      <div className="page-header">
        <h1>📅 Termini igraonice</h1>
        <p>Upravljanje terminima i ručne rezervacije</p>
      </div>

      {error && <div className="error-message">{error}</div>}
      {message && <div className="success-message">{message}</div>}

      {playrooms.length === 0 ? (
        <div className="empty-state">
          <p>Nemate nijednu igraonicu.</p>
          <button
            className="btn-primary"
            onClick={() => navigate("/create-playroom")}
          >
            Dodaj igraonicu
          </button>
        </div>
      ) : (
        <>
          <div className="filters-card">
            <div className="filter-group">
              <label>Izaberite igraonicu</label>
              <select
                value={selectedPlayroom}
                onChange={(e) => {
                  setSelectedPlayroom(e.target.value);
                  setMessage("");
                  setError("");
                }}
              >
                {playrooms.map((playroom) => (
                  <option key={playroom._id} value={playroom._id}>
                    {playroom.naziv}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Izaberite datum</label>
              <input
                type="date"
                value={selectedDate}
                min={new Date().toISOString().split("T")[0]}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  setMessage("");
                  setError("");
                }}
              />
            </div>
          </div>

          {selectedPlayroomData && (
            <div className="playroom-summary">
              <h2>{selectedPlayroomData.naziv}</h2>
              <p>
                📍 {selectedPlayroomData.adresa}, {selectedPlayroomData.grad}
              </p>
            </div>
          )}

          {loading ? (
            <div className="loading-slots">Učitavanje termina...</div>
          ) : timeSlots.length === 0 ? (
            <div className="empty-state">
              <p>Nema termina za izabrani datum.</p>
            </div>
          ) : (
            <div className="slots-grid">
              {timeSlots.map((slot) => (
                <div
                  key={slot._id}
                  className={`slot-card ${slot.zauzeto ? "zauzeto" : "slobodno"}`}
                >
                  <div className="slot-header">
                    <h3>
                      {slot.vremeOd} - {slot.vremeDo}
                    </h3>
                    <span
                      className={`slot-status ${slot.zauzeto ? "zauzeto" : "slobodno"}`}
                    >
                      {slot.zauzeto ? "ZAUZETO" : "SLOBODNO"}
                    </span>
                  </div>

                  <div className="slot-body">
                    <p>💰 Cena: {slot.cena} RSD</p>
                    <p>👶 Slobodno mesta: {slot.slobodno}</p>

                    {slot.booking ? (
                      <div className="booking-info">
                        <h4>Rezervacija</h4>
                        <p>
                          👤 {slot.booking.imeRoditelja}{" "}
                          {slot.booking.prezimeRoditelja}
                        </p>
                        <p>📧 {slot.booking.emailRoditelja}</p>
                        <p>📞 {slot.booking.telefonRoditelja}</p>
                        <p>👶 Broj dece: {slot.booking.brojDece}</p>
                        <p>👨‍👩‍👧 Broj roditelja: {slot.booking.brojRoditelja}</p>
                        {slot.booking.napomena && (
                          <p>📝 Napomena: {slot.booking.napomena}</p>
                        )}
                      </div>
                    ) : (
                      <button
                        className="btn-primary"
                        onClick={() => openManualBooking(slot)}
                        disabled={slot.zauzeto}
                      >
                        Ručno zauzmi termin
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {modalOpen && selectedSlot && (
        <ManualBookingModal
          slot={selectedSlot}
          onClose={closeManualBooking}
          onSubmit={handleManualBooking}
        />
      )}
    </div>
  );
};

export default OwnerTimeSlots;
