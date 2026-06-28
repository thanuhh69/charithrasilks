const InstagramPost = require('../models/InstagramPost');
const { cloudinary } = require('../config/upload');

// @desc    Get active storefront Instagram posts
// @route   GET /api/instagram
// @access  Public
const getInstagramPosts = async (req, res) => {
  try {
    const posts = await InstagramPost.find({ isActive: true }).sort({ sortOrder: 1, createdAt: -1 });
    res.json({ success: true, posts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get all Instagram posts (admin)
// @route   GET /api/admin/instagram
// @access  Private (admin)
const adminGetInstagramPosts = async (req, res) => {
  try {
    const posts = await InstagramPost.find().sort({ sortOrder: 1, createdAt: -1 });
    res.json({ success: true, posts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Create Instagram post (admin)
// @route   POST /api/admin/instagram
// @access  Private (admin)
const createInstagramPost = async (req, res) => {
  try {
    const { link, caption, sortOrder, isActive } = req.body;

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Instagram post image is required' });
    }

    if (!link) {
      return res.status(400).json({ success: false, message: 'Instagram post link is required' });
    }

    const postData = {
      link,
      caption: caption || '',
      sortOrder: sortOrder ? Number(sortOrder) : 0,
      isActive: isActive === 'false' ? false : true,
      image: req.file.path,
      imagePublicId: req.file.filename,
    };

    const post = await InstagramPost.create(postData);
    res.status(201).json({ success: true, post, message: 'Instagram post added successfully' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Update Instagram post (admin)
// @route   PUT /api/admin/instagram/:id
// @access  Private (admin)
const updateInstagramPost = async (req, res) => {
  try {
    const post = await InstagramPost.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Instagram post not found' });
    }

    const { link, caption, sortOrder, isActive } = req.body;

    if (link !== undefined) post.link = link;
    if (caption !== undefined) post.caption = caption;
    if (sortOrder !== undefined) post.sortOrder = Number(sortOrder);
    if (isActive !== undefined) post.isActive = isActive === 'false' ? false : true;

    if (req.file) {
      // Destroy old image on Cloudinary
      if (post.imagePublicId) {
        try {
          await cloudinary.uploader.destroy(post.imagePublicId);
        } catch (e) {
          console.warn('Cloudinary delete failed for', post.imagePublicId);
        }
      }
      post.image = req.file.path;
      post.imagePublicId = req.file.filename;
    }

    await post.save();
    res.json({ success: true, post, message: 'Instagram post updated successfully' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Delete Instagram post (admin)
// @route   DELETE /api/admin/instagram/:id
// @access  Private (admin)
const deleteInstagramPost = async (req, res) => {
  try {
    const post = await InstagramPost.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Instagram post not found' });
    }

    // Destroy image on Cloudinary
    if (post.imagePublicId) {
      try {
        await cloudinary.uploader.destroy(post.imagePublicId);
      } catch (e) {
        console.warn('Cloudinary delete failed for', post.imagePublicId);
      }
    }

    await InstagramPost.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Instagram post deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getInstagramPosts,
  adminGetInstagramPosts,
  createInstagramPost,
  updateInstagramPost,
  deleteInstagramPost,
};
