const express = require('express');
const router = express.Router();
const { getWishlist, toggleWishlist } = require('../controllers/wishlistController');
const { protectUser } = require('../middleware/authUser');

router.use(protectUser);

router.get('/', getWishlist);
router.post('/:productId', toggleWishlist);

module.exports = router;
