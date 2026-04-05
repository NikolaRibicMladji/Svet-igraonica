import React from "react";

const SocialLinksSection = ({ drustveneMreze, handleDrustveneMrezeChange }) => {
  return (
    <div className="form-section">
      <h3>🌐 Društvene mreže</h3>
      <p className="section-hint">Dodaj linkove ka profilima ili sajtu.</p>

      <div className="form-group">
        <label>📸 Instagram</label>
        <input
          type="url"
          name="instagram"
          value={drustveneMreze.instagram}
          onChange={handleDrustveneMrezeChange}
          placeholder="https://www.instagram.com/vas_profil/"
        />
      </div>

      <div className="form-group">
        <label>📘 Facebook</label>
        <input
          type="url"
          name="facebook"
          value={drustveneMreze.facebook}
          onChange={handleDrustveneMrezeChange}
          placeholder="https://www.facebook.com/vas_profil/"
        />
      </div>

      <div className="form-group">
        <label>🎵 TikTok</label>
        <input
          type="url"
          name="tiktok"
          value={drustveneMreze.tiktok}
          onChange={handleDrustveneMrezeChange}
          placeholder="https://www.tiktok.com/@vas_profil"
        />
      </div>

      <div className="form-group">
        <label>🌐 Veb sajt</label>
        <input
          type="url"
          name="website"
          value={drustveneMreze.website}
          onChange={handleDrustveneMrezeChange}
          placeholder="https://www.vas-sajt.com"
        />
      </div>
    </div>
  );
};

export default SocialLinksSection;
