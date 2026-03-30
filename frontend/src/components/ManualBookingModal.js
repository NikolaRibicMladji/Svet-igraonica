import React, { useState } from "react";
import "../styles/ManualBookingModal.css";

const ManualBookingModal = ({ onClose, slot, onSubmit }) => {
  const [brojDece, setBrojDece] = useState(1);
  const [napomena, setNapomena] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!slot) return null;

  const maxDece = slot.slobodno || slot.maxDece || 20;
  const ukupnaCena = (slot.cena || 0) * brojDece;

  const handleConfirm = async () => {
    if (!brojDece || brojDece < 1) {
      setError("Broj dece mora biti najmanje 1");
      return;
    }

    if (brojDece > maxDece) {
      setError(`Maksimalan broj dece za ovaj termin je ${maxDece}`);
      return;
    }

    setLoading(true);
    setError("");

    await onSubmit({
      brojDece,
      napomena,
    });

    setLoading(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>📝 Ručna rezervacija</h2>
          <button className="modal-close" onClick={onClose}>
            ✖
          </button>
        </div>

        <div className="modal-body">
          <div className="booking-summary">
            <p>
              <strong>Datum:</strong>{" "}
              {new Date(slot.datum).toLocaleDateString("sr-RS")}
            </p>
            <p>
              <strong>Termin:</strong> {slot.vremeOd} - {slot.vremeDo}
            </p>
            <p>
              <strong>Cena po detetu:</strong> {slot.cena} RSD
            </p>
            <p>
              <strong>Slobodnih mesta:</strong> {maxDece}
            </p>
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label>👶 Broj dece</label>
            <input
              type="number"
              min="1"
              max={maxDece}
              value={brojDece}
              onChange={(e) =>
                setBrojDece(Math.max(1, parseInt(e.target.value) || 1))
              }
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label>📝 Napomena (opciono)</label>
            <textarea
              rows="3"
              value={napomena}
              onChange={(e) => setNapomena(e.target.value)}
              placeholder="Npr. alergije, posebni zahtevi, kontakt telefon roditelja..."
              className="form-textarea"
            />
          </div>

          <div className="total-price">
            <span>Ukupno:</span>
            <strong>{ukupnaCena} RSD</strong>
          </div>
        </div>

        <div className="modal-footer">
          <button
            className="btn-secondary"
            onClick={onClose}
            disabled={loading}
          >
            Otkaži
          </button>
          <button
            className="btn-primary"
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading ? "Rezervišem..." : "✅ Potvrdi rezervaciju"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManualBookingModal;
