const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema(
  {
    label: { type: String, default: 'Home' }, // Home, Work, Other
    fullName: { type: String, required: true },
    mobile: { type: String, required: true },
    addressLine: { type: String, required: true }, // House no, street, area
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, default: '' },
    email: { type: String, default: null, lowercase: true, trim: true },
    mobile: { type: String, default: null, trim: true },
    // Firebase UID - the single source of truth linking to Firebase Auth (covers both phone OTP & Google)
    firebaseUid: { type: String, required: true, unique: true, index: true },
    authProvider: { type: String, enum: ['phone', 'google', 'both'], default: 'phone' },
    avatar: { type: String, default: '' },
    addresses: [addressSchema],
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    isActive: { type: Boolean, default: true },
    isBlocked: { type: Boolean, default: false },
  },
  { timestamps: true }
);

userSchema.index({ email: 1 });
userSchema.index({ mobile: 1 });

module.exports = mongoose.model('User', userSchema);
