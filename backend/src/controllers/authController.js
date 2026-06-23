const { initFirebase } = require('../config/firebase');
const User = require('../models/User');
const Product = require('../models/Product');

// @desc    Verify Firebase ID token & create/login user (works for both phone OTP and Google)
// @route   POST /api/auth/verify
// @access  Public (token verified inside)
const verifyAndLogin = async (req, res) => {
  try {
    const { idToken, name } = req.body;
    if (!idToken) {
      return res.status(400).json({ success: false, message: 'idToken is required' });
    }

    const admin = initFirebase();
    if (!admin) {
      return res.status(500).json({
        success: false,
        message:
          'Firebase Admin not configured. Add backend/firebase-service-account.json (see README) to enable login.',
      });
    }

    const decoded = await admin.auth().verifyIdToken(idToken);
    const { uid, phone_number, email, name: googleName, picture } = decoded;

    let user = await User.findOne({ firebaseUid: uid });

    if (!user) {
      // Determine provider
      let provider = 'phone';
      if (email && phone_number) provider = 'both';
      else if (email) provider = 'google';

      user = await User.create({
        firebaseUid: uid,
        mobile: phone_number || null,
        email: email || null,
        name: name || googleName || '',
        avatar: picture || '',
        authProvider: provider,
      });
    } else {
      // Update any new info (e.g. user logs in with Google after using phone before)
      let changed = false;
      if (email && user.email !== email) {
        user.email = email;
        changed = true;
      }
      if (phone_number && user.mobile !== phone_number) {
        user.mobile = phone_number;
        changed = true;
      }
      if (name && !user.name) {
        user.name = name;
        changed = true;
      }
      if (changed) await user.save();
    }

    if (user.isBlocked) {
      return res.status(403).json({ success: false, message: 'Your account has been blocked. Contact support.' });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        avatar: user.avatar,
        authProvider: user.authProvider,
      },
    });
  } catch (err) {
    console.error('verifyAndLogin error:', err);
    res.status(401).json({ success: false, message: 'Invalid or expired Firebase token' });
  }
};

// @desc    Get current logged-in user profile
// @route   GET /api/auth/me
// @access  Private (user)
const getMe = async (req, res) => {
  res.json({ success: true, user: req.user });
};

// @desc    Update profile (name, email if not set via google)
// @route   PUT /api/auth/me
// @access  Private (user)
const updateMe = async (req, res) => {
  try {
    const { name, email } = req.body;
    if (name !== undefined) req.user.name = name;
    if (email !== undefined) req.user.email = email;
    await req.user.save();
    res.json({ success: true, user: req.user });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Get current user's reviews
// @route   GET /api/auth/reviews
// @access  Private (user)
const getMyReviews = async (req, res) => {
  try {
    const products = await Product.find({ 'reviews.user': req.user._id })
      .populate('category', 'name slug')
      .select('title slug thumbnail reviews');

    const reviews = [];
    for (const product of products) {
      const userReview = product.reviews.find(
        (r) => r.user.toString() === req.user._id.toString()
      );
      if (userReview) {
        reviews.push({
          _id: userReview._id,
          product: {
            _id: product._id,
            title: product.title,
            slug: product.slug,
            thumbnail: product.thumbnail,
          },
          rating: userReview.rating,
          comment: userReview.comment,
          createdAt: userReview.createdAt,
        });
      }
    }

    res.json({ success: true, reviews });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { verifyAndLogin, getMe, updateMe, getMyReviews };
