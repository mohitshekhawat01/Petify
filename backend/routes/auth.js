const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const { protect } = require('../middleware/auth');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// ── Signup ─────────────────────────────────────────────────────────────────
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return res.status(400).json({ message: 'Name must be at least 2 characters' });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return res.status(400).json({ message: 'Please provide a valid email address' });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase(),
      password,
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ── Login ──────────────────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ── Get Profile ────────────────────────────────────────────────────────────
router.get('/profile', protect, async (req, res) => {
  const user = await User.findById(req.user._id);
  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      phone: user.phone,
      address: user.address,
    });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
});

// ── Update Profile ─────────────────────────────────────────────────────────
router.put('/profile', protect, async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) return res.status(404).json({ message: 'User not found' });

  if (req.body.name && req.body.name.trim().length >= 2) {
    user.name = req.body.name.trim();
  }
  if (req.body.email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(req.body.email)) {
      return res.status(400).json({ message: 'Invalid email address' });
    }
    user.email = req.body.email.toLowerCase();
  }
  if (req.body.phone) user.phone = req.body.phone;
  if (req.body.password) {
    if (req.body.password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }
    user.password = req.body.password;
  }

  const updatedUser = await user.save();
  res.json({
    _id: updatedUser._id,
    name: updatedUser.name,
    email: updatedUser.email,
    phone: updatedUser.phone,
    token: generateToken(updatedUser._id),
  });
});

// ── Address Management ─────────────────────────────────────────────────────

// Add new address
router.post('/address', protect, async (req, res) => {
  try {
    const { fullName, line1, city, state, pincode, phone } = req.body;
    if (!fullName || !line1 || !city || !state || !pincode || !phone) {
      return res.status(400).json({ message: 'All address fields are required' });
    }
    const user = await User.findById(req.user._id);
    user.address.push({ fullName, line1, city, state, pincode, phone });
    await user.save();
    res.status(201).json(user.address);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Update address by index
router.put('/address/:index', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const idx = parseInt(req.params.index);
    if (idx < 0 || idx >= user.address.length) {
      return res.status(404).json({ message: 'Address not found' });
    }
    const { fullName, line1, city, state, pincode, phone } = req.body;
    if (fullName) user.address[idx].fullName = fullName;
    if (line1) user.address[idx].line1 = line1;
    if (city) user.address[idx].city = city;
    if (state) user.address[idx].state = state;
    if (pincode) user.address[idx].pincode = pincode;
    if (phone) user.address[idx].phone = phone;
    await user.save();
    res.json(user.address);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Delete address by index
router.delete('/address/:index', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const idx = parseInt(req.params.index);
    if (idx < 0 || idx >= user.address.length) {
      return res.status(404).json({ message: 'Address not found' });
    }
    user.address.splice(idx, 1);
    await user.save();
    res.json(user.address);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ── Forgot Password ────────────────────────────────────────────────────────
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const user = await User.findOne({ email: email.toLowerCase() });
    // Always return success to prevent user enumeration
    if (!user) {
      return res.json({ message: 'If that email exists, a reset link has been sent.' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(token).digest('hex');
    user.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5500'}/frontend/reset-password.html?token=${token}`;

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });

    await transporter.sendMail({
      from: `"Petify" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: 'Petify — Password Reset Request',
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;border:1px solid #e1e1e1;border-radius:8px;overflow:hidden;">
          <div style="background-color:#4a2810;padding:20px;text-align:center;">
            <h1 style="color:#c9973a;margin:0;">PETIFY 🐾</h1>
          </div>
          <div style="padding:30px;background:#fdf9f3;">
            <h2 style="color:#4a2810;">Password Reset</h2>
            <p>Hi ${user.name},</p>
            <p>You requested a password reset. Click the button below to set a new password. This link expires in <strong>1 hour</strong>.</p>
            <div style="text-align:center;margin:30px 0;">
              <a href="${resetUrl}" style="background:#4a2810;color:#c9973a;padding:14px 30px;border-radius:30px;text-decoration:none;font-weight:bold;">Reset My Password</a>
            </div>
            <p style="font-size:12px;color:#999;">If you didn't request this, please ignore this email. Your password won't change.</p>
          </div>
        </div>
      `,
    });

    res.json({ message: 'If that email exists, a reset link has been sent.' });
  } catch (err) {
    console.error('Forgot password error:', err.message);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ── Reset Password ─────────────────────────────────────────────────────────
router.post('/reset-password/:token', async (req, res) => {
  try {
    const { password } = req.body;
    if (!password || password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: 'Password reset successful. Please log in.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
