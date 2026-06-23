const express = require('express');
const router = express.Router();
const {
  getCustomers,
  toggleBlockCustomer,
  getCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
} = require('../../controllers/adminController');
const { protectAdmin } = require('../../middleware/authAdmin');

router.use(protectAdmin);

router.get('/customers', getCustomers);
router.put('/customers/:id/toggle-block', toggleBlockCustomer);

router.get('/coupons', getCoupons);
router.post('/coupons', createCoupon);
router.put('/coupons/:id', updateCoupon);
router.delete('/coupons/:id', deleteCoupon);

module.exports = router;
