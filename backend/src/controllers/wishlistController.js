const Product = require('../models/Product');

// @desc    Get wishlist
// @route   GET /api/wishlist
const getWishlist = async (req, res) => {
  try {
    await req.user.populate({
      path: 'wishlist',
      select: 'title slug price mrp thumbnail ratingAverage ratingCount',
    });
    res.json({ success: true, wishlist: req.user.wishlist });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Toggle product in wishlist
// @route   POST /api/wishlist/:productId
const toggleWishlist = async (req, res) => {
  try {
    const { productId } = req.params;
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    const index = req.user.wishlist.findIndex((id) => id.toString() === productId);
    let added;
    if (index > -1) {
      req.user.wishlist.splice(index, 1);
      added = false;
    } else {
      req.user.wishlist.push(productId);
      added = true;
    }
    await req.user.save();
    res.json({ success: true, added, message: added ? 'Added to wishlist' : 'Removed from wishlist' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

module.exports = { getWishlist, toggleWishlist };
