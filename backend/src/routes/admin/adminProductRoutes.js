const express = require('express');
const router = express.Router();
const {
  adminGetProducts,
  adminGetProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleProductActive,
} = require('../../controllers/productController');
const { protectAdmin } = require('../../middleware/authAdmin');
const { uploadProductImages } = require('../../config/upload');

router.use(protectAdmin);

router.get('/', adminGetProducts);
router.get('/:id', adminGetProduct);
router.post('/', uploadProductImages.array('images', 10), createProduct);
router.put('/:id', uploadProductImages.array('images', 10), updateProduct);
router.delete('/:id', deleteProduct);
router.patch('/:id/toggle-active', toggleProductActive);

module.exports = router;
