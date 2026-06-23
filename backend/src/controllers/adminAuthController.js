const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

const generateAdminToken = (id) => {
  return jwt.sign({ id }, process.env.ADMIN_JWT_SECRET, {
    expiresIn: process.env.ADMIN_JWT_EXPIRES_IN || '7d',
  });
};

// @desc    Admin login
// @route   POST /api/admin/auth/login
// @access  Public
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const admin = await Admin.findOne({ email: email.toLowerCase() });
    if (!admin) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
    if (!admin.isActive) {
      return res.status(403).json({ success: false, message: 'This admin account is deactivated' });
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = generateAdminToken(admin._id);

    res.json({
      success: true,
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get current admin profile
// @route   GET /api/admin/auth/me
// @access  Private (admin)
const getAdminMe = async (req, res) => {
  res.json({ success: true, admin: req.admin });
};

// @desc    Create a new admin/manager account (superadmin only)
// @route   POST /api/admin/auth/create
// @access  Private (superadmin)
const createAdmin = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const exists = await Admin.findOne({ email: email.toLowerCase() });
    if (exists) {
      return res.status(400).json({ success: false, message: 'Admin with this email already exists' });
    }
    const admin = await Admin.create({ name, email, password, role: role || 'manager' });
    res.status(201).json({
      success: true,
      admin: { id: admin._id, name: admin.name, email: admin.email, role: admin.role },
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Change admin password
// @route   PUT /api/admin/auth/change-password
// @access  Private (admin)
const changeAdminPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const admin = await Admin.findById(req.admin._id);
    const isMatch = await admin.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }
    admin.password = newPassword;
    await admin.save();
    res.json({ success: true, message: 'Password updated successfully' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

module.exports = { adminLogin, getAdminMe, createAdmin, changeAdminPassword };
