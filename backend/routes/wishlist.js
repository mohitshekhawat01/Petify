const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect, optionalProtect } = require('../middleware/auth');

// @route   POST /api/wishlist/toggle
// @desc    Add or remove a product from the wishlist
// @access  Private
router.post('/toggle', protect, async (req, res) => {
  try {
    const { productId } = req.body;
    if (!productId) return res.status(400).json({ message: 'productId is required' });

    const user = await User.findById(req.user._id);
    const idx = user.wishlist.findIndex(id => id.toString() === productId);

    let action;
    if (idx > -1) {
      user.wishlist.splice(idx, 1);
      action = 'removed';
    } else {
      user.wishlist.push(productId);
      action = 'added';
    }

    await user.save();
    res.json({ action, wishlist: user.wishlist });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @route   GET /api/wishlist
// @desc    Get the current user's wishlist (populated)
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('wishlist');
    res.json(user.wishlist || []);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
