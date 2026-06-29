const crypto = require('crypto');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');
const { buildCartResponse } = require('./cartController');
const { getRazorpayInstance } = require('../config/razorpay');

const SHIPPING_FLAT_RATE = 100;

// ============ USER SIDE ============

// @desc    Create a Razorpay order (for online payment) before final placement
// @route   POST /api/orders/razorpay/create
// @access  Private
const createRazorpayOrder = async (req, res) => {
  try {
    const razorpay = getRazorpayInstance();
    if (!razorpay) {
      return res.status(500).json({
        success: false,
        message: 'Razorpay is not configured on the server yet. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to .env',
      });
    }

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: 'Your cart is empty' });
    }

    const cartData = await buildCartResponse(cart);
    const shippingCharges = SHIPPING_FLAT_RATE;
    const amountInPaise = Math.round((cartData.summary.totalAmount + shippingCharges) * 100);

    const razorpayOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: `rcpt_${Date.now()}`,
    });

    res.json({ success: true, razorpayOrder, keyId: process.env.RAZORPAY_KEY_ID });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Place order (works for COD, UPI-manual, or after Razorpay payment success)
// @route   POST /api/orders
// @access  Private
const placeOrder = async (req, res) => {
  try {
    const { addressId, paymentMethod, razorpayOrderId, razorpayPaymentId, razorpaySignature, upiId, upiTransactionId } = req.body;

    if (!['UPI', 'UPI_APP', 'UPI_QR'].includes(paymentMethod)) {
      return res.status(400).json({ success: false, message: 'Invalid payment method. Only UPI is accepted.' });
    }

    const address = req.user.addresses.find((a) => a._id.toString() === addressId);
    if (!address) return res.status(400).json({ success: false, message: 'Please select a valid address' });

    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: 'Your cart is empty' });
    }

    // Verify Razorpay payment signature if that method was used
    let paymentStatus = 'Pending';
    if (paymentMethod === 'Razorpay') {
      if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
        return res.status(400).json({ success: false, message: 'Missing payment verification details' });
      }
      const body = `${razorpayOrderId}|${razorpayPaymentId}`;
      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(body)
        .digest('hex');

      if (expectedSignature !== razorpaySignature) {
        return res.status(400).json({ success: false, message: 'Payment verification failed' });
      }
      paymentStatus = 'Paid';
    }

    // Build order items snapshot & validate + decrement stock
    const orderItems = [];
    let totalMRP = 0;
    let totalAmount = 0;

    for (const item of cart.items) {
      const product = item.product;
      if (!product || !product.isActive) {
        return res.status(400).json({ success: false, message: `A product in your cart is no longer available` });
      }
      const variant = product.variants.find((v) => v._id.toString() === item.variantId.toString());
      if (!variant) continue;
      const sizeObj = variant.sizes.find((s) => s.size === item.size);
      if (!sizeObj || sizeObj.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `${product.title} (${item.color}, ${item.size}) doesn't have enough stock`,
        });
      }

      sizeObj.stock -= item.quantity;
      product.soldCount += item.quantity;
      await product.save();

      orderItems.push({
        product: product._id,
        title: product.title,
        image: variant.images?.[0]?.url || '',
        color: item.color,
        size: item.size,
        quantity: item.quantity,
        price: product.price,
      });

      totalMRP += product.mrp * item.quantity;
      totalAmount += product.price * item.quantity;
    }

    let couponDiscount = 0;
    if (cart.couponCode) {
      const coupon = await Coupon.findOne({ code: cart.couponCode, isActive: true });
      if (coupon) {
        couponDiscount =
          coupon.discountType === 'percent' ? (totalAmount * coupon.discountValue) / 100 : coupon.discountValue;
        if (coupon.maxDiscountAmount) couponDiscount = Math.min(couponDiscount, coupon.maxDiscountAmount);
        coupon.usedCount += 1;
        await coupon.save();
      }
    }

    const discountOnMRP = totalMRP - totalAmount;
    const shippingCharges = SHIPPING_FLAT_RATE;
    const finalAmount = totalAmount - couponDiscount + shippingCharges;

    let orderNumber;
    let exists = true;
    while (exists) {
      orderNumber = Order.generateOrderNumber();
      exists = await Order.findOne({ orderNumber });
    }

    const order = await Order.create({
      orderNumber,
      user: req.user._id,
      items: orderItems,
      shippingAddress: {
        fullName: address.fullName,
        mobile: address.mobile,
        addressLine: address.addressLine,
        city: address.city,
        state: address.state,
        pincode: address.pincode,
      },
      totalMRP,
      discountOnMRP,
      couponCode: cart.couponCode,
      couponDiscount,
      shippingCharges,
      totalAmount: finalAmount,
      paymentMethod,
      paymentStatus,
      upiId: upiId || null,
      upiTransactionId: upiTransactionId || null,
      razorpayOrderId: razorpayOrderId || null,
      razorpayPaymentId: razorpayPaymentId || null,
      razorpaySignature: razorpaySignature || null,
      orderStatus: ['UPI_APP', 'UPI_QR'].includes(paymentMethod) ? 'Awaiting Payment Verification' : 'Placed',
      statusHistory: [
        {
          status: ['UPI_APP', 'UPI_QR'].includes(paymentMethod) ? 'Awaiting Payment Verification' : 'Placed',
          note: ['UPI_APP', 'UPI_QR'].includes(paymentMethod) ? 'Order placed, awaiting customer payment proof' : 'Order placed by customer',
        },
      ],
      expectedDeliveryDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), // +4 days estimate
    });

    // Clear cart
    cart.items = [];
    cart.couponCode = null;
    await cart.save();

    res.status(201).json({ success: true, order });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Get current user's orders
// @route   GET /api/orders
// @access  Private
const getMyOrders = async (req, res) => {
  try {
    const { status } = req.query;
    const query = { user: req.user._id };
    if (status && status !== 'All') query.orderStatus = status;

    const orders = await Order.find(query).sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get single order detail (user)
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Cancel an order (user, only if not yet shipped)
// @route   PUT /api/orders/:id/cancel
// @access  Private
const cancelOrderByUser = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    if (!['Placed', 'Confirmed', 'Processing'].includes(order.orderStatus)) {
      return res.status(400).json({ success: false, message: 'This order can no longer be cancelled' });
    }

    order.orderStatus = 'Cancelled';
    order.cancelledAt = new Date();
    order.cancelReason = req.body.reason || 'Cancelled by customer';
    order.statusHistory.push({ status: 'Cancelled', note: order.cancelReason });

    // Restock items
    for (const item of order.items) {
      const product = await Product.findById(item.product);
      if (product) {
        const variant = product.variants.find((v) =>
          v.images?.some((i) => i.url === item.image) || v.color === item.color
        );
        if (variant) {
          const sizeObj = variant.sizes.find((s) => s.size === item.size);
          if (sizeObj) sizeObj.stock += item.quantity;
        }
        product.soldCount = Math.max(0, product.soldCount - item.quantity);
        await product.save();
      }
    }

    await order.save();
    res.json({ success: true, order });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// ============ ADMIN SIDE ============

// @desc    Get all orders (admin) with filters
// @route   GET /api/admin/orders
// @access  Private (admin)
const adminGetOrders = async (req, res) => {
  try {
    const { status, paymentStatus, search, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status && status !== 'All') query.orderStatus = status;
    if (paymentStatus && paymentStatus !== 'All') query.paymentStatus = paymentStatus;
    if (search) query.orderNumber = { $regex: search, $options: 'i' };

    const skip = (Number(page) - 1) * Number(limit);
    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate('user', 'name email mobile')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Order.countDocuments(query),
    ]);

    res.json({
      success: true,
      orders,
      pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get single order detail (admin)
// @route   GET /api/admin/orders/:id
// @access  Private (admin)
const adminGetOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email mobile');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Confirm order (admin) — the key "confirming the order" action requested
// @route   PUT /api/admin/orders/:id/confirm
// @access  Private (admin)
const confirmOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    if (order.orderStatus !== 'Placed') {
      return res.status(400).json({ success: false, message: 'Only newly placed orders can be confirmed' });
    }

    order.confirmedByAdmin = true;
    order.confirmedAt = new Date();
    order.orderStatus = 'Confirmed';
    order.statusHistory.push({ status: 'Confirmed', note: 'Order confirmed by admin' });

    await order.save();
    res.json({ success: true, order, message: 'Order confirmed successfully' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Update order status (admin) — Processing/Shipped/Delivered/Cancelled/Returned
// @route   PUT /api/admin/orders/:id/status
// @access  Private (admin)
const updateOrderStatus = async (req, res) => {
  try {
    const { status, note, trackingId, courierPartner } = req.body;
    const validStatuses = ['Processing', 'Shipped', 'Delivered', 'Cancelled', 'Returned'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    order.orderStatus = status;
    if (trackingId) order.trackingId = trackingId;
    if (courierPartner) order.courierPartner = courierPartner;
    if (status === 'Delivered') order.deliveredAt = new Date();
    if (status === 'Cancelled') order.cancelledAt = new Date();

    order.statusHistory.push({ status, note: note || `Status updated to ${status} by admin` });

    await order.save();
    res.json({ success: true, order });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Update payment status (admin) — confirming payments done, e.g. for COD or manual UPI verification
// @route   PUT /api/admin/orders/:id/payment-status
// @access  Private (admin)
const updatePaymentStatus = async (req, res) => {
  try {
    const { paymentStatus, note } = req.body;
    const validStatuses = ['Pending', 'Paid', 'Failed', 'Refunded'];
    if (!validStatuses.includes(paymentStatus)) {
      return res.status(400).json({ success: false, message: 'Invalid payment status' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    order.paymentStatus = paymentStatus;
    order.statusHistory.push({
      status: `Payment: ${paymentStatus}`,
      note: note || `Payment marked as ${paymentStatus} by admin`,
    });

    await order.save();
    res.json({ success: true, order, message: 'Payment status updated' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Add admin notes to an order
// @route   PUT /api/admin/orders/:id/notes
// @access  Private (admin)
const updateAdminNotes = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    order.adminNotes = req.body.adminNotes || '';
    await order.save();
    res.json({ success: true, order });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Dashboard stats (admin home)
// @route   GET /api/admin/orders/stats
// @access  Private (admin)
const getOrderStats = async (req, res) => {
  try {
    const [totalOrders, pendingConfirmation, totalRevenueAgg, pendingPayments, statusCounts] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ orderStatus: 'Placed' }),
      Order.aggregate([
        { $match: { paymentStatus: 'Paid' } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ]),
      Order.countDocuments({ paymentStatus: 'Pending' }),
      Order.aggregate([{ $group: { _id: '$orderStatus', count: { $sum: 1 } } }]),
    ]);

    res.json({
      success: true,
      stats: {
        totalOrders,
        pendingConfirmation,
        totalRevenue: totalRevenueAgg[0]?.total || 0,
        pendingPayments,
        statusBreakdown: statusCounts.reduce((acc, s) => ({ ...acc, [s._id]: s.count }), {}),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Submit payment proof (UTR / Transaction ID & Screenshot) for UPI order
// @route   PUT /api/orders/:id/submit-payment
// @access  Private
const submitPaymentProof = async (req, res) => {
  try {
    const { utrNumber } = req.body;
    if (!utrNumber || utrNumber.trim().length < 6) {
      return res.status(400).json({ success: false, message: 'Please provide a valid UTR / Transaction ID' });
    }

    const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Check if UTR is already in use by another order
    const utrExists = await Order.findOne({ utrNumber: utrNumber.trim(), _id: { $ne: order._id } });
    if (utrExists) {
      return res.status(400).json({ success: false, message: 'This UTR / Transaction ID has already been submitted for another order' });
    }

    order.utrNumber = utrNumber.trim();
    if (req.file) {
      order.paymentScreenshot = req.file.path;
    }
    
    order.verificationStatus = 'Pending';
    order.paymentSubmissionTime = new Date();
    order.orderStatus = 'Awaiting Payment Verification';
    order.statusHistory.push({
      status: 'Awaiting Payment Verification',
      note: `Payment proof submitted. UTR: ${utrNumber}`,
    });

    await order.save();
    res.json({ success: true, order, message: 'Payment details submitted successfully' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Verify payment and confirm order (admin)
// @route   PUT /api/admin/orders/:id/verify-payment
// @access  Private (admin)
const verifyPayment = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.orderStatus !== 'Awaiting Payment Verification') {
      return res.status(400).json({ success: false, message: 'Order is not awaiting payment verification' });
    }

    order.orderStatus = 'Confirmed';
    order.paymentStatus = 'Paid';
    order.verificationStatus = 'Verified';
    order.verifiedBy = req.admin._id;
    order.verifiedAt = new Date();
    order.confirmedByAdmin = true;
    order.confirmedAt = new Date();

    order.statusHistory.push({
      status: 'Confirmed',
      note: `Payment verified by ${req.admin.name}. Order confirmed.`,
    });

    await order.save();
    res.json({ success: true, order, message: 'Payment verified and order confirmed successfully' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Reject payment and fail order (admin)
// @route   PUT /api/admin/orders/:id/reject-payment
// @access  Private (admin)
const rejectPayment = async (req, res) => {
  try {
    const { reason } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.orderStatus !== 'Awaiting Payment Verification') {
      return res.status(400).json({ success: false, message: 'Order is not awaiting payment verification' });
    }

    order.orderStatus = 'Payment Failed';
    order.paymentStatus = 'Failed';
    order.verificationStatus = 'Rejected';
    order.verifiedBy = req.admin._id;
    order.verifiedAt = new Date();

    order.statusHistory.push({
      status: 'Payment Failed',
      note: `Payment rejected by ${req.admin.name}. Reason: ${reason || 'Invalid details'}`,
    });

    await order.save();
    res.json({ success: true, order, message: 'Payment rejected successfully' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

module.exports = {
  createRazorpayOrder,
  placeOrder,
  getMyOrders,
  getOrderById,
  cancelOrderByUser,
  adminGetOrders,
  adminGetOrder,
  confirmOrder,
  updateOrderStatus,
  updatePaymentStatus,
  updateAdminNotes,
  getOrderStats,
  submitPaymentProof,
  verifyPayment,
  rejectPayment,
};
