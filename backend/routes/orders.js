const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const { protect, optionalProtect, adminProtect } = require('../middleware/auth');

// @route   POST /api/orders
// @desc    Create new order
// @access  Public (Guest or Logged In)
router.post('/', optionalProtect, async (req, res) => {
  try {
    const { orderItems, address, total, payment } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ message: 'No order items' });
    }

    const order = new Order({
      user: req.user ? req.user._id : undefined,
      items: orderItems,
      address,
      total,
      payment: payment || { status: 'pending' },
      status: payment && payment.status === 'paid' ? 'confirmed' : 'pending',
    });

    const createdOrder = await order.save();

    // Clear user cart upon order success
    if (req.user && payment && payment.status === 'paid') {
      const user = await User.findById(req.user._id);
      user.cart = [];
      await user.save();
    }

    res.status(201).json(createdOrder);
  } catch (err) {
    console.error('Order Creation Error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @route   GET /api/orders/my
// @desc    Get logged in user orders
// @access  Private
router.get('/my', protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @route   GET /api/orders/all
// @desc    Get ALL orders (Admin only)
// @access  Admin
router.get('/all', adminProtect, async (req, res) => {
  try {
    const orders = await Order.find({}).populate('user', 'name email').sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @route   GET /api/orders/:id
// @desc    Get order by ID
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');

    if (order && order.user && order.user._id.toString() === req.user._id.toString()) {
      res.json(order);
    } else {
      res.status(404).json({ message: 'Order not found or unauthorized' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @route   PUT /api/orders/:id/payment_success
// @desc    Update order on payment success + decrement stock
// @access  Public (Guest or Logged In)
router.put('/:id/payment_success', optionalProtect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    order.payment = {
      razorpayOrderId: req.body.razorpayOrderId,
      razorpayPaymentId: req.body.razorpayPaymentId,
      status: 'paid',
    };
    order.status = 'confirmed';

    const updatedOrder = await order.save();

    // Decrement stock for each item
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.qty },
      });
    }

    // Clear cart if logged in
    if (req.user) {
      const user = await User.findById(req.user._id);
      user.cart = [];
      await user.save();
    }

    res.json(updatedOrder);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @route   PUT /api/orders/:id/status
// @desc    Update order status (Admin only)
// @access  Admin
router.put('/:id/status', adminProtect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    order.status = req.body.status;
    const updated = await order.save();
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @route   PUT /api/orders/:id/cancel
// @desc    Cancel an order (User — only if pending or confirmed)
// @access  Private
router.put('/:id/cancel', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    // Only the order owner can cancel
    if (!order.user || order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to cancel this order' });
    }

    if (!['pending', 'confirmed'].includes(order.status)) {
      return res.status(400).json({
        message: `Order cannot be cancelled — it is already ${order.status}`,
      });
    }

    // Restore stock if payment was completed
    if (order.payment && order.payment.status === 'paid') {
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: item.qty },
        });
      }
    }

    order.status = 'cancelled';
    const updated = await order.save();
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @route   DELETE /api/orders/:id
// @desc    Delete an order (Admin only)
// @access  Admin
router.delete('/:id', adminProtect, async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json({ message: 'Order deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
