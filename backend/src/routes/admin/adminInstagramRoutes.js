const express = require('express');
const router = express.Router();
const {
  adminGetInstagramPosts,
  createInstagramPost,
  updateInstagramPost,
  deleteInstagramPost,
} = require('../../controllers/instagramController');
const { protectAdmin } = require('../../middleware/authAdmin');
const { uploadInstagramImage } = require('../../config/upload');

router.use(protectAdmin);

router.get('/', adminGetInstagramPosts);
router.post('/', uploadInstagramImage.single('image'), createInstagramPost);
router.put('/:id', uploadInstagramImage.single('image'), updateInstagramPost);
router.delete('/:id', deleteInstagramPost);

module.exports = router;
