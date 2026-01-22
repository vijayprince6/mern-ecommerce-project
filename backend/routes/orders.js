// backend/routes/orders.js
import express from 'express';
import Order from '../models/Order.js';
import { auth } from '../middleware/auth.js'; // ✅ named import

const router = express.Router();

// Create a new order
router.post('/', auth, async (req, res) => {
  try {
    const { orderItems, shippingAddress, paymentMethod } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ message: 'No items in the order' });
    }

    // Calculate total price and total quantity
    const totalPrice = orderItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const totalQuantity = orderItems.reduce((acc, item) => acc + item.quantity, 0);

    // Create order with all details
    const order = await Order.create({
      user: req.user._id,
      orderItems: orderItems.map(item => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        product: item.product,
        image: item.image
      })),
      shippingAddress: shippingAddress || {},
      paymentMethod: paymentMethod || 'COD',
      totalPrice,
      totalQuantity
    });

    // Populate product details for response
    await order.populate('orderItems.product');

    res.status(201).json(order);
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all orders for the logged-in user (chronologically - newest first)
router.get('/', auth, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('orderItems.product')
      .sort({ createdAt: -1 }); // Newest first
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
