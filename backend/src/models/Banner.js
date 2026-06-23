const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema(
  {
    title: { type: String, trim: true, default: '' },
    subtitle: { type: String, trim: true, default: '' },
    link: { type: String, trim: true, default: '' },
    image: { type: String, required: true }, // Cloudinary URL
    imagePublicId: { type: String, required: true }, // Cloudinary Public ID
    startDate: { type: Date, default: null }, // for scheduling
    endDate: { type: Date, default: null }, // for scheduling
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Banner', bannerSchema);
