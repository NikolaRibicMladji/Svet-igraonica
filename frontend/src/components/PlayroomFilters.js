import React, { useEffect, useMemo, useState } from "react";
import "../styles/PlayroomFilters.css";

const DEFAULT_FILTERS = {
  grad: "svi",
  minCena: "",
  maxCena: "",
  pogodnosti: [],
  minRating: "sve",
  sortBy: "newest",
};

const PlayroomFilters = ({ onFilterChange, initialFilters = {} }) => {
  const mergedInitialFilters = useMemo(
    () => ({
      ...DEFAULT_FILTERS,
      ...initialFilters,
      pogodnosti: Array.isArray(initialFilters?.pogodnosti)
        ? initialFilters.pogodnosti
        : [],
    }),
    [initialFilters],
  );

  const [tempFilters, setTempFilters] = useState(mergedInitialFilters);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    setTempFilters(mergedInitialFilters);
  }, [mergedInitialFilters]);

  const pogodnostiList = [
    { value: "animatori", label: "Animatori", icon: "🎭" },
    { value: "kafic", label: "Kafić", icon: "☕" },
    { value: "parking", label: "Parking", icon: "🅿️" },
    { value: "rodjendani", label: "Rođendani", icon: "🎂" },
    { value: "wifi", label: "Wi-Fi", icon: "📶" },
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
    { value: "4", label: "⭐ 4+" },
    { value: "3", label: "⭐⭐ 3+" },
    { value: "2", label: "⭐⭐⭐ 2+" },
  ];

  const sortOpcije = [
    { value: "newest", label: "🆕 Najnovije prvo" },
    { value: "rating", label: "⭐ Najbolje ocenjene" },
    { value: "price_asc", label: "💰 Cena rastuće" },
    { value: "price_desc", label: "💰 Cena opadajuće" },
  ];

  const handleTempChange = (key, value) => {
    setTempFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handlePriceChange = (key, value) => {
    if (value === "") {
      handleTempChange(key, "");
      return;
    }

    const numericValue = Number(value);
    if (!Number.isNaN(numericValue) && numericValue >= 0) {
      handleTempChange(key, String(numericValue));
    }
  };

  const handlePogodnostToggle = (pogodnost) => {
    setTempFilters((prev) => {
      const alreadySelected = prev.pogodnosti.includes(pogodnost);

      return {
        ...prev,
        pogodnosti: alreadySelected
          ? prev.pogodnosti.filter((p) => p !== pogodnost)
          : [...prev.pogodnosti, pogodnost],
      };
    });
  };

  const handleApply = () => {
    const minCena =
      tempFilters.minCena === "" ? "" : Number(tempFilters.minCena);
    const maxCena =
      tempFilters.maxCena === "" ? "" : Number(tempFilters.maxCena);

    if (minCena !== "" && maxCena !== "" && minCena > maxCena) {
      onFilterChange?.({
        ...tempFilters,
        minCena: maxCena,
        maxCena: minCena,
      });
      return;
    }

    onFilterChange?.({
      ...tempFilters,
      minCena,
      maxCena,
      minRating:
        tempFilters.minRating === "sve" ? "sve" : Number(tempFilters.minRating),
    });
  };

  const handleReset = () => {
    setTempFilters(DEFAULT_FILTERS);
    onFilterChange?.(DEFAULT_FILTERS);
  };

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (tempFilters.grad !== "svi") count++;
    if (tempFilters.minCena !== "") count++;
    if (tempFilters.maxCena !== "") count++;
    if (tempFilters.pogodnosti.length > 0) count++;
    if (tempFilters.minRating !== "sve") count++;
    if (tempFilters.sortBy !== "newest") count++;
    return count;
  }, [tempFilters]);

  return (
    <div className="filters-container">
      <div className="filters-header">
        <button
          type="button"
          className="filters-title"
          onClick={() => setIsExpanded((prev) => !prev)}
          aria-expanded={isExpanded}
        >
          <span className="filter-icon">🔍</span>
          <span>Filteri</span>
          {activeFiltersCount > 0 && (
            <span className="filter-badge">{activeFiltersCount}</span>
          )}
          <span className={`expand-icon ${isExpanded ? "expanded" : ""}`}>
            ▼
          </span>
        </button>

        {activeFiltersCount > 0 && (
          <button type="button" className="reset-filters" onClick={handleReset}>
            ✖ Resetuj sve
          </button>
        )}
      </div>

      {isExpanded && (
        <div className="filters-content">
          <div className="filter-group">
            <label className="filter-label">📊 Sortiraj po</label>
            <div className="sort-buttons">
              {sortOpcije.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={`sort-btn ${
                    tempFilters.sortBy === option.value ? "active" : ""
                  }`}
                  onClick={() => handleTempChange("sortBy", option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="filters-row">
            <div className="filter-group">
              <label className="filter-label" htmlFor="filter-grad">
                📍 Grad
              </label>
              <select
                id="filter-grad"
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

            <div className="filter-group">
              <label className="filter-label" htmlFor="filter-ocena">
                ⭐ Ocena
              </label>
              <select
                id="filter-ocena"
                value={String(tempFilters.minRating)}
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

          <div className="filter-group">
            <label className="filter-label">💰 Cena po detetu (RSD)</label>
            <div className="price-range">
              <input
                type="number"
                min="0"
                placeholder="Min"
                value={tempFilters.minCena}
                onChange={(e) => handlePriceChange("minCena", e.target.value)}
                className="price-input"
              />
              <span className="price-separator">-</span>
              <input
                type="number"
                min="0"
                placeholder="Max"
                value={tempFilters.maxCena}
                onChange={(e) => handlePriceChange("maxCena", e.target.value)}
                className="price-input"
              />
            </div>
          </div>

          <div className="filter-group">
            <label className="filter-label">🎪 Pogodnosti</label>
            <div className="pogodnosti-grid">
              {pogodnostiList.map((pog) => (
                <button
                  key={pog.value}
                  type="button"
                  className={`pogodnost-btn ${
                    tempFilters.pogodnosti.includes(pog.value) ? "active" : ""
                  }`}
                  onClick={() => handlePogodnostToggle(pog.value)}
                >
                  <span className="pogodnost-icon">{pog.icon}</span>
                  <span className="pogodnost-label">{pog.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="filter-actions">
            <button type="button" className="btn-apply" onClick={handleApply}>
              ✅ Primeni filtere
            </button>
            <button
              type="button"
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
