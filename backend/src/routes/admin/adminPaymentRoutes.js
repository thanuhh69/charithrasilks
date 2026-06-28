const express = require('express');
const router = express.Router();
const { getAdminPaymentSettings, updatePaymentSettings } = require('../../controllers/paymentSettingController');
const { protectAdmin } = require('../../middleware/authAdmin');
const { uploadQrCode } = require('../../config/upload');

router.use(protectAdmin);

router.get('/settings', getAdminPaymentSettings);
router.put('/settings', uploadQrCode.single('qrCode'), updatePaymentSettings);

module.exports = router;
