import React, { useState } from "react";
import "../styles/PlayroomFilters.css";

const PlayroomFilters = ({ onFilterChange, initialFilters }) => {
  const [tempFilters, setTempFilters] = useState({
    grad: initialFilters?.grad || "svi",
    minCena: initialFilters?.minCena || "",
    maxCena: initialFilters?.maxCena || "",
    pogodnosti: initialFilters?.pogodnosti || [],
    minRating: initialFilters?.minRating || "sve",
    sortBy: initialFilters?.sortBy || "newest",
  });

  const [isExpanded, setIsExpanded] = useState(false);

  const pogodnostiList = [
    { value: "animatori", label: "Animatori", icon: "🎭" },
    { value: "kafic", label: "Kafić", icon: "☕" },
    { value: "parking", label: "Parking", icon: "🅿️" },
    { value: "rođendani", label: "Rođendani", icon: "🎂" },
    { value: "wifi", label: "WiFi", icon: "📶" },
    { value: "trampoline", label: "Trampoline", icon: "🤸" },
    { value: "kliziste", label: "Klizalište", icon: "⛸️" },
  ];

  const gradovi = [
    { value: "svi", label: "Svi gradovi" },
    { value: "Beograd", label: "Beograd" },
    { value: "Novi Sad", label: "Novi Sad" },
    { value: "Niš", label: "Niš" },
    { value: "Kragujevac", label: "Kragujevac" },
    { value: "Subotica", label: "Subotica" },
  ];

  const ocene = [
    { value: "sve", label: "Sve ocene" },
    { value: "4", label: "⭐ 4+", icon: "⭐" },
    { value: "3", label: "⭐⭐ 3+", icon: "⭐⭐" },
    { value: "2", label: "⭐⭐⭐ 2+", icon: "⭐⭐⭐" },
  ];

  const sortOpcije = [
    { value: "newest", label: "🆕 Najnovije prvo" },
    { value: "rating", label: "⭐ Najbolje ocenjene" },
    { value: "price_asc", label: "💰 Cena rastuće" },
    { value: "price_desc", label: "💰 Cena opadajuće" },
  ];

  const handleTempChange = (key, value) => {
    setTempFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handlePogodnostToggle = (pogodnost) => {
    const newPogodnosti = tempFilters.pogodnosti.includes(pogodnost)
      ? tempFilters.pogodnosti.filter((p) => p !== pogodnost)
      : [...tempFilters.pogodnosti, pogodnost];

    setTempFilters((prev) => ({ ...prev, pogodnosti: newPogodnosti }));
  };

  const handleApply = () => {
    onFilterChange(tempFilters);
  };

  const handleReset = () => {
    const resetFilters = {
      grad: "svi",
      minCena: "",
      maxCena: "",
      pogodnosti: [],
      minRating: "sve",
      sortBy: "newest",
    };
    setTempFilters(resetFilters);
    onFilterChange(resetFilters);
  };

  const activeFiltersCount = () => {
    let count = 0;
    if (tempFilters.grad !== "svi") count++;
    if (tempFilters.minCena) count++;
    if (tempFilters.maxCena) count++;
    if (tempFilters.pogodnosti.length > 0) count++;
    if (tempFilters.minRating !== "sve") count++;
    return count;
  };

  return (
    <div className="filters-container">
      <div className="filters-header">
        <div
          className="filters-title"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <span className="filter-icon">🔍</span>
          <span>Filteri</span>
          {activeFiltersCount() > 0 && (
            <span className="filter-badge">{activeFiltersCount()}</span>
          )}
          <span className={`expand-icon ${isExpanded ? "expanded" : ""}`}>
            ▼
          </span>
        </div>
        {activeFiltersCount() > 0 && (
          <button className="reset-filters" onClick={handleReset}>
            ✖ Resetuj sve
          </button>
        )}
      </div>

      {isExpanded && (
        <div className="filters-content">
          {/* Sortiranje */}
          <div className="filter-group">
            <label className="filter-label">📊 Sortiraj po</label>
            <div className="sort-buttons">
              {sortOpcije.map((option) => (
                <button
                  key={option.value}
                  className={`sort-btn ${tempFilters.sortBy === option.value ? "active" : ""}`}
                  onClick={() => handleTempChange("sortBy", option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="filters-row">
            {/* Grad */}
            <div className="filter-group">
              <label className="filter-label">📍 Grad</label>
              <select
                value={tempFilters.grad}
                onChange={(e) => handleTempChange("grad", e.target.value)}
                className="filter-select"
              >
                {gradovi.map((g) => (
                  <option key={g.value} value={g.value}>
                    {g.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Ocena */}
            <div className="filter-group">
              <label className="filter-label">⭐ Ocena</label>
              <select
                value={tempFilters.minRating}
                onChange={(e) => handleTempChange("minRating", e.target.value)}
                className="filter-select"
              >
                {ocene.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Cena */}
          <div className="filter-group">
            <label className="filter-label">💰 Cena po detetu (RSD)</label>
            <div className="price-range">
              <input
                type="number"
                placeholder="Min"
                value={tempFilters.minCena}
                onChange={(e) => handleTempChange("minCena", e.target.value)}
                className="price-input"
              />
              <span className="price-separator">-</span>
              <input
                type="number"
                placeholder="Max"
                value={tempFilters.maxCena}
                onChange={(e) => handleTempChange("maxCena", e.target.value)}
                className="price-input"
              />
            </div>
          </div>

          {/* Pogodnosti */}
          <div className="filter-group">
            <label className="filter-label">🎪 Pogodnosti</label>
            <div className="pogodnosti-grid">
              {pogodnostiList.map((pog) => (
                <button
                  key={pog.value}
                  className={`pogodnost-btn ${tempFilters.pogodnosti.includes(pog.value) ? "active" : ""}`}
                  onClick={() => handlePogodnostToggle(pog.value)}
                >
                  <span className="pogodnost-icon">{pog.icon}</span>
                  <span className="pogodnost-label">{pog.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Dugmad za primenu */}
          <div className="filter-actions">
            <button className="btn-apply" onClick={handleApply}>
              ✅ Primeni filtere
            </button>
            <button
              className="btn-cancel-filters"
              onClick={() => setIsExpanded(false)}
            >
              ✖ Zatvori
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlayroomFilters;
