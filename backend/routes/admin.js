const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Product = require('../models/Product');
const User = require('../models/User');
const Order = require('../models/Order');
const { adminProtect } = require('../middleware/auth');

// ── Multer Setup ─────────────────────────────────────────────────────────
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `product-${unique}${path.extname(file.originalname)}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|gif|webp/;
  const ext = allowed.test(path.extname(file.originalname).toLowerCase());
  const mime = allowed.test(file.mimetype);
  if (ext && mime) cb(null, true);
  else cb(new Error('Only image files are allowed'));
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});

// ── Stats ─────────────────────────────────────────────────────────────────
// @route   GET /api/admin/stats
// @access  Admin
router.get('/stats', adminProtect, async (req, res) => {
  try {
    const [totalOrders, totalUsers, totalProducts, revenueAgg] = await Promise.all([
      Order.countDocuments(),
      User.countDocuments(),
      Product.countDocuments(),
      Order.aggregate([
        { $match: { 'payment.status': 'paid' } },
        { $group: { _id: null, total: { $sum: '$total' } } },
      ]),
    ]);

    const revenue = revenueAgg.length > 0 ? revenueAgg[0].total : 0;

    res.json({ totalOrders, totalUsers, totalProducts, revenue });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ── Users ─────────────────────────────────────────────────────────────────
// @route   GET /api/admin/users
// @access  Admin
router.get('/users', adminProtect, async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ── Products CRUD ─────────────────────────────────────────────────────────

// GET all products (with pagination)
router.get('/products', adminProtect, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const count = await Product.countDocuments();
    const products = await Product.find({}).sort({ createdAt: -1 }).skip(skip).limit(limit);
    res.json({ products, page, pages: Math.ceil(count / limit), total: count });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST create product (with optional image upload)
router.post('/products', adminProtect, upload.single('image'), async (req, res) => {
  try {
    const { name, description, shortDescription, price, oldPrice, category, stock, badge, emoji } = req.body;

    if (!name || !description || !price || !category) {
      return res.status(400).json({ message: 'Name, description, price, and category are required' });
    }

    const images = [];
    if (req.file) {
      images.push(`/uploads/${req.file.filename}`);
    }

    const product = await Product.create({
      name,
      description,
      shortDescription: shortDescription || '',
      price: Number(price),
      oldPrice: oldPrice ? Number(oldPrice) : undefined,
      category,
      stock: Number(stock) || 100,
      badge: badge || undefined,
      emoji: emoji || undefined,
      images,
    });

    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// PUT update product
router.put('/products/:id', adminProtect, upload.single('image'), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const { name, description, shortDescription, price, oldPrice, category, stock, badge, emoji } = req.body;

    if (name) product.name = name;
    if (description) product.description = description;
    if (shortDescription !== undefined) product.shortDescription = shortDescription;
    if (price) product.price = Number(price);
    if (oldPrice !== undefined) product.oldPrice = oldPrice ? Number(oldPrice) : undefined;
    if (category) product.category = category;
    if (stock !== undefined) product.stock = Number(stock);
    if (badge !== undefined) product.badge = badge || undefined;
    if (emoji !== undefined) product.emoji = emoji || undefined;

    if (req.file) {
      product.images = [`/uploads/${req.file.filename}`];
    }

    const updated = await product.save();
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// DELETE product
router.delete('/products/:id', adminProtect, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
