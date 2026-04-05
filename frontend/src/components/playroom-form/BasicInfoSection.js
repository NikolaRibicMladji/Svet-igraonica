import React from "react";

const BasicInfoSection = ({ formData, handleChange }) => {
  return (
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
    </div>
  );
};

export default BasicInfoSection;
