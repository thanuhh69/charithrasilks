const { initFirebase } = require('../config/firebase');
const User = require('../models/User');

// Verifies the Firebase ID token sent from frontend after phone OTP or Google login
const protectUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
    }

    const idToken = authHeader.split(' ')[1];
    const admin = initFirebase();

    if (!admin) {
      return res.status(500).json({
        success: false,
        message: 'Firebase Admin not configured on server. Add firebase-service-account.json.',
      });
    }

    const decoded = await admin.auth().verifyIdToken(idToken);

    const user = await User.findOne({ firebaseUid: decoded.uid });
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found. Please complete signup.' });
    }
    if (user.isBlocked) {
      return res.status(403).json({ success: false, message: 'Your account has been blocked. Contact support.' });
    }

    req.user = user;
    req.firebaseUser = decoded;
    next();
  } catch (err) {
    console.error('Auth error:', err.message);
    return res.status(401).json({ success: false, message: 'Not authorized, invalid or expired token' });
  }
};

// Optional auth - attaches user if token present, but doesn't block if missing
const optionalUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }
    const idToken = authHeader.split(' ')[1];
    const admin = initFirebase();
    if (!admin) return next();

    const decoded = await admin.auth().verifyIdToken(idToken);
    const user = await User.findOne({ firebaseUid: decoded.uid });
    if (user && !user.isBlocked) {
      req.user = user;
    }
    next();
  } catch (err) {
    next();
  }
};

module.exports = { protectUser, optionalUser };
