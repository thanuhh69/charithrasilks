const mongoose = require('mongoose');

const instagramPostSchema = new mongoose.Schema(
  {
    image: {
      type: String,
      required: true,
    },
    imagePublicId: {
      type: String,
      required: true,
    },
    link: {
      type: String,
      required: true,
      trim: true,
    },
    caption: {
      type: String,
      trim: true,
      default: '',
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('InstagramPost', instagramPostSchema);
