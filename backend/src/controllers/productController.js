const Product = require('../models/Product');
const Category = require('../models/Category');
const slugify = require('../utils/slugify');

// ============ PUBLIC / STOREFRONT ============

// @desc    Get products with filters, search, sort, pagination
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
  try {
    const {
      category,
      search,
      sort,
      minPrice,
      maxPrice,
      sizes,
      colors,
      rating,
      isFeatured,
      isNewArrival,
      isBestDeal,
      type,
      page = 1,
      limit = 12,
    } = req.query;

    const query = { isActive: true };
    const typeFilter = type || 'Saree';
    if (typeFilter === 'Saree') {
      query.type = { $in: ['Saree', null, undefined] };
    } else {
      query.type = typeFilter;
    }

    if (category) {
      const cat = await Category.findOne({ slug: category });
      if (cat) query.category = cat._id;
    }
    if (search) {
      // Check for exact match on productCode
      const trimmedSearch = search.trim();
      const exactProduct = await Product.findOne({ 
        productCode: { $regex: new RegExp(`^${trimmedSearch}$`, 'i') },
        isActive: true 
      });
      if (exactProduct) {
        return res.json({
          success: true,
          exactMatchProductSlug: exactProduct.slug,
          products: [exactProduct],
          pagination: { total: 1, page: 1, pages: 1, limit: 12 }
        });
      }

      const matchingCategories = await Category.find({ name: { $regex: search, $options: 'i' } });
      const catIds = matchingCategories.map((c) => c._id);
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
        { fabric: { $regex: search, $options: 'i' } },
        { productCode: { $regex: search, $options: 'i' } },
        { category: { $in: catIds } },
      ];
    }
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    if (sizes) {
      const sizeArr = sizes.split(',');
      query['variants.sizes.size'] = { $in: sizeArr };
    }
    if (colors) {
      const colorArr = colors.split(',');
      query['variants.color'] = { $in: colorArr };
    }
    if (rating) {
      query.ratingAverage = { $gte: Number(rating) };
    }
    if (isFeatured === 'true') query.isFeatured = true;
    if (isNewArrival === 'true') query.isNewArrival = true;
    if (isBestDeal === 'true') query.isBestDeal = true;

    let sortOption = { createdAt: -1 }; // Newest default
    if (sort === 'price_asc') sortOption = { price: 1 };
    if (sort === 'price_desc') sortOption = { price: -1 };
    if (sort === 'rating') sortOption = { ratingAverage: -1 };
    if (sort === 'popular') sortOption = { soldCount: -1 };

    const skip = (Number(page) - 1) * Number(limit);

    const [products, total] = await Promise.all([
      Product.find(query)
        .populate('category', 'name slug')
        .sort(sortOption)
        .skip(skip)
        .limit(Number(limit)),
      Product.countDocuments(query),
    ]);

    res.json({
      success: true,
      products,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
        limit: Number(limit),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get single product by slug
// @route   GET /api/products/:slug
// @access  Public
const getProductBySlug = async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug, isActive: true }).populate(
      'category',
      'name slug'
    );
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Add a review to a product
// @route   POST /api/products/:id/reviews
// @access  Private (user)
const addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    const alreadyReviewed = product.reviews.find((r) => r.user.toString() === req.user._id.toString());
    if (alreadyReviewed) {
      return res.status(400).json({ success: false, message: 'You already reviewed this product' });
    }

    product.reviews.push({
      user: req.user._id,
      name: req.user.name || 'Customer',
      rating: Number(rating),
      comment,
    });

    product.ratingCount = product.reviews.length;
    product.ratingAverage =
      product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length;

    await product.save();
    res.status(201).json({ success: true, message: 'Review added' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Get autocomplete search suggestions
// @route   GET /api/products/search/suggestions
// @access  Public
const getSearchSuggestions = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.json({ success: true, suggestions: { categories: [], products: [] } });
    }

    const [categories, products] = await Promise.all([
      Category.find({ name: { $regex: q, $options: 'i' }, isActive: true }).limit(5).select('name slug'),
      Product.find({
        $or: [
          { title: { $regex: q, $options: 'i' } },
          { productCode: { $regex: q, $options: 'i' } }
        ],
        isActive: true
      })
        .limit(10)
        .select('title slug thumbnail price')
        .populate('category', 'name'),
    ]);

    res.json({
      success: true,
      suggestions: {
        categories: categories.map((c) => ({ name: c.name, slug: c.slug })),
        products: products.map((p) => ({
          title: p.title,
          slug: p.slug,
          thumbnail: p.thumbnail,
          price: p.price,
          categoryName: p.category?.name || '',
        })),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ============ ADMIN ============

// @desc    Get all products (admin - includes inactive)
// @route   GET /api/admin/products
// @access  Private (admin)
const adminGetProducts = async (req, res) => {
  try {
    const { search, type, page = 1, limit = 20 } = req.query;
    const query = {};
    if (search) query.title = { $regex: search, $options: 'i' };
    if (type) {
      if (type === 'Saree') {
        query.type = { $in: ['Saree', null, undefined] };
      } else {
        query.type = type;
      }
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [products, total] = await Promise.all([
      Product.find(query)
        .populate('category', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Product.countDocuments(query),
    ]);

    res.json({
      success: true,
      products,
      pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get single product (admin)
// @route   GET /api/admin/products/:id
// @access  Private (admin)
const adminGetProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('category', 'name slug');
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Create product
// @route   POST /api/admin/products
// @access  Private (admin)
const createProduct = async (req, res) => {
  try {
    const data = req.body;

    if (!data.productCode) {
      return res.status(400).json({ success: false, message: 'Product Code / SKU is required' });
    }
    const existingCode = await Product.findOne({ productCode: data.productCode.trim() });
    if (existingCode) {
      return res.status(400).json({ success: false, message: 'Product Code already exists.' });
    }

    if (!data.slug) {
      data.slug = slugify(data.title) + '-' + Date.now().toString().slice(-5);
    }

    // variants may come as JSON string from multipart form
    if (typeof data.variants === 'string') {
      data.variants = JSON.parse(data.variants);
    }
    if (typeof data.specifications === 'string') {
      data.specifications = JSON.parse(data.specifications);
    }

    // If files were uploaded via multer (req.files), attach them to first variant
    if (req.files && req.files.length > 0) {
      const uploadedImages = req.files.map((f) => ({ url: f.path, publicId: f.filename }));
      if (data.variants && data.variants.length > 0) {
        data.variants[0].images = [...(data.variants[0].images || []), ...uploadedImages];
      }
    }

    const product = await Product.create(data);
    res.status(201).json({ success: true, product });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Update product
// @route   PUT /api/admin/products/:id
// @access  Private (admin)
const updateProduct = async (req, res) => {
  try {
    const data = req.body;
    if (typeof data.variants === 'string') {
      data.variants = JSON.parse(data.variants);
    }
    if (typeof data.specifications === 'string') {
      data.specifications = JSON.parse(data.specifications);
    }

    if (data.productCode) {
      const existingCode = await Product.findOne({ 
        productCode: data.productCode.trim(), 
        _id: { $ne: req.params.id } 
      });
      if (existingCode) {
        return res.status(400).json({ success: false, message: 'Product Code already exists.' });
      }
    }

    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    if (req.files && req.files.length > 0) {
      const uploadedImages = req.files.map((f) => ({ url: f.path, publicId: f.filename }));
      if (data.variants && data.variants.length > 0) {
        data.variants[0].images = [...(data.variants[0].images || []), ...uploadedImages];
      }
    }

    Object.assign(product, data);
    await product.save();

    res.json({ success: true, product });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Delete product
// @route   DELETE /api/admin/products/:id
// @access  Private (admin)
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    // Optionally delete images from Cloudinary
    const { cloudinary } = require('../config/upload');
    for (const variant of product.variants || []) {
      for (const img of variant.images || []) {
        if (img.publicId) {
          try {
            await cloudinary.uploader.destroy(img.publicId);
          } catch (e) {
            console.warn('Cloudinary delete failed for', img.publicId);
          }
        }
      }
    }

    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Toggle product active status
// @route   PATCH /api/admin/products/:id/toggle-active
// @access  Private (admin)
const toggleProductActive = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    product.isActive = !product.isActive;
    await product.save();
    res.json({ success: true, product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get product stats by type (admin)
// @route   GET /api/admin/products/stats
// @access  Private (admin)
const adminGetProductStats = async (req, res) => {
  try {
    const types = ['Saree', 'Accessory', 'Herbal'];
    const stats = {};

    for (const t of types) {
      const [total, active, outOfStock, featured] = await Promise.all([
        Product.countDocuments({ type: t }),
        Product.countDocuments({ type: t, isActive: true }),
        Product.countDocuments({ type: t, totalStock: 0 }),
        Product.countDocuments({ type: t, isFeatured: true }),
      ]);
      stats[t] = { total, active, outOfStock, featured };
    }

    res.json({ success: true, stats });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getProducts,
  getProductBySlug,
  addReview,
  getSearchSuggestions,
  adminGetProducts,
  adminGetProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleProductActive,
  adminGetProductStats,
};
