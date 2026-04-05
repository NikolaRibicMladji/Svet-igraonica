import React from "react";

const WorkingHoursSection = ({
  dani,
  radnoVreme,
  toggleDan,
  handleRadnoVremeChange,
}) => {
  return (
    <div className="form-section">
      <h3>⏰ Radno vreme</h3>

      {dani.map((dan) => (
        <div key={dan.key} className="radno-vreme-row">
          <label className="dan-checkbox">
            <input
              type="checkbox"
              checked={Boolean(radnoVreme[dan.key]?.radi)}
              onChange={() => toggleDan(dan.key)}
            />
            <span className="dan-naziv">{dan.naziv}</span>
          </label>

          {radnoVreme[dan.key]?.radi ? (
            <div className="vreme-inputs">
              <input
                type="time"
                value={radnoVreme[dan.key]?.od || "09:00"}
                onChange={(e) =>
                  handleRadnoVremeChange(dan.key, "od", e.target.value)
                }
                className="time-input"
              />
              <span className="time-separator">-</span>
              <input
                type="time"
                value={radnoVreme[dan.key]?.do || "20:00"}
                onChange={(e) =>
                  handleRadnoVremeChange(dan.key, "do", e.target.value)
                }
                className="time-input"
              />
            </div>
          ) : (
            <span className="closed-text">Zatvoreno</span>
          )}
        </div>
      ))}
    </div>
  );
};

export default WorkingHoursSection;
