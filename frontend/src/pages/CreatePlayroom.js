import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPlayroom } from "../services/playroomService";
import { useAuth } from "../context/AuthContext";
import "../styles/CreatePlayroom.css";

const CreatePlayroom = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    naziv: "",
    adresa: "",
    grad: "",
    opis: "",
    kontaktTelefon: "",
    kontaktEmail: "",
    kapacitet: "",
    cenovnik: {
      osnovni: "",
      poRoditelju: "",
      produzeno: "",
      vikend: "",
    },
  });

  // Fiksni paketi
  const [fiksniPaketi, setFiksniPaketi] = useState([]);
  const [noviPaket, setNoviPaket] = useState({
    naziv: "",
    cena: "",
    opis: "",
  });

  // OPCIONE POGODNOSTI - vlasnik unosi
  const [opcije, setOpcije] = useState([]);
  const [novaOpcija, setNovaOpcija] = useState({
    naziv: "",
    cena: "",
    opis: "",
    tip: "po_osobi",
  });

  // Besplatne pogodnosti (tekstualne)
  const [pogodnosti, setPogodnosti] = useState([]);
  const [novaPogodnost, setNovaPogodnost] = useState("");

  // Radno vreme
  const [radnoVreme, setRadnoVreme] = useState({
    ponedeljak: { od: "09:00", do: "20:00", radi: true },
    utorak: { od: "09:00", do: "20:00", radi: true },
    sreda: { od: "09:00", do: "20:00", radi: true },
    cetvrtak: { od: "09:00", do: "20:00", radi: true },
    petak: { od: "09:00", do: "20:00", radi: true },
    subota: { od: "10:00", do: "22:00", radi: true },
    nedelja: { od: "10:00", do: "21:00", radi: true },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value,
        },
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleRadnoVremeChange = (dan, tip, value) => {
    setRadnoVreme({
      ...radnoVreme,
      [dan]: {
        ...radnoVreme[dan],
        [tip]: value,
      },
    });
  };

  const toggleDan = (dan) => {
    setRadnoVreme({
      ...radnoVreme,
      [dan]: {
        ...radnoVreme[dan],
        radi: !radnoVreme[dan].radi,
      },
    });
  };

  // Dodavanje fiksnog paketa
  const handleAddPaket = () => {
    if (noviPaket.naziv.trim() && noviPaket.cena) {
      setFiksniPaketi([
        ...fiksniPaketi,
        {
          naziv: noviPaket.naziv.trim(),
          cena: parseInt(noviPaket.cena),
          opis: noviPaket.opis || "",
        },
      ]);
      setNoviPaket({ naziv: "", cena: "", opis: "" });
    }
  };

  const handleRemovePaket = (index) => {
    setFiksniPaketi(fiksniPaketi.filter((_, i) => i !== index));
  };

  // Dodavanje opcione pogodnosti
  const handleAddOpcija = () => {
    if (novaOpcija.naziv.trim() && novaOpcija.cena) {
      setOpcije([
        ...opcije,
        {
          naziv: novaOpcija.naziv.trim(),
          cena: parseInt(novaOpcija.cena),
          opis: novaOpcija.opis || "",
          tip: novaOpcija.tip,
        },
      ]);
      setNovaOpcija({ naziv: "", cena: "", opis: "", tip: "po_osobi" });
    }
  };

  const handleRemoveOpcija = (index) => {
    setOpcije(opcije.filter((_, i) => i !== index));
  };

  // Dodavanje besplatne pogodnosti
  const handleAddPogodnost = () => {
    if (novaPogodnost.trim()) {
      setPogodnosti([...pogodnosti, novaPogodnost.trim()]);
      setNovaPogodnost("");
    }
  };

  const handleRemovePogodnost = (index) => {
    setPogodnosti(pogodnosti.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const playroomData = {
      ...formData,
      kapacitet: parseInt(formData.kapacitet),
      cenovnik: {
        osnovni: parseInt(formData.cenovnik.osnovni),
        poRoditelju: formData.cenovnik.poRoditelju
          ? parseInt(formData.cenovnik.poRoditelju)
          : 0,
        produzeno: formData.cenovnik.produzeno
          ? parseInt(formData.cenovnik.produzeno)
          : 0,
        vikend: formData.cenovnik.vikend
          ? parseInt(formData.cenovnik.vikend)
          : 0,
        fiksniPaketi: fiksniPaketi,
      },
      opcije: opcije,
      pogodnosti: pogodnosti,
      radnoVreme: {},
    };

    for (const [dan, vreme] of Object.entries(radnoVreme)) {
      if (vreme.radi) {
        playroomData.radnoVreme[dan] = { od: vreme.od, do: vreme.do };
      }
    }

    const result = await createPlayroom(playroomData);

    if (result.success) {
      navigate("/manage-playroom");
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  if (user?.role !== "vlasnik" && user?.role !== "admin") {
    return (
      <div className="container">
        <h1>Pristup zabranjen</h1>
        <p>Samo vlasnici igraonica mogu da kreiraju nove igraonice.</p>
      </div>
    );
  }

  const dani = [
    { key: "ponedeljak", naziv: "Ponedeljak" },
    { key: "utorak", naziv: "Utorak" },
    { key: "sreda", naziv: "Sreda" },
    { key: "cetvrtak", naziv: "Četvrtak" },
    { key: "petak", naziv: "Petak" },
    { key: "subota", naziv: "Subota" },
    { key: "nedelja", naziv: "Nedelja" },
  ];

  return (
    <div className="container">
      <div className="form-container create-playroom-form">
        <h2>✨ Dodaj novu igraonicu</h2>
        <p className="form-subtitle">Unesite sve podatke o vašoj igraonici</p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          {/* Osnovni podaci */}
          <div className="form-section">
            <h3>📋 Osnovni podaci</h3>

            <div className="form-group">
              <label>Naziv igraonice *</label>
              <input
                type="text"
                name="naziv"
                value={formData.naziv}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Adresa *</label>
                <input
                  type="text"
                  name="adresa"
                  value={formData.adresa}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Grad *</label>
                <input
                  type="text"
                  name="grad"
                  value={formData.grad}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Opis *</label>
              <textarea
                name="opis"
                rows="4"
                value={formData.opis}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Kontakt telefon *</label>
                <input
                  type="tel"
                  name="kontaktTelefon"
                  value={formData.kontaktTelefon}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Kontakt email *</label>
                <input
                  type="email"
                  name="kontaktEmail"
                  value={formData.kontaktEmail}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Kapacitet (broj dece) *</label>
              <input
                type="number"
                name="kapacitet"
                value={formData.kapacitet}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Cenovnik - detaljno */}
          <div className="form-section">
            <h3>💰 Cenovnik</h3>

            <div className="form-row">
              <div className="form-group">
                <label>Cena po detetu (osnovna) *</label>
                <input
                  type="number"
                  name="cenovnik.osnovni"
                  value={formData.cenovnik.osnovni}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Cena po roditelju (pratilac)</label>
                <input
                  type="number"
                  name="cenovnik.poRoditelju"
                  value={formData.cenovnik.poRoditelju}
                  onChange={handleChange}
                  placeholder="0 = besplatno"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Produženo vreme (po satu)</label>
                <input
                  type="number"
                  name="cenovnik.produzeno"
                  value={formData.cenovnik.produzeno}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>Vikend cena</label>
                <input
                  type="number"
                  name="cenovnik.vikend"
                  value={formData.cenovnik.vikend}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Fiksni paketi */}
            <div className="form-subsection">
              <h4>🎁 Fiksni paketi</h4>
              <p className="section-hint">
                Npr. "Rođendanski paket - 5000 RSD", "Porodični paket - 3000
                RSD"
              </p>

              <div className="fiksni-paketi-input">
                <div className="add-paket">
                  <input
                    type="text"
                    placeholder="Naziv paketa *"
                    value={noviPaket.naziv}
                    onChange={(e) =>
                      setNoviPaket({ ...noviPaket, naziv: e.target.value })
                    }
                  />
                  <input
                    type="number"
                    placeholder="Cena (RSD) *"
                    value={noviPaket.cena}
                    onChange={(e) =>
                      setNoviPaket({ ...noviPaket, cena: e.target.value })
                    }
                  />
                  <input
                    type="text"
                    placeholder="Opis (opciono)"
                    value={noviPaket.opis}
                    onChange={(e) =>
                      setNoviPaket({ ...noviPaket, opis: e.target.value })
                    }
                  />
                  <button type="button" onClick={handleAddPaket}>
                    + Dodaj paket
                  </button>
                </div>
                {fiksniPaketi.length > 0 && (
                  <div className="paketi-list">
                    {fiksniPaketi.map((paket, idx) => (
                      <div key={idx} className="paket-item">
                        <span>
                          <strong>{paket.naziv}</strong> - {paket.cena} RSD
                        </span>
                        {paket.opis && (
                          <span className="paket-opis">({paket.opis})</span>
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemovePaket(idx)}
                        >
                          ✖
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Opcione pogodnosti (roditelj bira) */}
          <div className="form-section">
            <h3>🎪 Opcione pogodnosti (roditelj bira pri rezervaciji)</h3>
            <p className="section-hint">
              Dodajte dodatne sadržaje koje roditelj može da izabere i plati
              dodatno (npr. "Dodatni animator", "Fotografisanje"...)
            </p>

            <div className="opcije-input">
              <div className="add-opcija">
                <input
                  type="text"
                  placeholder="Naziv pogodnosti *"
                  value={novaOpcija.naziv}
                  onChange={(e) =>
                    setNovaOpcija({ ...novaOpcija, naziv: e.target.value })
                  }
                  className="opcija-input-field"
                />
                <input
                  type="number"
                  placeholder="Cena (RSD) *"
                  value={novaOpcija.cena}
                  onChange={(e) =>
                    setNovaOpcija({ ...novaOpcija, cena: e.target.value })
                  }
                  className="opcija-price-field"
                />
                <select
                  value={novaOpcija.tip}
                  onChange={(e) =>
                    setNovaOpcija({ ...novaOpcija, tip: e.target.value })
                  }
                  className="opcija-type-field"
                >
                  <option value="po_osobi">Cena po osobi</option>
                  <option value="fiksno">Fiksna cena</option>
                </select>
                <button
                  type="button"
                  onClick={handleAddOpcija}
                  className="btn-add-opcija"
                >
                  + Dodaj
                </button>
              </div>
              <div className="opcija-opis">
                <input
                  type="text"
                  placeholder="Opis (opciono)"
                  value={novaOpcija.opis}
                  onChange={(e) =>
                    setNovaOpcija({ ...novaOpcija, opis: e.target.value })
                  }
                  className="opcija-desc-field"
                />
              </div>

              {opcije.length > 0 && (
                <div className="opcije-list">
                  {opcije.map((op, index) => (
                    <div key={index} className="opcija-item">
                      <div className="opcija-info">
                        <span className="opcija-name">{op.naziv}</span>
                        <span className="opcija-price">{op.cena} RSD</span>
                        <span className="opcija-type">
                          {op.tip === "po_osobi" ? "(po osobi)" : "(fiksno)"}
                        </span>
                        {op.opis && (
                          <span className="opcija-desc">({op.opis})</span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveOpcija(index)}
                        className="remove-opcija"
                      >
                        ✖
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Besplatne pogodnosti */}
          <div className="form-section">
            <h3>✨ Besplatne pogodnosti</h3>
            <p className="section-hint">
              Dodajte šta vaša igraonica nudi besplatno (npr. "Parking", "WiFi",
              "Igračke"...)
            </p>

            <div className="pogodnosti-input">
              <div className="add-pogodnost">
                <input
                  type="text"
                  placeholder="Naziv pogodnosti"
                  value={novaPogodnost}
                  onChange={(e) => setNovaPogodnost(e.target.value)}
                />
                <button type="button" onClick={handleAddPogodnost}>
                  + Dodaj
                </button>
              </div>

              {pogodnosti.length > 0 && (
                <div className="pogodnosti-list">
                  {pogodnosti.map((pog, index) => (
                    <div key={index} className="pogodnost-item">
                      <span>✓ {pog}</span>
                      <button
                        type="button"
                        onClick={() => handleRemovePogodnost(index)}
                      >
                        ✖
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Radno vreme */}
          <div className="form-section">
            <h3>⏰ Radno vreme</h3>

            {dani.map((dan) => (
              <div key={dan.key} className="radno-vreme-row">
                <label className="dan-checkbox">
                  <input
                    type="checkbox"
                    checked={radnoVreme[dan.key].radi}
                    onChange={() => toggleDan(dan.key)}
                  />
                  <span className="dan-naziv">{dan.naziv}</span>
                </label>
                {radnoVreme[dan.key].radi && (
                  <div className="vreme-inputs">
                    <input
                      type="time"
                      value={radnoVreme[dan.key].od}
                      onChange={(e) =>
                        handleRadnoVremeChange(dan.key, "od", e.target.value)
                      }
                      className="time-input"
                    />
                    <span className="time-separator">-</span>
                    <input
                      type="time"
                      value={radnoVreme[dan.key].do}
                      onChange={(e) =>
                        handleRadnoVremeChange(dan.key, "do", e.target.value)
                      }
                      className="time-input"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn-cancel"
              onClick={() => navigate("/")}
            >
              Otkaži
            </button>
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? "Kreiranje..." : "✅ Kreiraj igraonicu"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePlayroom;
