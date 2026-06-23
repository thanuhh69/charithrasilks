const express = require('express');
const router = express.Router();
const {
  createRazorpayOrder,
  placeOrder,
  getMyOrders,
  getOrderById,
  cancelOrderByUser,
} = require('../controllers/orderController');
const { protectUser } = require('../middleware/authUser');

router.use(protectUser);

router.post('/razorpay/create', createRazorpayOrder);
router.post('/', placeOrder);
router.get('/', getMyOrders);
router.get('/:id', getOrderById);
router.put('/:id/cancel', cancelOrderByUser);

module.exports = router;
