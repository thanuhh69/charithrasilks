const Banner = require('../models/Banner');
const { cloudinary } = require('../config/upload');

// @desc    Get all active storefront banners (filtered by scheduling dates)
// @route   GET /api/banners
// @access  Public
const getBanners = async (req, res) => {
  try {
    const now = new Date();
    const query = {
      isActive: true,
      $and: [
        {
          $or: [
            { startDate: { $exists: false } },
            { startDate: null },
            { startDate: { $lte: now } },
          ],
        },
        {
          $or: [
            { endDate: { $exists: false } },
            { endDate: null },
            { endDate: { $gte: now } },
          ],
        },
      ],
    };

    const banners = await Banner.find(query).sort({ sortOrder: 1, createdAt: -1 });
    res.json({ success: true, banners });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get all banners (admin - includes inactive/unscheduled)
// @route   GET /api/admin/banners
// @access  Private (admin)
const adminGetBanners = async (req, res) => {
  try {
    const banners = await Banner.find().sort({ sortOrder: 1, createdAt: -1 });
    res.json({ success: true, banners });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Create banner
// @route   POST /api/admin/banners
// @access  Private (admin)
const createBanner = async (req, res) => {
  try {
    const { title, subtitle, link, startDate, endDate, sortOrder, isActive } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Banner image is required' });
    }

    const bannerData = {
      title,
      subtitle,
      link,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
      sortOrder: sortOrder ? Number(sortOrder) : 0,
      isActive: isActive === 'false' ? false : true,
      image: req.file.path,
      imagePublicId: req.file.filename,
    };

    const banner = await Banner.create(bannerData);
    res.status(201).json({ success: true, banner });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Update banner
// @route   PUT /api/admin/banners/:id
// @access  Private (admin)
const updateBanner = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) {
      return res.status(404).json({ success: false, message: 'Banner not found' });
    }

    const { title, subtitle, link, startDate, endDate, sortOrder, isActive } = req.body;

    if (title !== undefined) banner.title = title;
    if (subtitle !== undefined) banner.subtitle = subtitle;
    if (link !== undefined) banner.link = link;
    if (sortOrder !== undefined) banner.sortOrder = Number(sortOrder);
    if (isActive !== undefined) banner.isActive = isActive === 'false' ? false : true;
    
    if (startDate !== undefined) {
      banner.startDate = startDate ? new Date(startDate) : null;
    }
    if (endDate !== undefined) {
      banner.endDate = endDate ? new Date(endDate) : null;
    }

    if (req.file) {
      // Destroy old image on Cloudinary
      if (banner.imagePublicId) {
        try {
          await cloudinary.uploader.destroy(banner.imagePublicId);
        } catch (e) {
          console.warn('Cloudinary delete failed for', banner.imagePublicId);
        }
      }
      banner.image = req.file.path;
      banner.imagePublicId = req.file.filename;
    }

    await banner.save();
    res.json({ success: true, banner });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Delete banner
// @route   DELETE /api/admin/banners/:id
// @access  Private (admin)
const deleteBanner = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) {
      return res.status(404).json({ success: false, message: 'Banner not found' });
    }

    // Destroy image on Cloudinary
    if (banner.imagePublicId) {
      try {
        await cloudinary.uploader.destroy(banner.imagePublicId);
      } catch (e) {
        console.warn('Cloudinary delete failed for', banner.imagePublicId);
      }
    }

    await Banner.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Banner deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getBanners,
  adminGetBanners,
  createBanner,
  updateBanner,
  deleteBanner,
};
