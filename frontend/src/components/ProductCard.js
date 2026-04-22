import React from 'react';
import './ProductCard.css';

const ProductCard = ({ product, onAddToCart, onImageClick }) => {
  return (
    <div className="product-card">
      <div className="product-image" onClick={onImageClick}>
        <img
          src={product.img || product.image || 'https://via.placeholder.com/300'}
          alt={product.name}
        />
        <div className="image-overlay">
          <span>Click to view</span>
        </div>
      </div>
      <div className="product-info">
        <h3 className="product-name">{product.name}</h3>
        <p className="product-company">Company: {product.company || product.brand}</p>
        <p className="product-price">₹{product.price}</p>
        <div className="product-actions">
          <button onClick={onAddToCart} className="btn btn-primary btn-add-cart-single">
            <span className="cart-icon">🛒</span>
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
