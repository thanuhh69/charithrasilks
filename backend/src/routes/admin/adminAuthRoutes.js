const express = require('express');
const router = express.Router();
const {
  adminLogin,
  getAdminMe,
  createAdmin,
  changeAdminPassword,
} = require('../../controllers/adminAuthController');
const { protectAdmin, requireSuperAdmin } = require('../../middleware/authAdmin');

router.post('/login', adminLogin);
router.get('/me', protectAdmin, getAdminMe);
router.post('/create', protectAdmin, requireSuperAdmin, createAdmin);
router.put('/change-password', protectAdmin, changeAdminPassword);

module.exports = router;
