import React from 'react';
import './ImageModal.css';

const ImageModal = ({ image, onClose }) => {
  if (!image) return null;

  return (
    <div className="image-modal-overlay" onClick={onClose}>
      <div className="image-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="image-modal-close" onClick={onClose}>×</button>
        <img src={image} alt="Product" className="image-modal-image" />
      </div>
    </div>
  );
};

export default ImageModal;


