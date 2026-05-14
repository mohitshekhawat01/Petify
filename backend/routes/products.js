const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// @route   GET /api/products
// @desc    Fetch all products with filtering, searching, sorting, pagination
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { category, search, sort, page = 1, limit = 12 } = req.query;

    let query = {};

    if (category && category !== 'All') {
      if (category === 'Food & Treats') {
        query.name = { $regex: /food|kibble|feast|treats/i };
      } else if (category === 'Accessories') {
        query.name = { $not: /food|kibble|feast|treats/i };
      } else if (category === 'Dogs' || category === 'Cats' || category === 'Birds' || category === 'Fish') {
        query.category = new RegExp('^' + category); // Matches "Dogs", "Dogs/Toys", etc.
      } else {
        query.category = category;
      }
    }

    if (search) {
      const words = search.trim().split(/\s+/).filter(w => w.length > 1);
      const orConditions = [
        { name: { $regex: search, $options: 'i' } },        // exact phrase first
        { category: { $regex: search, $options: 'i' } },
      ];
      words.forEach(w => {
        orConditions.push({ name: { $regex: w, $options: 'i' } });
        orConditions.push({ category: { $regex: w, $options: 'i' } });
      });
      query.$or = orConditions;
    }

    let sortOption = {};
    if (sort === 'Price Low') sortOption.price = 1;
    else if (sort === 'Price High') sortOption.price = -1;
    else if (sort === 'Top Rated') sortOption.rating = -1;
    else sortOption.createdAt = -1; // Newest default

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const count = await Product.countDocuments(query);
    const products = await Product.find(query)
      .sort(sortOption)
      .limit(parseInt(limit))
      .skip(skip);

    res.json({
      products,
      page: parseInt(page),
      pages: Math.ceil(count / parseInt(limit)),
      total: count
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @route   GET /api/products/:id
// @desc    Fetch single product
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
