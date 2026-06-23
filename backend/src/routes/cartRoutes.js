const express = require('express');
const router = express.Router();
const {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  applyCoupon,
  removeCoupon,
  clearCart,
} = require('../controllers/cartController');
const { protectUser } = require('../middleware/authUser');

router.use(protectUser); // all cart routes require login

router.get('/', getCart);
router.post('/items', addToCart);
router.put('/items/:itemId', updateCartItem);
router.delete('/items/:itemId', removeCartItem);
router.post('/apply-coupon', applyCoupon);
router.delete('/apply-coupon', removeCoupon);
router.delete('/', clearCart);

module.exports = router;
