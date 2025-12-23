import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './Orders.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const Orders = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutData, setCheckoutData] = useState({
    shippingAddress: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    },
    paymentMethod: 'card'
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchOrders();
  }, [isAuthenticated, navigate]);

  const fetchOrders = async () => {
    try {
      const response = await axios.get(`${API_URL}/cart`);
      const cart = response.data;
      
      // If cart has items, show checkout
      if (cart.items && cart.items.length > 0) {
        setShowCheckout(true);
      } else {
        // Fetch existing orders
        const ordersResponse = await axios.get(`${API_URL}/orders`);
        setOrders(ordersResponse.data);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    try {
      const cartResponse = await axios.get(`${API_URL}/cart`);
      const cart = cartResponse.data;

      const orderItems = cart.items.map(item => ({
        product: item.product._id,
        name: item.product.name,
        quantity: item.quantity,
        price: item.product.price,
        image: item.product.image
      }));

      const orderData = {
        orderItems,
        shippingAddress: checkoutData.shippingAddress,
        paymentMethod: checkoutData.paymentMethod,
        taxPrice: 0,
        shippingPrice: 10
      };

      await axios.post(`${API_URL}/orders`, orderData);
      
      // Clear cart
      await axios.delete(`${API_URL}/cart`);
      
      setShowCheckout(false);
      fetchOrders();
      alert('Order placed successfully!');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to place order');
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <div className="orders-page">
        <div className="container">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="orders-page">
      <div className="container">
        <h1 className="page-title">Orders</h1>

        {showCheckout ? (
          <div className="checkout-section card">
            <h2>Checkout</h2>
            <form onSubmit={handleCheckout}>
              <div className="form-group">
                <label>Street Address</label>
                <input
                  type="text"
                  required
                  value={checkoutData.shippingAddress.street}
                  onChange={(e) =>
                    setCheckoutData({
                      ...checkoutData,
                      shippingAddress: {
                        ...checkoutData.shippingAddress,
                        street: e.target.value
                      }
                    })
                  }
                  className="form-control"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>City</label>
                  <input
                    type="text"
                    required
                    value={checkoutData.shippingAddress.city}
                    onChange={(e) =>
                      setCheckoutData({
                        ...checkoutData,
                        shippingAddress: {
                          ...checkoutData.shippingAddress,
                          city: e.target.value
                        }
                      })
                    }
                    className="form-control"
                  />
                </div>
                <div className="form-group">
                  <label>State</label>
                  <input
                    type="text"
                    required
                    value={checkoutData.shippingAddress.state}
                    onChange={(e) =>
                      setCheckoutData({
                        ...checkoutData,
                        shippingAddress: {
                          ...checkoutData.shippingAddress,
                          state: e.target.value
                        }
                      })
                    }
                    className="form-control"
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Zip Code</label>
                  <input
                    type="text"
                    required
                    value={checkoutData.shippingAddress.zipCode}
                    onChange={(e) =>
                      setCheckoutData({
                        ...checkoutData,
                        shippingAddress: {
                          ...checkoutData.shippingAddress,
                          zipCode: e.target.value
                        }
                      })
                    }
                    className="form-control"
                  />
                </div>
                <div className="form-group">
                  <label>Country</label>
                  <input
                    type="text"
                    required
                    value={checkoutData.shippingAddress.country}
                    onChange={(e) =>
                      setCheckoutData({
                        ...checkoutData,
                        shippingAddress: {
                          ...checkoutData.shippingAddress,
                          country: e.target.value
                        }
                      })
                    }
                    className="form-control"
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Payment Method</label>
                <select
                  value={checkoutData.paymentMethod}
                  onChange={(e) =>
                    setCheckoutData({
                      ...checkoutData,
                      paymentMethod: e.target.value
                    })
                  }
                  className="form-control"
                >
                  <option value="card">Credit/Debit Card</option>
                  <option value="cash">Cash on Delivery</option>
                  <option value="paypal">PayPal</option>
                </select>
              </div>
              <button type="submit" className="btn btn-primary btn-block">
                Place Order
              </button>
            </form>
          </div>
        ) : (
          <>
            {orders.length === 0 ? (
              <div className="empty-orders">
                <p>You have no orders yet</p>
                <Link to="/products" className="btn btn-primary">
                  Start Shopping
                </Link>
              </div>
            ) : (
              <div className="orders-list">
                {orders.map((order) => (
                  <div key={order._id} className="order-card card">
                    <div className="order-header">
                      <div>
                        <h3>Order #{order._id.slice(-6)}</h3>
                        <p className="order-date">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="order-status">
                        {order.isPaid ? (
                          <span className="status-paid">Paid</span>
                        ) : (
                          <span className="status-unpaid">Unpaid</span>
                        )}
                        {order.isDelivered && (
                          <span className="status-delivered">Delivered</span>
                        )}
                      </div>
                    </div>
                    <div className="order-items">
                      {order.orderItems.map((item, index) => (
                        <div key={index} className="order-item">
                          <img
                            src={item.image || 'https://via.placeholder.com/80'}
                            alt={item.name}
                            className="order-item-image"
                          />
                          <div className="order-item-info">
                            <h4>{item.name}</h4>
                            <p>
                              {item.quantity} x ${item.price} = $
                              {(item.quantity * item.price).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="order-footer">
                      <div className="order-total">
                        <strong>Total: ${order.totalPrice.toFixed(2)}</strong>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Orders;


