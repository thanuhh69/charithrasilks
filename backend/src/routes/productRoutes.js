const express = require('express');
const router = express.Router();
const { getProducts, getProductBySlug, addReview, getSearchSuggestions } = require('../controllers/productController');
const { protectUser } = require('../middleware/authUser');

router.get('/', getProducts);
router.get('/search/suggestions', getSearchSuggestions);
router.get('/:slug', getProductBySlug);
router.post('/:id/reviews', protectUser, addReview);


module.exports = router;
