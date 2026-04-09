import React from "react";

const PackagesSection = ({
  noviPaket,
  setNoviPaket,
  paketi,
  handleAddPaket,
  handleRemovePaket,
}) => {
  return (
    <div className="form-section">
      <h3>
        🎁 Paketi{" "}
        <span className="input-recommendation">
          (npr. porodični, rođendanski, VIP...)
        </span>
      </h3>

      <div className="dynamic-input">
        <div className="add-item">
          <input
            type="text"
            placeholder="Naziv paketa"
            value={noviPaket.naziv}
            onChange={(e) =>
              setNoviPaket((prev) => ({ ...prev, naziv: e.target.value }))
            }
          />

          <input
            type="number"
            min="0"
            placeholder="Cena (RSD)"
            value={noviPaket.cena}
            onChange={(e) =>
              setNoviPaket((prev) => ({ ...prev, cena: e.target.value }))
            }
          />
          <select
            value={noviPaket.tip}
            onChange={(e) =>
              setNoviPaket((prev) => ({ ...prev, tip: e.target.value }))
            }
          >
            <option value="fiksno">Fiksna cena</option>
            <option value="po_osobi">Cena po osobi</option>
            <option value="po_satu">Cena po satu</option>
          </select>

          <input
            type="text"
            placeholder="Opis"
            value={noviPaket.opis}
            onChange={(e) =>
              setNoviPaket((prev) => ({ ...prev, opis: e.target.value }))
            }
          />

          <button type="button" onClick={handleAddPaket}>
            + Dodaj paket
          </button>
        </div>

        {paketi.length > 0 && (
          <div className="items-list">
            {paketi.map((item, idx) => (
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

                <button type="button" onClick={() => handleRemovePaket(idx)}>
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

export default PackagesSection;
