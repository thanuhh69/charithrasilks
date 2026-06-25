const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    title: { type: String, required: true }, // snapshot at order time
    image: { type: String, required: true },
    color: { type: String, required: true },
    size: { type: String, required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true }, // price per unit at order time
  },
  { _id: false }
);

const orderAddressSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    mobile: { type: String, required: true },
    addressLine: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, required: true, unique: true }, // e.g. #303855332
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    items: [orderItemSchema],
    shippingAddress: { type: orderAddressSchema, required: true },

    totalMRP: { type: Number, required: true },
    discountOnMRP: { type: Number, default: 0 },
    couponCode: { type: String, default: null },
    couponDiscount: { type: Number, default: 0 },
    shippingCharges: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },

    paymentMethod: { type: String, enum: ['UPI', 'Razorpay', 'COD'], required: true },
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Paid', 'Failed', 'Refunded'],
      default: 'Pending',
    },
    razorpayOrderId: { type: String, default: null },
    razorpayPaymentId: { type: String, default: null },
    razorpaySignature: { type: String, default: null },
    upiId: { type: String, default: null },
    upiTransactionId: { type: String, default: null },

    orderStatus: {
      type: String,
      enum: ['Placed', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Returned'],
      default: 'Placed',
    },
    statusHistory: [
      {
        status: { type: String },
        note: { type: String, default: '' },
        changedAt: { type: Date, default: Date.now },
      },
    ],

    confirmedByAdmin: { type: Boolean, default: false },
    confirmedAt: { type: Date, default: null },

    trackingId: { type: String, default: '' },
    courierPartner: { type: String, default: '' },
    expectedDeliveryDate: { type: Date, default: null },
    deliveredAt: { type: Date, default: null },
    cancelledAt: { type: Date, default: null },
    cancelReason: { type: String, default: '' },

    adminNotes: { type: String, default: '' },
  },
  { timestamps: true }
);

orderSchema.index({ user: 1 });
orderSchema.index({ orderStatus: 1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ createdAt: -1 });

// Generate a unique 9-digit order number
orderSchema.statics.generateOrderNumber = function () {
  return Math.floor(100000000 + Math.random() * 900000000).toString();
};

module.exports = mongoose.model('Order', orderSchema);
