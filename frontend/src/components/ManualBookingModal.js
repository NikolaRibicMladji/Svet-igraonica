import React, { useEffect, useMemo, useState } from "react";
import "../styles/ManualBookingModal.css";

const formatDate = (datum) => {
  if (!datum) return "-";

  const parsedDate = new Date(datum);
  if (Number.isNaN(parsedDate.getTime())) return "-";

  return parsedDate.toLocaleDateString("sr-RS");
};

const ManualBookingModal = ({ onClose, slot, onSubmit }) => {
  const [brojDece, setBrojDece] = useState(1);
  const [napomena, setNapomena] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const maxDece = useMemo(() => {
    const slobodno = Number(slot?.slobodno);
    const max = Number(slot?.maxDece);

    if (Number.isFinite(slobodno) && slobodno > 0) return slobodno;
    if (Number.isFinite(max) && max > 0) return max;

    return 20;
  }, [slot]);

  const cenaPoDetetu = useMemo(() => {
    const cena = Number(slot?.cena);
    return Number.isFinite(cena) ? cena : 0;
  }, [slot]);

  const ukupnaCena = cenaPoDetetu * brojDece;

  useEffect(() => {
    if (!slot) return;

    setBrojDece(1);
    setNapomena("");
    setError("");
    setLoading(false);
  }, [slot]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape" && !loading) {
        onClose?.();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [loading, onClose]);

  if (!slot) return null;

  const handleConfirm = async () => {
    const broj = Number(brojDece);

    if (!Number.isInteger(broj) || broj < 1) {
      setError("Broj dece mora biti najmanje 1.");
      return;
    }

    if (broj > maxDece) {
      setError(`Maksimalan broj dece za ovaj termin je ${maxDece}.`);
      return;
    }

    setLoading(true);
    setError("");

    try {
      await onSubmit?.({
        brojDece: broj,
        napomena: napomena.trim(),
      });
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Došlo je do greške prilikom ručne rezervacije.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="modal-overlay"
      onClick={!loading ? onClose : undefined}
      role="dialog"
      aria-modal="true"
      aria-label="Ručna rezervacija"
    >
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>📝 Ručna rezervacija</h2>
          <button
            type="button"
            className="modal-close"
            onClick={onClose}
            disabled={loading}
            aria-label="Zatvori prozor"
          >
            ✖
          </button>
        </div>

        <div className="modal-body">
          <div className="booking-summary">
            <p>
              <strong>Datum:</strong> {formatDate(slot.datum)}
            </p>
            <p>
              <strong>Termin:</strong> {slot.vremeOd || "-"} -{" "}
              {slot.vremeDo || "-"}
            </p>
            <p>
              <strong>Cena po detetu:</strong> {cenaPoDetetu} RSD
            </p>
            <p>
              <strong>Slobodnih mesta:</strong> {maxDece}
            </p>
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label htmlFor="manual-booking-broj-dece">👶 Broj dece</label>
            <input
              id="manual-booking-broj-dece"
              type="number"
              min="1"
              max={maxDece}
              value={brojDece}
              onChange={(e) => {
                const value = Number(e.target.value);
                setBrojDece(Number.isFinite(value) && value > 0 ? value : 1);
              }}
              className="form-input"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="manual-booking-napomena">
              📝 Napomena (opciono)
            </label>
            <textarea
              id="manual-booking-napomena"
              rows="3"
              value={napomena}
              onChange={(e) => setNapomena(e.target.value)}
              placeholder="Npr. alergije, posebni zahtevi ili kontakt telefon roditelja."
              className="form-textarea"
              disabled={loading}
            />
          </div>

          <div className="total-price">
            <span>Ukupno:</span>
            <strong>{ukupnaCena} RSD</strong>
          </div>
        </div>

        <div className="modal-footer">
          <button
            type="button"
            className="btn-secondary"
            onClick={onClose}
            disabled={loading}
          >
            Otkaži
          </button>
          <button
            type="button"
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
