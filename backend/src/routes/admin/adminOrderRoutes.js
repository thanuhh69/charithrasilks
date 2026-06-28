const express = require('express');
const router = express.Router();
const {
  adminGetOrders,
  adminGetOrder,
  confirmOrder,
  updateOrderStatus,
  updatePaymentStatus,
  updateAdminNotes,
  getOrderStats,
  verifyPayment,
  rejectPayment,
} = require('../../controllers/orderController');
const { protectAdmin } = require('../../middleware/authAdmin');

router.use(protectAdmin);

router.get('/stats', getOrderStats);
router.get('/', adminGetOrders);
router.get('/:id', adminGetOrder);
router.put('/:id/confirm', confirmOrder);
router.put('/:id/status', updateOrderStatus);
router.put('/:id/payment-status', updatePaymentStatus);
router.put('/:id/notes', updateAdminNotes);
router.put('/:id/verify-payment', verifyPayment);
router.put('/:id/reject-payment', rejectPayment);

module.exports = router;
