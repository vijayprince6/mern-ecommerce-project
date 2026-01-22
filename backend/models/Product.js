import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: String,
  price: Number,
  image: String,
  brand: String
  // ❌ NO STOCK FIELD
});

export default mongoose.model('Product', productSchema);
