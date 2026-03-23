import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import './Payment.css';
import './PaymentEnhanced.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const Payment = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { order, orderItems } = location.state || {};

  const [qrCode, setQrCode] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [cashAmount, setCashAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [qrLoading, setQrLoading] = useState(false);
  const [selectedUpiApp, setSelectedUpiApp] = useState('');
  const [showPaymentApps, setShowPaymentApps] = useState(false);

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

  const generateQRCode = async () => {
    if (!paymentMethod) {
      toast.error('Please select a payment method first');
      return;
    }

    if (paymentMethod === 'UPI') {
      setShowPaymentApps(true);
    }
  };

  const selectUpiApp = (app) => {
    setSelectedUpiApp(app);
    setQrLoading(true);
    
    setTimeout(() => {
      // Generate UPI URL for the selected app
      const upiUrl = generateUpiUrl(app);
      window.open(upiUrl, '_blank');
      setQrLoading(false);
      toast.success(`Opening ${app} for payment...`);
    }, 1000);
  };

  const generateUpiUrl = (app) => {
    const upiId = 'vijayprince6@ybl';
    const amount = order.totalPrice;
    const transactionNote = `Order ${order._id}`;
    
    let baseUrl = '';
    switch(app) {
      case 'PhonePe':
        baseUrl = 'phonepe://';
        break;
      case 'Google Pay':
        baseUrl = 'gpay://';
        break;
      case 'Paytm':
        baseUrl = 'paytmmp://';
        break;
      default:
        baseUrl = 'upi://';
    }
    
    return `${baseUrl}pay?pa=${upiId}&pn=SPORTS LAND&am=${amount}&cu=INR&tn=${transactionNote}`;
  };

  const verifyPayment = async () => {
    if (!paymentMethod) {
      toast.error('Please select a payment method');
      return;
    }

    if (paymentMethod === 'UPI' && !selectedUpiApp) {
      toast.error('Please select a UPI payment app');
      return;
    }

    if (paymentMethod === 'Cash' && (!cashAmount || cashAmount < order.totalPrice)) {
      toast.error('Please enter valid cash amount');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/payment/verify`, {
        orderId: order._id,
        paymentMethod,
        upiApp: paymentMethod === 'UPI' ? selectedUpiApp : undefined,
        cashAmount: paymentMethod === 'Cash' ? parseFloat(cashAmount) : undefined
      });

      toast.success('Payment verified successfully! Order confirmed.');
      setTimeout(() => {
        navigate('/delivery-details', { 
          state: { 
            order: response.data.order
          } 
        });
      }, 1500);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Payment verification failed');
    } finally {
      setLoading(false);
    }
  };

  if (!order) {
    return <div className="container"><p>Loading...</p></div>;
  }

  return (
    <div className="payment-page">
      <div className="container">
        <h1 className="page-title">Complete Your Payment</h1>
        
        <div className="payment-container">
          <div className="order-summary">
            <h2>Order Summary</h2>
            <div className="order-items">
              {orderItems.map((item, index) => (
                <div key={index} className="order-item">
                  <img src={item.image} alt={item.name} className="item-image" />
                  <div className="item-details">
                    <h4>{item.name}</h4>
                    <p>Quantity: {item.quantity} × ₹{item.price}</p>
                  </div>
                  <div className="item-total">
                    ₹{(item.quantity * item.price).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
            <div className="total-amount">
              <h3>Total Amount: ₹{order.totalPrice.toFixed(2)}</h3>
              <div className="amount-display">
                <span className="amount-label">Payable Amount:</span>
                <span className="amount-value">₹{order.totalPrice.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="payment-methods">
            <h2>Select Payment Method</h2>
            <div className="payment-options">
              <button
                className={`payment-option ${paymentMethod === 'UPI' ? 'active' : ''}`}
                onClick={() => {
                  setPaymentMethod('UPI');
                  setQrCode('');
                }}
              >
                <div className="payment-icon">📱</div>
                <div className="payment-info">
                  <h3>UPI Payment</h3>
                  <p>Scan QR code with any UPI app</p>
                </div>
              </button>

              <button
                className={`payment-option ${paymentMethod === 'Cash' ? 'active' : ''}`}
                onClick={() => {
                  setPaymentMethod('Cash');
                  setQrCode('');
                }}
              >
                <div className="payment-icon">💵</div>
                <div className="payment-info">
                  <h3>Cash on Delivery</h3>
                  <p>Pay when you receive your order</p>
                </div>
              </button>
            </div>

            {paymentMethod === 'UPI' && (
              <div className="upi-payment">
                <button
                  onClick={generateQRCode}
                  disabled={qrLoading}
                  className="btn btn-primary generate-qr-btn"
                >
                  {qrLoading ? 'Processing...' : 'Select UPI App'}
                </button>

                {showPaymentApps && (
                  <div className="upi-apps-section">
                    <h3>Pay ₹{order.totalPrice.toFixed(2)} using:</h3>
                    <div className="upi-apps-grid">
                      <button
                        className={`upi-app-btn ${selectedUpiApp === 'PhonePe' ? 'selected' : ''}`}
                        onClick={() => selectUpiApp('PhonePe')}
                        disabled={qrLoading}
                      >
                        <div className="app-icon phonepe">📱</div>
                        <div className="app-name">PhonePe</div>
                        <div className="app-amount">₹{order.totalPrice.toFixed(2)}</div>
                      </button>
                      <button
                        className={`upi-app-btn ${selectedUpiApp === 'Google Pay' ? 'selected' : ''}`}
                        onClick={() => selectUpiApp('Google Pay')}
                        disabled={qrLoading}
                      >
                        <div className="app-icon gpay">💳</div>
                        <div className="app-name">Google Pay</div>
                        <div className="app-amount">₹{order.totalPrice.toFixed(2)}</div>
                      </button>
                      <button
                        className={`upi-app-btn ${selectedUpiApp === 'Paytm' ? 'selected' : ''}`}
                        onClick={() => selectUpiApp('Paytm')}
                        disabled={qrLoading}
                      >
                        <div className="app-icon paytm">🔷</div>
                        <div className="app-name">Paytm</div>
                        <div className="app-amount">₹{order.totalPrice.toFixed(2)}</div>
                      </button>
                    </div>
                    {selectedUpiApp && (
                      <div className="selected-app-info">
                        <p>✅ Selected: {selectedUpiApp}</p>
                        <p>📱 Click the QR code to open {selectedUpiApp}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {paymentMethod === 'Cash' && (
              <div className="cash-payment">
                <div className="cash-input">
                  <label>Enter exact amount: ₹{order.totalPrice.toFixed(2)}</label>
                  <input
                    type="number"
                    value={cashAmount}
                    onChange={(e) => setCashAmount(e.target.value)}
                    placeholder={`Enter exact amount: ₹${order.totalPrice.toFixed(2)}`}
                    className="form-control"
                    min={order.totalPrice}
                    step="0.01"
                  />
                </div>
                <p className="cash-instructions">
                  Please enter the exact amount to complete your order
                </p>
              </div>
            )}

            {paymentMethod && (
              <button
                onClick={verifyPayment}
                disabled={loading}
                className="btn btn-success verify-payment-btn"
              >
                {loading ? 'Verifying...' : 'Verify Payment'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;
