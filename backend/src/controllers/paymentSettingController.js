const PaymentSetting = require('../models/PaymentSetting');

// @desc    Get active payment settings for checkout (public)
// @route   GET /api/payment-settings
// @access  Public
const getPublicPaymentSettings = async (req, res) => {
  try {
    let settings = await PaymentSetting.findOne();
    if (!settings) {
      // Return a blank structure instead of throwing so checkout loads
      return res.json({
        success: true,
        settings: {
          ownerName: '',
          upiId: '',
          qrCode: '',
          merchantDisplayName: '',
          enableUpiPayments: false,
          enableQrPayments: false,
        },
      });
    }

    res.json({
      success: true,
      settings: {
        ownerName: settings.ownerName,
        upiId: settings.upiId,
        qrCode: settings.qrCode,
        merchantDisplayName: settings.merchantDisplayName,
        enableUpiPayments: settings.enableUpiPayments,
        enableQrPayments: settings.enableQrPayments,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get full payment settings (admin)
// @route   GET /api/admin/payment-settings
// @access  Private (admin)
const getAdminPaymentSettings = async (req, res) => {
  try {
    let settings = await PaymentSetting.findOne();
    if (!settings) {
      // Create a default settings document on request if it doesn't exist
      settings = await PaymentSetting.create({
        ownerName: 'Charithra Silks',
        upiId: 'charithrasilks@upi',
        mobileNumber: '0000000000',
        merchantDisplayName: 'Charithra Silks',
        enableUpiPayments: true,
        enableQrPayments: true,
      });
    }
    res.json({ success: true, settings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Update payment settings (admin)
// @route   PUT /api/admin/payment-settings
// @access  Private (admin)
const updatePaymentSettings = async (req, res) => {
  try {
    const {
      ownerName,
      upiId,
      mobileNumber,
      merchantDisplayName,
      enableUpiPayments,
      enableQrPayments,
    } = req.body;

    if (!ownerName || !upiId || !mobileNumber) {
      return res.status(400).json({
        success: false,
        message: 'Owner Name, UPI ID, and Mobile Number are required',
      });
    }

    let settings = await PaymentSetting.findOne();

    const updateData = {
      ownerName,
      upiId,
      mobileNumber,
      merchantDisplayName: merchantDisplayName || '',
      enableUpiPayments: enableUpiPayments === 'true' || enableUpiPayments === true,
      enableQrPayments: enableQrPayments === 'true' || enableQrPayments === true,
    };

    if (req.file) {
      updateData.qrCode = req.file.path; // Cloudinary secure URL
    }

    if (settings) {
      settings = await PaymentSetting.findByIdAndUpdate(settings._id, updateData, {
        new: true,
        runValidators: true,
      });
    } else {
      settings = await PaymentSetting.create(updateData);
    }

    res.json({ success: true, settings, message: 'Payment settings updated successfully' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

module.exports = {
  getPublicPaymentSettings,
  getAdminPaymentSettings,
  updatePaymentSettings,
};
