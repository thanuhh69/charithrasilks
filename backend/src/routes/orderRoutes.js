const express = require('express');
const router = express.Router();
const {
  createRazorpayOrder,
  placeOrder,
  getMyOrders,
  getOrderById,
  cancelOrderByUser,
  submitPaymentProof,
} = require('../controllers/orderController');
const { protectUser } = require('../middleware/authUser');
const { uploadPaymentScreenshot } = require('../config/upload');

router.use(protectUser);

router.post('/razorpay/create', createRazorpayOrder);
router.post('/', placeOrder);
router.get('/', getMyOrders);
router.get('/:id', getOrderById);
router.put('/:id/cancel', cancelOrderByUser);
router.put('/:id/submit-payment', uploadPaymentScreenshot.single('screenshot'), submitPaymentProof);

module.exports = router;
