import React from "react";

const AdditionalPricesSection = ({
  novaCena,
  setNovaCena,
  cene,
  handleAddCena,
  handleRemoveCena,
}) => {
  return (
    <div className="form-section">
      <h3>💰 Ostale cene</h3>

      <div className="dynamic-input">
        <div className="add-item">
          <input
            type="text"
            placeholder="Naziv"
            value={novaCena.naziv}
            onChange={(e) =>
              setNovaCena((prev) => ({ ...prev, naziv: e.target.value }))
            }
          />

          <input
            type="number"
            placeholder="Cena"
            value={novaCena.cena}
            onChange={(e) =>
              setNovaCena((prev) => ({ ...prev, cena: e.target.value }))
            }
          />

          <button type="button" onClick={handleAddCena}>
            + Dodaj
          </button>
        </div>

        {cene.length > 0 && (
          <div className="items-list">
            {cene.map((item, idx) => (
              <div key={idx} className="item">
                <span>
                  {item.naziv} - {item.cena} RSD
                </span>
                <button onClick={() => handleRemoveCena(idx)}>✖</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdditionalPricesSection;
