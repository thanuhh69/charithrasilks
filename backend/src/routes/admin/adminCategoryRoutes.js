const express = require('express');
const router = express.Router();
const {
  adminGetCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} = require('../../controllers/categoryController');
const { protectAdmin } = require('../../middleware/authAdmin');
const { uploadBannerImage } = require('../../config/upload');

router.use(protectAdmin);

router.get('/', adminGetCategories);
router.post('/', uploadBannerImage.single('image'), createCategory);
router.put('/:id', uploadBannerImage.single('image'), updateCategory);
router.delete('/:id', deleteCategory);

module.exports = router;
