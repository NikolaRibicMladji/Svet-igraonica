import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMyPlayrooms } from "../services/playroomService";
import { getTimeSlots, createBooking } from "../services/bookingService";
import { useAuth } from "../context/AuthContext";
import "../styles/ManageTimeSlots.css";

const monthNames = [
  "Januar",
  "Februar",
  "Mart",
  "April",
  "Maj",
  "Jun",
  "Jul",
  "Avgust",
  "Septembar",
  "Oktobar",
  "Novembar",
  "Decembar",
];

const getTodayString = () => new Date().toISOString().split("T")[0];

const ManageTimeSlots = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [playrooms, setPlayrooms] = useState([]);
  const [selectedPlayroom, setSelectedPlayroom] = useState("");
  const [selectedDate, setSelectedDate] = useState(getTodayString());

  const [timeSlots, setTimeSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [slotsLoading, setSlotsLoading] = useState(false);

  const [selectedSlot, setSelectedSlot] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const [brojDece, setBrojDece] = useState(1);
  const [napomena, setNapomena] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading) {
      loadPlayrooms();
    }
  }, [authLoading]);

  useEffect(() => {
    if (selectedPlayroom) {
      loadTimeSlots();
    }
  }, [selectedPlayroom, selectedDate]);

  const loadPlayrooms = async () => {
    setLoading(true);
    setError("");

    try {
      const result = await getMyPlayrooms();

      if (
        result?.success &&
        Array.isArray(result.data) &&
        result.data.length > 0
      ) {
        setPlayrooms(result.data);
        setSelectedPlayroom((prev) => prev || result.data[0]._id);
      } else {
        setPlayrooms([]);
      }
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Greška pri učitavanju igraonica.",
      );
      setPlayrooms([]);
    } finally {
      setLoading(false);
    }
  };

  const loadTimeSlots = async () => {
    if (!selectedPlayroom) return;

    setSlotsLoading(true);
    setError("");
    setSelectedSlot(null);
    setShowModal(false);

    try {
      const result = await getTimeSlots(selectedPlayroom, selectedDate);

      if (result?.success) {
        setTimeSlots(Array.isArray(result.data) ? result.data : []);
      } else {
        setTimeSlots([]);
        setError(result?.error || "Greška pri učitavanju termina.");
      }
    } catch (err) {
      setTimeSlots([]);
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Greška pri učitavanju termina.",
      );
    } finally {
      setSlotsLoading(false);
    }
  };

  const closeModal = () => {
    if (submitting) return;
    setShowModal(false);
    setSelectedSlot(null);
    setBrojDece(1);
    setNapomena("");
  };

  const handleSlotClick = (slot) => {
    if (!slot || slot.zauzeto) return;

    setSelectedSlot(slot);
    setBrojDece(1);
    setNapomena("");
    setError("");
    setShowModal(true);
  };

  const handleManualBook = async () => {
    if (!selectedSlot?._id) return;

    const broj = Number(brojDece);

    if (!Number.isInteger(broj) || broj < 1) {
      setError("Broj dece mora biti najmanje 1.");
      return;
    }

    {
      setError(`Maksimalan broj dece za ovaj termin je ${maxDece}.`);
      return;
    }

    setSubmitting(true);
    setError("");
    setMessage("");

    try {
      const result = await createBooking({
        slotId: selectedSlot._id,
        timeSlotId: selectedSlot._id,
        playroomId: selectedPlayroom,
        datum: selectedDate,
        vremeOd: selectedSlot.vremeOd,
        vremeDo: selectedSlot.vremeDo,
        brojDece: broj,
        brojRoditelja: 0,
        ime: user?.ime || "Ručna",
        prezime: user?.prezime || "rezervacija",
        email: user?.email || "manual@svetigraonica.local",
        telefon: user?.telefon || "000000",
        napomena: napomena.trim()
          ? `Ručna rezervacija vlasnika: ${napomena.trim()}`
          : "Ručna rezervacija vlasnika",
      });

      if (result?.success) {
        setMessage("Termin je uspešno zauzet.");
        closeModal();
        await loadTimeSlots();

        setTimeout(() => {
          setMessage("");
        }, 3000);
      } else {
        setError(result?.error || "Rezervacija nije uspela.");
      }
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Rezervacija nije uspela.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const getSlotStatus = (slot) => {
    if (slot?.zauzeto) {
      return { text: "ZAUZETO", class: "slot-booked", disabled: true };
    }

    return { text: "SLOBODNO", class: "slot-free", disabled: false };
  };

  const baseDate = useMemo(() => {
    const [year, month] = selectedDate.split("-").map(Number);
    return new Date(year, month - 1, 1);
  }, [selectedDate]);

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const daysInMonth = lastDay.getDate();
    const startWeekday = firstDay.getDay();

    const days = [];

    for (let i = 0; i < (startWeekday === 0 ? 6 : startWeekday - 1); i += 1) {
      days.push(null);
    }

    for (let i = 1; i <= daysInMonth; i += 1) {
      days.push(i);
    }

    return days;
  };

  const getSlotsForDay = (day) => {
    if (!day) return [];

    const year = baseDate.getFullYear();
    const month = String(baseDate.getMonth() + 1).padStart(2, "0");
    const dayString = String(day).padStart(2, "0");
    const dateStr = `${year}-${month}-${dayString}`;

    return timeSlots.filter((slot) => {
      const slotDate = new Date(slot.datum).toISOString().split("T")[0];
      return slotDate === dateStr;
    });
  };

  const hasAvailableSlot = (day) => {
    const slots = getSlotsForDay(day);
    return slots.some((slot) => !slot.zauzeto);
  };

  const isFullyBooked = (day) => {
    const slots = getSlotsForDay(day);
    return slots.length > 0 && slots.every((slot) => slot.zauzeto);
  };

  const changeMonth = (offset) => {
    const current = new Date(baseDate);
    current.setMonth(current.getMonth() + offset);

    const firstDayOfMonth = new Date(
      current.getFullYear(),
      current.getMonth(),
      1,
    );

    setSelectedDate(firstDayOfMonth.toISOString().split("T")[0]);
  };

  if (authLoading || loading) {
    return (
      <div className="container">
        <div className="loading">Učitavanje...</div>
      </div>
    );
  }

  if (user?.role !== "vlasnik" && user?.role !== "admin") {
    return (
      <div className="container">
        <h1>Pristup zabranjen</h1>
        <p>Samo vlasnici igraonica mogu upravljati terminima.</p>
      </div>
    );
  }

  if (playrooms.length === 0) {
    return (
      <div className="container">
        <h1>🏢 Nemate igraonicu</h1>
        <p>Prvo morate dodati igraonicu.</p>
        <button
          type="button"
          className="btn-primary"
          onClick={() => navigate("/create-playroom")}
        >
          + Dodaj igraonicu
        </button>
      </div>
    );
  }

  const currentDate = baseDate;
  const days = getDaysInMonth(currentDate);

  return (
    <div className="container manage-slots-page">
      <div className="manage-slots-header">
        <h1>📅 Upravljanje terminima</h1>

        <div className="playroom-selector">
          <label htmlFor="playroom-select">Izaberite igraonicu:</label>
          <select
            id="playroom-select"
            value={selectedPlayroom}
            onChange={(e) => setSelectedPlayroom(e.target.value)}
          >
            {playrooms.map((p) => (
              <option key={p._id} value={p._id}>
                {p.naziv}
              </option>
            ))}
          </select>
        </div>
      </div>

      {message && <div className="success-message">{message}</div>}
      {error && <div className="error-message">{error}</div>}

      <div className="calendar-container">
        <div className="calendar-header">
          <button
            type="button"
            className="month-nav"
            onClick={() => changeMonth(-1)}
          >
            ◀
          </button>

          <h2>
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>

          <button
            type="button"
            className="month-nav"
            onClick={() => changeMonth(1)}
          >
            ▶
          </button>
        </div>

        <div className="calendar-weekdays">
          <span>Pon</span>
          <span>Uto</span>
          <span>Sre</span>
          <span>Čet</span>
          <span>Pet</span>
          <span>Sub</span>
          <span>Ned</span>
        </div>

        <div className="calendar-days">
          {days.map((day, idx) => {
            if (day === null) {
              return (
                <div key={`empty-${idx}`} className="calendar-day empty"></div>
              );
            }

            const year = currentDate.getFullYear();
            const month = String(currentDate.getMonth() + 1).padStart(2, "0");
            const dayString = String(day).padStart(2, "0");
            const dateStr = `${year}-${month}-${dayString}`;
            const isSelected = selectedDate === dateStr;

            const hasSlots = getSlotsForDay(day).length > 0;
            const isAvailable = hasAvailableSlot(day);
            const isBooked = isFullyBooked(day);

            let dayClass = "calendar-day";
            if (isSelected) dayClass += " selected";
            if (!hasSlots) dayClass += " no-slots";
            else if (isAvailable) dayClass += " available";
            else if (isBooked) dayClass += " booked";

            return (
              <div
                key={dateStr}
                className={dayClass}
                onClick={() => setSelectedDate(dateStr)}
              >
                <span className="day-number">{day}</span>
                {hasSlots && (
                  <div className="day-slots-info">
                    {isAvailable ? "🟢" : isBooked ? "🔴" : "⚪"}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="selected-day-slots">
        <h3>Termini za {new Date(selectedDate).toLocaleDateString("sr-RS")}</h3>

        {slotsLoading ? (
          <div className="loading">Učitavanje termina...</div>
        ) : timeSlots.length === 0 ? (
          <div className="no-slots">
            <p>📭 Nema termina za ovaj dan.</p>
            <p className="hint">
              Igraonica možda ne radi ovog dana ili nema definisane termine.
            </p>
          </div>
        ) : (
          <div className="slots-list">
            {timeSlots.map((slot) => {
              const status = getSlotStatus(slot);

              return (
                <div
                  key={slot._id}
                  className={`slot-card ${status.class}`}
                  onClick={() => !status.disabled && handleSlotClick(slot)}
                >
                  <div className="slot-time">
                    ⏰ {slot.vremeOd} - {slot.vremeDo}
                  </div>

                  <div className="slot-info">
                    <span>💰 {slot.cena} RSD</span>
                  </div>

                  <div className={`slot-status ${status.class}`}>
                    {status.text}
                  </div>

                  {status.disabled && (
                    <div className="slot-booked-info">Rezervisano</div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showModal && selectedSlot && (
        <div className="booking-modal" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>📝 Ručna rezervacija</h3>
              <button
                type="button"
                className="close-btn"
                onClick={closeModal}
                disabled={submitting}
              >
                ✖
              </button>
            </div>

            <div className="modal-body">
              <p>
                <strong>Termin:</strong> {selectedSlot.vremeOd} -{" "}
                {selectedSlot.vremeDo}
              </p>

              <p>
                <strong>Cena:</strong> {selectedSlot.cena} RSD
              </p>

              <div className="form-group">
                <label htmlFor="manual-booking-broj-dece">👶 Broj dece</label>
                <input
                  id="manual-booking-broj-dece"
                  type="number"
                  min="1"
                  value={brojDece}
                  onChange={(e) => {
                    const value = Number(e.target.value);

                    setBrojDece(
                      Number.isFinite(value) && value > 0
                        ? Math.min(max, value)
                        : 1,
                    );
                  }}
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
                  placeholder="Unesite dodatne informacije"
                />
              </div>

              <div className="price-summary">
                <span>Ukupno:</span>
                <strong>
                  {Number(brojDece) * Number(selectedSlot.cena || 0)} RSD
                </strong>
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn-cancel"
                onClick={closeModal}
                disabled={submitting}
              >
                Otkaži
              </button>

              <button
                type="button"
                className="btn-confirm"
                onClick={handleManualBook}
                disabled={submitting}
              >
                {submitting ? "Rezervišem..." : "✅ Zauzmi termin"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageTimeSlots;
