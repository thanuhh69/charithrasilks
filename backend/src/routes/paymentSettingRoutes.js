const express = require('express');
const router = express.Router();
const { getPublicPaymentSettings } = require('../controllers/paymentSettingController');

router.get('/', getPublicPaymentSettings);

module.exports = router;
