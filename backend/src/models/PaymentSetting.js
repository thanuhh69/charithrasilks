const mongoose = require('mongoose');

const paymentSettingSchema = new mongoose.Schema(
  {
    ownerName: {
      type: String,
      required: true,
      trim: true,
    },
    upiId: {
      type: String,
      required: true,
      trim: true,
    },
    mobileNumber: {
      type: String,
      required: true,
      trim: true,
    },
    qrCode: {
      type: String,
      default: '',
    },
    merchantDisplayName: {
      type: String,
      default: '',
      trim: true,
    },
    enableUpiPayments: {
      type: Boolean,
      default: true,
    },
    enableQrPayments: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('PaymentSetting', paymentSettingSchema);
