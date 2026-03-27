import React, { useState, useEffect } from "react";
import "../styles/ImageModal.css";

const ImageModal = ({ images, currentIndex, onClose }) => {
  const [index, setIndex] = useState(currentIndex);

  useEffect(() => {
    setIndex(currentIndex);
  }, [currentIndex]);

  const handlePrev = () => {
    setIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const handleNext = () => {
    setIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  };

  const handleKeyDown = (e) => {
    if (e.key === "ArrowLeft") handlePrev();
    if (e.key === "ArrowRight") handleNext();
    if (e.key === "Escape") onClose();
  };

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [index]);

  if (!images || images.length === 0) return null;

  return (
    <div className="image-modal-overlay" onClick={onClose}>
      <div className="image-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>
          ✖
        </button>

        <button className="modal-nav prev" onClick={handlePrev}>
          ❮
        </button>

        <div className="modal-image-container">
          <img src={images[index].url} alt={`Slika ${index + 1}`} />
          <div className="image-counter">
            {index + 1} / {images.length}
          </div>
        </div>

        <button className="modal-nav next" onClick={handleNext}>
          ❯
        </button>
      </div>
    </div>
  );
};

export default ImageModal;
