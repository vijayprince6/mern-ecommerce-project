import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import './Cart.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const Cart = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchCart();
  }, [isAuthenticated, navigate]);

  const fetchCart = async () => {
    try {
      const response = await axios.get(`${API_URL}/cart`);
      setCart(response.data);
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      await axios.put(`${API_URL}/cart/${itemId}`, { quantity: newQuantity });
      fetchCart();
    } catch (error) {
      toast.error('Failed to update quantity');
    }
  };

  const removeItem = async (itemId) => {
    try {
      await axios.delete(`${API_URL}/cart/${itemId}`);
      // Refresh cart count in navbar
      window.dispatchEvent(new Event('cartUpdated'));
      fetchCart();
    } catch (error) {
      toast.error('Failed to remove item');
    }
  };

  const calculateTotal = () => {
    if (!cart || !cart.items) return 0;
    return cart.items.reduce((total, item) => {
      return total + (item.product.price * item.quantity);
    }, 0);
  };

  const handleBuy = async () => {
    try {
      // Create order
      const orderItems = cart.items.map(item => ({
        product: item.product._id,
        name: item.product.name,
        quantity: item.quantity,
        price: item.product.price,
        image: item.product.image
      }));

      const orderData = {
        orderItems,
        shippingAddress: {
          street: 'Default',
          city: 'Default',
          state: 'Default',
          zipCode: '00000',
          country: 'India'
        },
        paymentMethod: 'cash',
        taxPrice: 0,
        shippingPrice: 0
      };

      await axios.post(`${API_URL}/orders`, orderData);
      
      // Clear cart
      await axios.delete(`${API_URL}/cart`);
      
      toast.success('You successfully bought the products!');
      fetchCart();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to place order');
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <div className="cart-page">
        <div className="container">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="cart-page">
        <div className="container">
          <h1 className="page-title">Shopping Cart</h1>
          <div className="empty-cart">
            <p>Your cart is empty</p>
            <Link to="/" className="btn btn-primary">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="container">
        <h1 className="page-title">Shopping Cart</h1>
        <div className="cart-content">
          <div className="cart-items">
            {cart.items.map((item) => (
              <div key={item._id} className="cart-item card">
                <div className="cart-item-image">
                  <img
                    src={item.product.image || 'https://via.placeholder.com/150'}
                    alt={item.product.name}
                  />
                </div>
                <div className="cart-item-info">
                  <h3>{item.product.name}</h3>
                  {item.product.brand && (
                    <p className="cart-item-company">Company: {item.product.brand}</p>
                  )}
                  <p className="cart-item-price">₹{item.product.price}</p>
                  {item.product.stock < item.quantity && (
                    <p className="stock-warning">
                      Only {item.product.stock} available
                    </p>
                  )}
                </div>
                <div className="cart-item-actions">
                  <div className="quantity-controls">
                    <button
                      onClick={() => updateQuantity(item._id, item.quantity - 1)}
                      className="btn-quantity"
                      disabled={item.quantity <= 1}
                    >
                      -
                    </button>
                    <span className="quantity-value">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item._id, item.quantity + 1)}
                      className="btn-quantity"
                      disabled={item.quantity >= item.product.stock}
                    >
                      +
                    </button>
                  </div>
                  <p className="item-total">
                    ₹{(item.product.price * item.quantity).toFixed(2)}
                  </p>
                  <button
                    onClick={() => removeItem(item._id)}
                    className="btn btn-danger btn-sm"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="cart-summary card">
            <h2>Order Summary</h2>
            <div className="summary-row">
              <span>Subtotal:</span>
              <span>₹{calculateTotal().toFixed(2)}</span>
            </div>
            <div className="summary-row total">
              <span>Total:</span>
              <span>₹{calculateTotal().toFixed(2)}</span>
            </div>
            <button onClick={handleBuy} className="btn btn-primary btn-checkout">
              Buy Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
