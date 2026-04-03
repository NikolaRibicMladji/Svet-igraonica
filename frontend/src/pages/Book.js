import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getTimeSlots, createBooking } from "../services/bookingService";
import { getPlayroomById } from "../services/playroomService";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import "../styles/Book.css";

const Book = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  const bookingFormRef = useRef(null);
  const topRef = useRef(null);

  const [playroom, setPlayroom] = useState(null);
  const [timeSlots, setTimeSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);

  const [brojDece, setBrojDece] = useState("");
  const [brojRoditelja, setBrojRoditelja] = useState("");
  const [napomena, setNapomena] = useState("");

  const [loading, setLoading] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });

  const [selectedUsluge, setSelectedUsluge] = useState([]);
  const [selectedOstaleCene, setSelectedOstaleCene] = useState([]);

  const [korisnikPodaci, setKorisnikPodaci] = useState({
    ime: "",
    prezime: "",
    email: "",
    telefon: "",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (!authLoading && isAuthenticated && user) {
      setKorisnikPodaci((prev) => ({
        ...prev,
        ime: user.ime || prev.ime || "",
        prezime: user.prezime || prev.prezime || "",
        email: user.email || prev.email || "",
        telefon: user.telefon || prev.telefon || "",
        password: "",
        confirmPassword: "",
      }));
    }
  }, [authLoading, isAuthenticated, user]);

  useEffect(() => {
    loadPlayroom();
  }, [id]);

  useEffect(() => {
    if (playroom?._id) {
      loadTimeSlots();
    }
  }, [playroom?._id, selectedDate]);

  const loadPlayroom = async () => {
    setLoading(true);
    setError("");

    try {
      const result = await getPlayroomById(id);

      if (result?.success) {
        setPlayroom(result.data);
      } else {
        setError(result?.error || "Greška pri učitavanju igraonice.");
      }
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Greška pri učitavanju igraonice.",
      );
    } finally {
      setLoading(false);
    }
  };

  const loadTimeSlots = async () => {
    setLoadingSlots(true);
    setError("");
    setSelectedSlot(null);
    setSelectedUsluge([]);
    setSelectedOstaleCene([]);

    try {
      const result = await getTimeSlots(id, selectedDate);

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
      setLoadingSlots(false);
    }
  };

  const scrollToBookingForm = () => {
    setTimeout(() => {
      if (bookingFormRef.current) {
        bookingFormRef.current.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    }, 150);
  };

  const scrollToTop = () => {
    setTimeout(() => {
      if (topRef.current) {
        topRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }, 100);
  };

  const toggleUsluga = (usluga) => {
    setSelectedUsluge((prev) => {
      const exists = prev.some((u) => u.naziv === usluga.naziv);
      return exists
        ? prev.filter((u) => u.naziv !== usluga.naziv)
        : [...prev, usluga];
    });
  };

  const toggleOstalaCena = (cena) => {
    setSelectedOstaleCene((prev) => {
      const exists = prev.some((c) => c.naziv === cena.naziv);
      return exists
        ? prev.filter((c) => c.naziv !== cena.naziv)
        : [...prev, cena];
    });
  };

  const brojDeceNum = brojDece === "" ? 0 : Number(brojDece);
  const brojRoditeljaNum = brojRoditelja === "" ? 0 : Number(brojRoditelja);
  const ukupnoOsoba = brojDeceNum + brojRoditeljaNum;

  const cenaPoDetetu = Number(selectedSlot?.cena || playroom?.osnovnaCena || 0);

  const cenaRoditelji = useMemo(() => {
    if (
      !playroom?.cenaRoditelja ||
      playroom.cenaRoditelja.tip === "ne_naplacuje"
    ) {
      return 0;
    }

    const iznos = Number(playroom.cenaRoditelja.iznos || 0);

    if (playroom.cenaRoditelja.tip === "fiksno") {
      return brojRoditeljaNum > 0 ? iznos : 0;
    }

    if (playroom.cenaRoditelja.tip === "po_osobi") {
      return iznos * brojRoditeljaNum;
    }

    return 0;
  }, [playroom, brojRoditeljaNum]);

  const ukupnaCena = useMemo(() => {
    const osnovna = cenaPoDetetu * brojDeceNum;

    const ostaleCene = selectedOstaleCene.reduce((sum, c) => {
      const cena = Number(c.cena || 0);
      return sum + (c.tip === "po_osobi" ? cena * ukupnoOsoba : cena);
    }, 0);

    const usluge = selectedUsluge.reduce((sum, u) => {
      const cena = Number(u.cena || 0);
      return sum + (u.tip === "po_osobi" ? cena * ukupnoOsoba : cena);
    }, 0);

    return osnovna + cenaRoditelji + ostaleCene + usluge;
  }, [
    cenaPoDetetu,
    brojDeceNum,
    cenaRoditelji,
    selectedOstaleCene,
    selectedUsluge,
    ukupnoOsoba,
  ]);

  const maxDece = Number(
    selectedSlot?.slobodno || playroom?.kapacitet?.deca || 30,
  );
  const maxRoditelja = Number(playroom?.kapacitet?.roditelji || 50);

  const handleBook = async () => {
    setError("");

    if (!selectedSlot?._id) {
      setError("Izaberite termin.");
      scrollToTop();
      return;
    }

    if (selectedSlot?.zauzeto || selectedSlot?.slobodno === 0) {
      setError("Termin je zauzet. Izaberite drugi termin.");
      await loadTimeSlots();
      scrollToTop();
      return;
    }

    if (!brojDeceNum || brojDeceNum < 1) {
      setError("Unesite broj dece.");
      scrollToTop();
      return;
    }

    if (brojDeceNum > maxDece) {
      setError(`Maksimalan broj dece za ovaj termin je ${maxDece}.`);
      scrollToTop();
      return;
    }

    if (brojRoditeljaNum < 0) {
      setError("Broj roditelja ne može biti negativan.");
      scrollToTop();
      return;
    }

    if (!korisnikPodaci.ime.trim()) {
      setError("Unesite ime.");
      scrollToTop();
      return;
    }

    if (!korisnikPodaci.prezime.trim()) {
      setError("Unesite prezime.");
      scrollToTop();
      return;
    }

    if (!korisnikPodaci.email.trim()) {
      setError("Unesite email.");
      scrollToTop();
      return;
    }

    if (!korisnikPodaci.telefon.trim()) {
      setError("Unesite telefon.");
      scrollToTop();
      return;
    }

    if (!isAuthenticated) {
      if (!korisnikPodaci.password.trim()) {
        setError("Unesite lozinku.");
        scrollToTop();
        return;
      }

      if (korisnikPodaci.password.trim().length < 6) {
        setError("Lozinka mora imati najmanje 6 karaktera.");
        scrollToTop();
        return;
      }

      if (!korisnikPodaci.confirmPassword.trim()) {
        setError("Potvrdite lozinku.");
        scrollToTop();
        return;
      }

      if (korisnikPodaci.password !== korisnikPodaci.confirmPassword) {
        setError("Lozinke se ne poklapaju.");
        scrollToTop();
        return;
      }
    }

    setSubmitting(true);

    try {
      const bookingPayload = {
        slotId: selectedSlot._id,
        timeSlotId: selectedSlot._id,
        playroomId: id,
        datum: selectedDate,
        vremeOd: selectedSlot.vremeOd,
        vremeDo: selectedSlot.vremeDo,
        brojDece: brojDeceNum,
        brojRoditelja: brojRoditeljaNum,
        napomena: napomena.trim(),
        imeRoditelja: korisnikPodaci.ime.trim(),
        prezimeRoditelja: korisnikPodaci.prezime.trim(),
        emailRoditelja: korisnikPodaci.email.trim().toLowerCase(),
        telefon: korisnikPodaci.telefon.trim(),
        ukupnaCena,
        selectedOstaleCene: selectedOstaleCene.map((c) => ({
          naziv: c.naziv,
          tip: c.tip,
          cena: Number(c.cena || 0),
        })),
        selectedUsluge: selectedUsluge.map((u) => ({
          naziv: u.naziv,
          tip: u.tip,
          cena: Number(u.cena || 0),
        })),
      };

      let result;

      if (isAuthenticated) {
        result = await createBooking(bookingPayload);

        if (result?.success) {
          await loadTimeSlots();
          navigate("/booking-success");
        } else {
          setError(result?.error || "Rezervacija nije uspela.");
          scrollToTop();
        }
      } else {
        const response = await api.post("/bookings/guest", {
          ...bookingPayload,
          password: korisnikPodaci.password,
          confirmPassword: korisnikPodaci.confirmPassword,
          ime: korisnikPodaci.ime.trim(),
          prezime: korisnikPodaci.prezime.trim(),
          email: korisnikPodaci.email.trim().toLowerCase(),
        });

        const accessToken = response?.data?.accessToken;
        const loggedUser = response?.data?.user;

        if (accessToken) {
          localStorage.setItem("accessToken", accessToken);
        }

        if (loggedUser) {
          localStorage.setItem("user", JSON.stringify(loggedUser));
        }

        await loadTimeSlots();

        window.location.href = "/booking-success";
      }
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Rezervacija nije uspela.",
      );
      scrollToTop();
    } finally {
      setSubmitting(false);
    }
  };

  const handleKorisnikChange = (e) => {
    const { name, value } = e.target;
    setKorisnikPodaci((prev) => ({ ...prev, [name]: value }));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("sr-RS", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getSlotStatus = (slot) => {
    if (slot?.zauzeto || slot?.slobodno === 0) {
      return { text: "ZAUZETO", class: "slot-full", disabled: true };
    }

    return { text: "SLOBODNO", class: "slot-free", disabled: false };
  };

  if (loading) {
    return <div className="container loading">Učitavanje...</div>;
  }

  if (!playroom) {
    return (
      <div className="container loading">
        Nije moguće učitati podatke o igraonici.
      </div>
    );
  }

  return (
    <div className="container book-page" ref={topRef}>
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

          {loadingSlots ? (
            <div className="loading-slots">Učitavanje termina...</div>
          ) : timeSlots.length === 0 ? (
            <div className="no-slots">
              <p>😢 Nema dostupnih termina za izabrani datum.</p>
              <p>Molimo izaberite drugi datum.</p>
            </div>
          ) : (
            <div className="slots-grid">
              {timeSlots.map((slot) => {
                const status = getSlotStatus(slot);
                const isSelected = selectedSlot?._id === slot._id;

                return (
                  <div
                    key={slot._id}
                    className={`slot-card ${status.class} ${
                      isSelected ? "selected" : ""
                    }`}
                    onClick={() => {
                      if (!status.disabled) {
                        setSelectedSlot(slot);
                        setError("");
                        scrollToBookingForm();
                      }
                    }}
                  >
                    <div className="slot-time">
                      <span className="time-icon">⏰</span>
                      <span className="time-range">
                        {slot.vremeOd} - {slot.vremeDo}
                      </span>
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

        {selectedSlot && !loadingSlots && timeSlots.length > 0 && (
          <div className="booking-form" ref={bookingFormRef}>
            <h3>Detalji rezervacije</h3>

            <div className="selected-slot-summary">
              <p>📅 Datum: {formatDate(selectedDate)}</p>
              <p>
                ⏰ Vreme: {selectedSlot.vremeOd} - {selectedSlot.vremeDo}
              </p>
              <p>💰 Osnovna cena: {cenaPoDetetu} RSD / dete</p>
            </div>

            <div className="form-group">
              <label>👶 Broj dece *</label>
              <input
                type="number"
                min="1"
                max={maxDece}
                value={brojDece}
                onChange={(e) => {
                  const value = e.target.value;

                  if (value === "") {
                    setBrojDece("");
                    return;
                  }

                  const num = Number(value);
                  if (!Number.isNaN(num) && num >= 1 && num <= maxDece) {
                    setBrojDece(num);
                  }
                }}
                placeholder="Unesite broj dece"
              />
              <small className="price-hint">
                Maksimalno {maxDece} dece za ovaj termin
              </small>
            </div>

            <div className="form-group">
              <label>👨‍👩‍👧 Broj roditelja (pratilaca)</label>
              <input
                type="number"
                min="0"
                max={maxRoditelja}
                value={brojRoditelja}
                onChange={(e) => {
                  const value = e.target.value;

                  if (value === "") {
                    setBrojRoditelja("");
                    return;
                  }

                  const num = Number(value);
                  if (!Number.isNaN(num) && num >= 0 && num <= maxRoditelja) {
                    setBrojRoditelja(num);
                  }
                }}
                placeholder="Unesite broj roditelja"
              />
              <small className="price-hint">
                Maksimalno {maxRoditelja} roditelja
              </small>

              {playroom?.cenaRoditelja &&
                playroom.cenaRoditelja.tip !== "ne_naplacuje" && (
                  <small className="price-hint cena-info">
                    {playroom.cenaRoditelja.tip === "fiksno"
                      ? `Cena: ${playroom.cenaRoditelja.iznos} RSD fiksno`
                      : `Cena: ${playroom.cenaRoditelja.iznos} RSD po roditelju`}
                  </small>
                )}
            </div>

            {Array.isArray(playroom.cene) && playroom.cene.length > 0 && (
              <div className="options-section">
                <h4>💰 Dodatne cene (opciono)</h4>
                <div className="options-grid">
                  {playroom.cene.map((cena, index) => (
                    <div key={`${cena.naziv}-${index}`} className="option-card">
                      <label className="option-checkbox">
                        <input
                          type="checkbox"
                          checked={selectedOstaleCene.some(
                            (c) => c.naziv === cena.naziv,
                          )}
                          onChange={() => toggleOstalaCena(cena)}
                        />
                        <span className="option-name">{cena.naziv}</span>
                        <span className="option-price">+{cena.cena} RSD</span>
                        {cena.tip === "po_osobi" && (
                          <span className="option-type">(po osobi)</span>
                        )}
                      </label>
                      {cena.opis && <p className="option-desc">{cena.opis}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {Array.isArray(playroom.dodatneUsluge) &&
              playroom.dodatneUsluge.length > 0 && (
                <div className="options-section">
                  <h4>🎪 Dodatne usluge (opciono)</h4>
                  <div className="options-grid">
                    {playroom.dodatneUsluge.map((usluga, index) => (
                      <div
                        key={`${usluga.naziv}-${index}`}
                        className="option-card"
                      >
                        <label className="option-checkbox">
                          <input
                            type="checkbox"
                            checked={selectedUsluge.some(
                              (u) => u.naziv === usluga.naziv,
                            )}
                            onChange={() => toggleUsluga(usluga)}
                          />
                          <span className="option-name">{usluga.naziv}</span>
                          <span className="option-price">
                            +{usluga.cena} RSD
                          </span>
                          {usluga.tip === "po_osobi" && (
                            <span className="option-type">(po osobi)</span>
                          )}
                        </label>
                        {usluga.opis && (
                          <p className="option-desc">{usluga.opis}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {Array.isArray(playroom.besplatnePogodnosti) &&
              playroom.besplatnePogodnosti.length > 0 && (
                <div className="free-features-section">
                  <h4>✨ Besplatne pogodnosti</h4>
                  <div className="free-features-list">
                    {playroom.besplatnePogodnosti.map((pog, index) => (
                      <span key={`${pog}-${index}`} className="free-badge">
                        ✓ {pog}
                      </span>
                    ))}
                  </div>
                </div>
              )}

            <div className="user-data-section">
              <div className="user-data-header">
                <h4>👤 Vaši podaci</h4>

                {!isAuthenticated && (
                  <span className="user-info-text">
                    ( Nakon potvrde rezervacije bićete automatski registrovani i
                    prijavljeni )
                  </span>
                )}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Ime *</label>
                  <input
                    type="text"
                    name="ime"
                    value={korisnikPodaci.ime}
                    onChange={handleKorisnikChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Prezime *</label>
                  <input
                    type="text"
                    name="prezime"
                    value={korisnikPodaci.prezime}
                    onChange={handleKorisnikChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={korisnikPodaci.email}
                    onChange={handleKorisnikChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Telefon *</label>
                  <input
                    type="tel"
                    name="telefon"
                    value={korisnikPodaci.telefon}
                    onChange={handleKorisnikChange}
                    required
                  />
                </div>
              </div>

              {!isAuthenticated && (
                <div className="form-row">
                  <div className="form-group">
                    <label>Lozinka *</label>
                    <input
                      type="password"
                      name="password"
                      value={korisnikPodaci.password}
                      onChange={handleKorisnikChange}
                      required={!isAuthenticated}
                    />
                  </div>

                  <div className="form-group">
                    <label>Potvrda lozinke *</label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={korisnikPodaci.confirmPassword}
                      onChange={handleKorisnikChange}
                      required={!isAuthenticated}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="form-group">
              <label>📝 Napomena (opciono)</label>
              <textarea
                rows="3"
                value={napomena}
                onChange={(e) => setNapomena(e.target.value)}
                placeholder="Npr. alergije, posebni zahtevi, dolazak sa kolicima..."
              />
            </div>

            <div className="order-summary">
              <h4>🛒 Pregled rezervacije</h4>

              {brojDeceNum > 0 && (
                <div className="summary-item">
                  <span>
                    {brojDeceNum} dete × {cenaPoDetetu} RSD
                  </span>
                  <span>{brojDeceNum * cenaPoDetetu} RSD</span>
                </div>
              )}

              {brojRoditeljaNum > 0 &&
                playroom?.cenaRoditelja &&
                playroom.cenaRoditelja.tip !== "ne_naplacuje" && (
                  <div className="summary-item">
                    <span>
                      {playroom.cenaRoditelja.tip === "fiksno"
                        ? `${brojRoditeljaNum} roditelj (fiksno)`
                        : `${brojRoditeljaNum} roditelj × ${playroom.cenaRoditelja.iznos} RSD`}
                    </span>
                    <span>+{cenaRoditelji} RSD</span>
                  </div>
                )}

              {selectedOstaleCene.map((c, idx) => {
                const cena = Number(c.cena || 0);
                const ukupno = c.tip === "po_osobi" ? cena * ukupnoOsoba : cena;

                return (
                  <div key={`${c.naziv}-${idx}`} className="summary-item">
                    <span>
                      {c.naziv}
                      {c.tip === "po_osobi" &&
                        ` (${cena} RSD × ${ukupnoOsoba} osoba)`}
                    </span>
                    <span>+{ukupno} RSD</span>
                  </div>
                );
              })}

              {selectedUsluge.map((u, idx) => {
                const cena = Number(u.cena || 0);
                const ukupno = u.tip === "po_osobi" ? cena * ukupnoOsoba : cena;

                return (
                  <div key={`${u.naziv}-${idx}`} className="summary-item">
                    <span>
                      {u.naziv}
                      {u.tip === "po_osobi" &&
                        ` (${cena} RSD × ${ukupnoOsoba} osoba)`}
                    </span>
                    <span>+{ukupno} RSD</span>
                  </div>
                );
              })}

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
              {submitting
                ? "Rezervišem..."
                : !isAuthenticated
                  ? "✅ Registruj me i potvrdi rezervaciju"
                  : "✅ Potvrdi rezervaciju"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Book;
