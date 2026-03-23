import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import './DeliveryDetails.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const DeliveryDetails = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { order } = location.state || {};

  const [formData, setFormData] = useState({
    name: '',
    phone1: '',
    phone2: '',
    address: '',
    paymentMode: ''
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!order) {
      navigate('/cart');
      return;
    }
  }, [isAuthenticated, navigate, order]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.phone1 || !formData.address || !formData.paymentMode) {
      toast.error('Please fill all required fields');
      return;
    }

    setLoading(true);

    try {
      // Update order with delivery details
      await axios.put(`${API_URL}/orders/${order._id}`, {
        deliveryDetails: formData
      });

      toast.success('Delivery details saved successfully!');
      setTimeout(() => {
        navigate('/orders');
      }, 1500);
    } catch (error) {
      toast.error('Failed to save delivery details');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="delivery-details-page">
      <div className="container">
        <div className="delivery-container">
          <div className="delivery-header">
            <h1>Delivery Details</h1>
            <p>Complete your order by providing delivery information</p>
          </div>

          <div className="order-summary">
            <h3>Order Summary</h3>
            <div className="summary-content">
              <p><strong>Order ID:</strong> {order._id}</p>
              <p><strong>Total Amount:</strong> ₹{order.totalPrice?.toFixed(2) || '0.00'}</p>
              <p><strong>Payment Method:</strong> {order.paymentMethod || 'Not selected'}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="delivery-form">
            <div className="form-row">
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="Enter your full name"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Phone Number 1 *</label>
                <input
                  type="tel"
                  name="phone1"
                  value={formData.phone1}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="Enter primary phone number"
                  pattern="[0-9]{10}"
                  required
                />
              </div>

              <div className="form-group">
                <label>Phone Number 2</label>
                <input
                  type="tel"
                  name="phone2"
                  value={formData.phone2}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="Enter alternate phone number (optional)"
                  pattern="[0-9]{10}"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group full-width">
                <label>Delivery Address *</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="Enter your complete delivery address with landmark"
                  rows="3"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group full-width">
                <label>Payment Mode *</label>
                <div className="payment-options">
                  <label className="payment-option">
                    <input
                      type="radio"
                      name="paymentMode"
                      value="Cash"
                      checked={formData.paymentMode === 'Cash'}
                      onChange={handleChange}
                      required
                    />
                    <span className="radio-label">Cash on Delivery</span>
                  </label>
                  <label className="payment-option">
                    <input
                      type="radio"
                      name="paymentMode"
                      value="UPI"
                      checked={formData.paymentMode === 'UPI'}
                      onChange={handleChange}
                      required
                    />
                    <span className="radio-label">UPI Payment</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="form-actions">
              <button
                type="submit"
                className="btn btn-primary btn-large"
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Complete Order'}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate('/cart')}
              >
                Back to Cart
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DeliveryDetails;
