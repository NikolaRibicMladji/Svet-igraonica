import React from "react";

const ParentPricingSection = ({ cenaRoditelja, handleCenaRoditeljaChange }) => {
  return (
    <div className="form-section">
      <h3>👨‍👩‍👧 Cena za roditelje</h3>

      <p className="section-hint">
        Odredi da li se naplaćuje ulaz za roditelje.
      </p>

      <div className="form-group">
        <label>Način naplate</label>
        <select
          name="tip"
          value={cenaRoditelja.tip}
          onChange={handleCenaRoditeljaChange}
        >
          <option value="ne_naplacuje">Ne naplaćuje se</option>
          <option value="fiksno">Fiksno (bez obzira na broj roditelja)</option>
          <option value="po_osobi">Po osobi</option>
        </select>
      </div>

      {cenaRoditelja.tip !== "ne_naplacuje" && (
        <div className="form-group">
          <label>Cena (RSD)</label>
          <input
            type="number"
            min="0"
            name="iznos"
            value={cenaRoditelja.iznos}
            onChange={handleCenaRoditeljaChange}
          />
        </div>
      )}
    </div>
  );
};

export default ParentPricingSection;
