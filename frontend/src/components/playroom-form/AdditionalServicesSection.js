import React from "react";

const AdditionalServicesSection = ({
  novaUsluga,
  setNovaUsluga,
  dodatneUsluge,
  handleAddUsluga,
  handleRemoveUsluga,
}) => {
  return (
    <div className="form-section">
      <h3>
        🎪 Dodatne usluge{" "}
        <span className="input-recommendation">
          (npr. animator, fotograf, maskota...)
        </span>
      </h3>

      <div className="dynamic-input">
        <div className="add-item">
          <input
            type="text"
            placeholder="Naziv usluge"
            value={novaUsluga.naziv}
            onChange={(e) =>
              setNovaUsluga((prev) => ({ ...prev, naziv: e.target.value }))
            }
          />

          <input
            type="number"
            min="0"
            placeholder="Cena (RSD)"
            value={novaUsluga.cena}
            onChange={(e) =>
              setNovaUsluga((prev) => ({ ...prev, cena: e.target.value }))
            }
          />

          <select
            value={novaUsluga.tip}
            onChange={(e) =>
              setNovaUsluga((prev) => ({ ...prev, tip: e.target.value }))
            }
          >
            <option value="fiksno">Fiksna cena</option>
            <option value="po_osobi">Cena po osobi</option>
            <option value="po_satu">Cena po satu</option>
          </select>

          <input
            type="text"
            placeholder="Opis"
            value={novaUsluga.opis}
            onChange={(e) =>
              setNovaUsluga((prev) => ({ ...prev, opis: e.target.value }))
            }
          />

          <button type="button" onClick={handleAddUsluga}>
            + Dodaj
          </button>
        </div>

        {dodatneUsluge.length > 0 && (
          <div className="items-list">
            {dodatneUsluge.map((item, idx) => (
              <div key={`${item.naziv}-${idx}`} className="item">
                <span>
                  <strong>{item.naziv}</strong> - {item.cena} RSD
                </span>
                <span className="item-type">
                  {item.tip === "po_osobi"
                    ? "(po osobi)"
                    : item.tip === "po_satu"
                      ? "(po satu)"
                      : "(fiksno)"}
                </span>
                {item.opis && <span className="item-opis">({item.opis})</span>}
                <button type="button" onClick={() => handleRemoveUsluga(idx)}>
                  ✖
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdditionalServicesSection;
