import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import './Cart.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const Cart = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
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
      const res = await axios.get(`${API_URL}/cart`);
      const cartData = res.data;
      // Handle both old format (array) and new format (object with items)
      setCart(cartData.items || cartData || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId, newQuantity) => {
    try {
      // Limit quantity to 1-10
      const quantity = Math.max(1, Math.min(10, newQuantity));
      await axios.put(`${API_URL}/cart/${itemId}`, { quantity });
      await fetchCart();
      window.dispatchEvent(new Event('cartUpdated'));
    } catch (error) {
      toast.error('Failed to update quantity');
    }
  };

  const removeItem = async (itemId) => {
    try {
      await axios.delete(`${API_URL}/cart/item/${itemId}`);
      await fetchCart();
      window.dispatchEvent(new Event('cartUpdated'));
      toast.success('Item removed from cart');
    } catch (error) {
      toast.error('Failed to remove item');
    }
  };

  const calculateTotal = () => {
    if (!cart || cart.length === 0) return 0;
    return cart.reduce((total, item) => {
      const price = item.product?.price || item.price || 0;
      const qty = item.quantity || 0;
      return total + price * qty;
    }, 0);
  };

  const handleBuy = async () => {
    try {
      // Prepare order items
      const orderItems = cart.map(item => ({
        product: item.product?._id || item.product,
        name: item.product?.name || item.name,
        quantity: item.quantity,
        price: item.product?.price || item.price,
        image: item.product?.image || item.image
      }));

      await axios.post(`${API_URL}/orders`, {
        orderItems
      });
      await axios.delete(`${API_URL}/cart`);
      window.dispatchEvent(new Event('cartUpdated'));
      toast.success('Purchase successful! Your order has been placed.');
      setCart([]);
      setTimeout(() => {
        navigate('/orders');
      }, 1500);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Purchase failed');
    }
  };

  if (loading) return <div className="spinner"></div>;

  const cartItems = cart && cart.length > 0 ? cart : [];

  if (cartItems.length === 0) {
    return (
      <div className="container">
        <h2>Your cart is empty</h2>
        <Link to="/">Continue shopping</Link>
      </div>
    );
  }

  return (
    <div className="container">
      <h1>Shopping Cart</h1>

      {cartItems.map((item) => {
        const product = item.product || item;
        const itemId = item._id;
        const quantity = item.quantity || 1;
        const price = product.price || 0;
        const name = product.name || item.name || 'Product';
        const image = product.image || item.image || 'https://via.placeholder.com/150';

        return (
          <div key={itemId} className="cart-item">
            <img src={image} alt={name} className="cart-item-image" />
            <div className="cart-item-info">
              <h3>{name}</h3>
              <p className="cart-item-price">₹{price}</p>
              <div className="cart-item-quantity">
                <label>Quantity:</label>
                <div className="quantity-controls">
                  <button
                    onClick={() => updateQuantity(itemId, quantity - 1)}
                    className="btn-quantity"
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 1;
                      updateQuantity(itemId, val);
                    }}
                    min="1"
                    max="10"
                    className="quantity-input"
                  />
                  <button
                    onClick={() => updateQuantity(itemId, quantity + 1)}
                    className="btn-quantity"
                    disabled={quantity >= 10}
                  >
                    +
                  </button>
                </div>
              </div>
              <p className="cart-item-subtotal">Subtotal: ₹{(price * quantity).toFixed(2)}</p>
              <button
                onClick={() => removeItem(itemId)}
                className="btn-remove"
              >
                Remove
              </button>
            </div>
          </div>
        );
      })}

      <div className="cart-summary">
        <h2>Total: ₹{calculateTotal().toFixed(2)}</h2>
        <button onClick={handleBuy} className="btn btn-primary btn-buy">
          Buy Now
        </button>
      </div>
    </div>
  );
};

export default Cart;
