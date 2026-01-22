import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  orderItems: [
    {
      name: { type: String, required: true },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true },
      product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      image: String
    }
  ],
  shippingAddress: { 
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  paymentMethod: { type: String, default: 'COD' },
  totalPrice: { type: Number, required: true, default: 0 },
  totalQuantity: { type: Number, default: 0 }, // Total number of items
}, { timestamps: true });

const Order = mongoose.model('Order', orderSchema);
export default Order;