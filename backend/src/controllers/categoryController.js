const Category = require('../models/Category');
const slugify = require('../utils/slugify');

// @desc    Get all active categories (storefront)
// @route   GET /api/categories
const getCategories = async (req, res) => {
  try {
    const type = req.query.type || 'Saree';
    const query = { isActive: true };
    if (type === 'Saree') {
      query.type = { $in: ['Saree', null, undefined] };
    } else {
      query.type = type;
    }
    const categories = await Category.find(query).sort({ sortOrder: 1, name: 1 });
    res.json({ success: true, categories });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get all categories (admin - includes inactive)
// @route   GET /api/admin/categories
const adminGetCategories = async (req, res) => {
  try {
    const query = {};
    if (req.query.type) {
      if (req.query.type === 'Saree') {
        query.type = { $in: ['Saree', null, undefined] };
      } else {
        query.type = req.query.type;
      }
    }
    const categories = await Category.find(query).sort({ sortOrder: 1, name: 1 });
    res.json({ success: true, categories });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Create category
// @route   POST /api/admin/categories
const createCategory = async (req, res) => {
  try {
    const { name, description, sortOrder, type } = req.body;
    const slug = slugify(name);

    const categoryData = { name, slug, description, sortOrder, type: type || 'Saree' };
    if (req.file) {
      categoryData.image = req.file.path;
      categoryData.imagePublicId = req.file.filename;
    }

    const category = await Category.create(categoryData);
    res.status(201).json({ success: true, category });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Update category
// @route   PUT /api/admin/categories/:id
const updateCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });

    const { name, description, sortOrder, isActive, type } = req.body;
    if (name) {
      category.name = name;
      category.slug = slugify(name);
    }
    if (description !== undefined) category.description = description;
    if (sortOrder !== undefined) category.sortOrder = sortOrder;
    if (isActive !== undefined) category.isActive = isActive;
    if (type !== undefined) category.type = type;

    if (req.file) {
      category.image = req.file.path;
      category.imagePublicId = req.file.filename;
    }

    await category.save();
    res.json({ success: true, category });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Delete category
// @route   DELETE /api/admin/categories/:id
const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
    res.json({ success: true, message: 'Category deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getCategories,
  adminGetCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};
