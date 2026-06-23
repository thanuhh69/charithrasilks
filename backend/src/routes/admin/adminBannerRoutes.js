const express = require('express');
const router = express.Router();
const {
  adminGetBanners,
  createBanner,
  updateBanner,
  deleteBanner,
} = require('../../controllers/bannerController');
const { protectAdmin } = require('../../middleware/authAdmin');
const { uploadBannerImage } = require('../../config/upload');

router.use(protectAdmin);

router.get('/', adminGetBanners);
router.post('/', uploadBannerImage.single('image'), createBanner);
router.put('/:id', uploadBannerImage.single('image'), updateBanner);
router.delete('/:id', deleteBanner);

module.exports = router;
