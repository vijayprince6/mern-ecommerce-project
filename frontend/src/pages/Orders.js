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

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchOrders();
  }, [isAuthenticated, navigate]);

  const fetchOrders = async () => {
    try {
      // Fetch existing orders (chronologically sorted by backend)
      const ordersResponse = await axios.get(`${API_URL}/orders`);
      setOrders(ordersResponse.data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
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
        <h1 className="page-title">Purchase History</h1>

        {orders.length === 0 ? (
          <div className="empty-orders">
            <p>You have no purchase history yet</p>
            <Link to="/" className="btn btn-primary">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map((order, orderIndex) => {
              const orderDate = new Date(order.createdAt);
              const formattedDate = orderDate.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              });

              return (
                <div key={order._id} className="order-card card">
                  <div className="order-header">
                    <div>
                      <h3>Purchase #{orders.length - orderIndex}</h3>
                      <p className="order-date">
                        <strong>Date:</strong> {formattedDate}
                      </p>
                      <p className="order-id">
                        <strong>Order ID:</strong> {order._id.slice(-8).toUpperCase()}
                      </p>
                    </div>
                    <div className="order-status">
                      <span className="status-badge">Completed</span>
                    </div>
                  </div>
                  
                  <div className="order-items">
                    <h4>Products Purchased:</h4>
                    {order.orderItems && order.orderItems.map((item, itemIndex) => {
                      const product = item.product || {};
                      const itemName = item.name || product.name || 'Product';
                      const itemPrice = item.price || product.price || 0;
                      const itemQuantity = item.quantity || 1;
                      const itemImage = item.image || product.image || 'https://via.placeholder.com/80';
                      const itemTotal = itemPrice * itemQuantity;

                      return (
                        <div key={itemIndex} className="order-item">
                          <img
                            src={itemImage}
                            alt={itemName}
                            className="order-item-image"
                            onError={(e) => {
                              e.target.src = 'https://via.placeholder.com/80';
                            }}
                          />
                          <div className="order-item-info">
                            <h4>{itemName}</h4>
                            <p className="order-item-details">
                              <strong>Quantity:</strong> {itemQuantity} | 
                              <strong> Price per unit:</strong> ₹{itemPrice.toFixed(2)} | 
                              <strong> Subtotal:</strong> ₹{itemTotal.toFixed(2)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  <div className="order-footer">
                    <div className="order-summary">
                      <p><strong>Total Items:</strong> {order.totalQuantity || order.orderItems.reduce((sum, item) => sum + (item.quantity || 1), 0)}</p>
                      <p><strong>Payment Method:</strong> {order.paymentMethod || 'COD'}</p>
                    </div>
                    <div className="order-total">
                      <strong>Total Amount: ₹{order.totalPrice?.toFixed(2) || '0.00'}</strong>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;


