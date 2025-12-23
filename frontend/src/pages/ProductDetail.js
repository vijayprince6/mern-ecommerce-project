import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import './ProductDetail.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await axios.get(`${API_URL}/products/${id}`);
      setProduct(response.data);
    } catch (error) {
      toast.error('Product not found');
      navigate('/products');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async () => {
    if (!isAuthenticated) {
      if (window.confirm('Please Login/Sign up first. Click OK to go to login page.')) {
        navigate('/login');
      }
      return;
    }

    try {
      await axios.post(`${API_URL}/cart`, {
        productId: id,
        quantity
      });
      // Refresh cart count in navbar
      window.dispatchEvent(new Event('cartUpdated'));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add to cart');
    }
  };

  if (loading) {
    return (
      <div className="product-detail-page">
        <div className="container">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  if (!product) {
    return null;
  }

  return (
    <div className="product-detail-page">
      <div className="container">
        <div className="product-detail">
          <div className="product-detail-image">
            <img src={product.image || 'https://via.placeholder.com/500'} alt={product.name} />
          </div>
          <div className="product-detail-info">
            <h1>{product.name}</h1>
            <p className="product-category">{product.category}</p>
            <div className="product-rating">
              <span>⭐ {product.rating || 0}</span>
              <span>({product.numReviews || 0} reviews)</span>
            </div>
            <p className="product-price">${product.price}</p>
            <p className="product-description">{product.description}</p>
            
            {product.brand && (
              <p className="product-brand"><strong>Brand:</strong> {product.brand}</p>
            )}

            <div className="product-stock-info">
              {product.stock > 0 ? (
                <span className="stock-available">✓ In Stock ({product.stock} available)</span>
              ) : (
                <span className="stock-unavailable">✗ Out of Stock</span>
              )}
            </div>

            {product.stock > 0 && (
              <div className="product-actions">
                <div className="quantity-selector">
                  <label>Quantity:</label>
                  <div className="quantity-controls">
                    <button
                      onClick={() => setQuantity(q => Math.max(1, q - 1))}
                      className="btn-quantity"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 1;
                        setQuantity(Math.min(product.stock, Math.max(1, val)));
                      }}
                      min="1"
                      max={product.stock}
                      className="quantity-input"
                    />
                    <button
                      onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                      className="btn-quantity"
                    >
                      +
                    </button>
                  </div>
                </div>
                <button onClick={addToCart} className="btn btn-primary btn-add-cart">
                  Add to Cart
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;

