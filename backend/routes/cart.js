const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Product = require('../models/Product');
const { protect } = require('../middleware/auth');

// @route   GET /api/cart
// @desc    Get user cart (auto-cleans stale product refs)
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('cart.product');
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Filter out items whose product was deleted (e.g. after a DB re-seed)
    const validCart = user.cart.filter(item => item.product != null);

    // Auto-save cleaned cart back to DB if any stale items were found
    if (validCart.length !== user.cart.length) {
      await User.findByIdAndUpdate(req.user._id, {
        cart: validCart.map(i => ({ product: i.product._id, qty: i.qty }))
      });
    }

    res.json({ cartItems: validCart });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @route   POST /api/cart/add
// @desc    Add item to cart or sync local cart with backend
// @access  Private
router.post('/add', protect, async (req, res) => {
  try {
    const { productId, qty, syncCart, absoluteQty } = req.body;
    const user = await User.findById(req.user._id);
    
    if (syncCart && Array.isArray(syncCart)) {
      // Overwrite or merge for sync
      user.cart = syncCart;
    } else if (productId) {
      const itemIndex = user.cart.findIndex(p => p.product.toString() === productId);
      if (itemIndex > -1) {
        if (absoluteQty !== undefined) {
             user.cart[itemIndex].qty = absoluteQty;
        } else {
             user.cart[itemIndex].qty += (qty || 1);
        }
      } else {
        user.cart.push({ product: productId, qty: absoluteQty !== undefined ? absoluteQty : (qty || 1) });
      }
    }

    await user.save();
    const updatedUser = await User.findById(req.user._id).populate('cart.product');
    res.json({ cartItems: updatedUser.cart });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @route   DELETE /api/cart/:productId
// @desc    Remove item from cart
// @access  Private
router.delete('/:productId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.cart = user.cart.filter(p => p.product.toString() !== req.params.productId);
    await user.save();
    
    const updatedUser = await User.findById(req.user._id).populate('cart.product');
    res.json({ cartItems: updatedUser.cart });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
