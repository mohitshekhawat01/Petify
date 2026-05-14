const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: false,
    ref: 'User',
  },
  items: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Product',
      },
      name: { type: String, required: true },
      price: { type: Number, required: true },
      qty: { type: Number, required: true },
      emoji: { type: String }
    }
  ],
  total: {
    type: Number,
    required: true,
  },
  address: {
    fullName: { type: String, required: true },
    line1: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true }
  },
  payment: {
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    status: { type: String, default: 'pending' },
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
    default: 'pending',
  }
}, {
  timestamps: true,
});

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;
