import express from 'express';
import QRCode from 'qrcode';
import Order from '../models/Order.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Generate QR code for payment
router.post('/generate', auth, async (req, res) => {
  try {
    const { amount, orderId } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid amount' });
    }

    // Create UPI payment string
    const upiId = 'vijayprince6@ybl'; // Extracted from your QR code
    const merchantName = 'Cricket Store';
    const transactionNote = `Order ${orderId}`;
    
    const upiString = `upi://pay?pa=${upiId}&pn=${merchantName}&am=${amount}&cu=INR&tn=${transactionNote}`;
    
    // Generate QR code
    const qrCodeDataURL = await QRCode.toDataURL(upiString, {
      width: 256,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    res.json({
      qrCode: qrCodeDataURL,
      upiString,
      amount,
      orderId,
      upiId
    });
  } catch (error) {
    console.error('QR Code generation error:', error);
    res.status(500).json({ message: 'Failed to generate QR code' });
  }
});

// Verify payment (UPI or Cash)
router.post('/verify', auth, async (req, res) => {
  try {
    const { orderId, paymentMethod, transactionId, cashAmount } = req.body;

    if (!orderId || !paymentMethod) {
      return res.status(400).json({ message: 'Order ID and payment method are required' });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    if (paymentMethod === 'UPI') {
      if (!transactionId) {
        return res.status(400).json({ message: 'Transaction ID is required for UPI payment' });
      }
      order.paymentMethod = 'UPI';
      order.upiTransactionId = transactionId;
      order.paymentStatus = 'completed';
    } else if (paymentMethod === 'Cash') {
      if (!cashAmount || cashAmount < order.totalPrice) {
        return res.status(400).json({ message: 'Invalid cash amount' });
      }
      order.paymentMethod = 'Cash';
      order.cashAmount = cashAmount;
      order.paymentStatus = 'completed';
    } else {
      return res.status(400).json({ message: 'Invalid payment method' });
    }

    await order.save();
    await order.populate('orderItems.product');

    res.json({
      message: 'Payment verified successfully',
      order
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ message: 'Payment verification failed' });
  }
});

export default router;
