const Cart = require('../models/Cart');
const Product = require('../models/Product');

// Helper to populate and shape cart response with live product data
const buildCartResponse = async (cart) => {
  const populated = await Cart.findById(cart._id).populate({
    path: 'items.product',
    select: 'title slug price mrp variants isActive',
  });

  const items = populated.items
    .filter((item) => item.product && item.product.isActive)
    .map((item) => {
      const variant = item.product.variants.find((v) => v._id.toString() === item.variantId.toString());
      const sizeStock = variant?.sizes.find((s) => s.size === item.size)?.stock ?? 0;
      return {
        _id: item._id,
        product: {
          _id: item.product._id,
          title: item.product.title,
          slug: item.product.slug,
          price: item.product.price,
          mrp: item.product.mrp,
        },
        variantId: item.variantId,
        color: item.color,
        size: item.size,
        quantity: item.quantity,
        image: variant?.images?.[0]?.url || '',
        currentPrice: item.product.price,
        availableStock: sizeStock,
      };
    });

  const totalMRP = items.reduce((sum, i) => sum + i.product.mrp * i.quantity, 0);
  const totalAmount = items.reduce((sum, i) => sum + i.currentPrice * i.quantity, 0);
  const discountOnMRP = totalMRP - totalAmount;

  return {
    _id: populated._id,
    items,
    couponCode: populated.couponCode,
    summary: {
      totalMRP,
      discountOnMRP,
      totalAmount,
      itemCount: items.reduce((sum, i) => sum + i.quantity, 0),
    },
  };
};

// @desc    Get current user's cart
// @route   GET /api/cart
// @access  Private
const getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }
    const response = await buildCartResponse(cart);
    res.json({ success: true, cart: response });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Add item to cart
// @route   POST /api/cart/items
// @access  Private
const addToCart = async (req, res) => {
  try {
    const { productId, variantId, color, size, quantity = 1 } = req.body;

    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const variant = product.variants.find((v) => v._id.toString() === variantId);
    if (!variant) return res.status(400).json({ success: false, message: 'Invalid variant selected' });

    const sizeObj = variant.sizes.find((s) => s.size === size);
    if (!sizeObj || sizeObj.stock < quantity) {
      return res.status(400).json({ success: false, message: 'Selected size is out of stock' });
    }

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }

    const existingItem = cart.items.find(
      (i) => i.product.toString() === productId && i.variantId.toString() === variantId && i.size === size
    );

    if (existingItem) {
      existingItem.quantity += Number(quantity);
    } else {
      cart.items.push({
        product: productId,
        variantId,
        color,
        size,
        quantity,
        priceAtAdd: product.price,
      });
    }

    await cart.save();
    const response = await buildCartResponse(cart);
    res.status(201).json({ success: true, cart: response });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Update cart item quantity
// @route   PUT /api/cart/items/:itemId
// @access  Private
const updateCartItem = async (req, res) => {
  try {
    const { quantity } = req.body;
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' });

    const item = cart.items.find((i) => i._id.toString() === req.params.itemId);
    if (!item) return res.status(404).json({ success: false, message: 'Cart item not found' });

    if (quantity <= 0) {
      cart.items = cart.items.filter((i) => i._id.toString() !== req.params.itemId);
    } else {
      item.quantity = quantity;
    }

    await cart.save();
    const response = await buildCartResponse(cart);
    res.json({ success: true, cart: response });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/items/:itemId
// @access  Private
const removeCartItem = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' });

    cart.items = cart.items.filter((i) => i._id.toString() !== req.params.itemId);
    await cart.save();

    const response = await buildCartResponse(cart);
    res.json({ success: true, cart: response });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Apply coupon code to cart
// @route   POST /api/cart/apply-coupon
// @access  Private
const applyCoupon = async (req, res) => {
  try {
    const { code } = req.body;
    const Coupon = require('../models/Coupon');

    const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });
    if (!coupon) return res.status(404).json({ success: false, message: 'Invalid coupon code' });
    if (coupon.expiryDate < new Date()) {
      return res.status(400).json({ success: false, message: 'Coupon has expired' });
    }
    if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({ success: false, message: 'Coupon usage limit reached' });
    }

    const cart = await Cart.findOne({ user: req.user._id });
    const response = await buildCartResponse(cart);

    if (response.summary.totalAmount < coupon.minOrderValue) {
      return res.status(400).json({
        success: false,
        message: `Minimum order value of ₹${coupon.minOrderValue} required for this coupon`,
      });
    }

    cart.couponCode = coupon.code;
    await cart.save();

    let discount =
      coupon.discountType === 'percent'
        ? (response.summary.totalAmount * coupon.discountValue) / 100
        : coupon.discountValue;
    if (coupon.maxDiscountAmount) discount = Math.min(discount, coupon.maxDiscountAmount);

    res.json({
      success: true,
      message: 'Coupon applied successfully',
      couponDiscount: Math.round(discount),
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Remove coupon from cart
// @route   DELETE /api/cart/apply-coupon
// @access  Private
const removeCoupon = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (cart) {
      cart.couponCode = null;
      await cart.save();
    }
    res.json({ success: true, message: 'Coupon removed' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Clear cart (after order placed)
// @route   DELETE /api/cart
// @access  Private
const clearCart = async (req, res) => {
  try {
    await Cart.findOneAndUpdate({ user: req.user._id }, { items: [], couponCode: null });
    res.json({ success: true, message: 'Cart cleared' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  applyCoupon,
  removeCoupon,
  clearCart,
  buildCartResponse,
};
