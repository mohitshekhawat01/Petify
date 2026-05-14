const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const User = require('../models/User');
const Review = require('../models/Review');
const Product = require('../models/Product');
const { protect, adminProtect } = require('../middleware/auth');

// @route   GET /api/reviews/:productId
// @desc    Get all reviews for a product
// @access  Public
router.get('/:productId', async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.productId })
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @route   POST /api/reviews/:productId
// @desc    Create or update a review for a product
// @access  Private
router.post('/:productId', protect, async (req, res) => {
  try {
    const { rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }
    if (!comment || comment.trim().length < 3) {
      return res.status(400).json({ message: 'Please provide a comment (min 3 characters)' });
    }

    const product = await Product.findById(req.params.productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    // Upsert: update if exists, create if not
    const review = await Review.findOneAndUpdate(
      { product: req.params.productId, user: req.user._id },
      {
        name: req.user.name,
        rating: Number(rating),
        comment: comment.trim(),
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Recalculate product rating
    const allReviews = await Review.find({ product: req.params.productId });
    product.numReviews = allReviews.length;
    product.rating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
    await product.save();

    res.status(201).json(review);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @route   DELETE /api/reviews/:productId
// @desc    Delete the current user's review for a product
// @access  Private
router.delete('/:productId', protect, async (req, res) => {
  try {
    const review = await Review.findOneAndDelete({
      product: req.params.productId,
      user: req.user._id,
    });

    if (!review) return res.status(404).json({ message: 'Review not found' });

    // Recalculate product rating
    const product = await Product.findById(req.params.productId);
    if (product) {
      const allReviews = await Review.find({ product: req.params.productId });
      product.numReviews = allReviews.length;
      product.rating = allReviews.length > 0
        ? allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length
        : 0;
      await product.save();
    }

    res.json({ message: 'Review deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
