const mongoose = require('mongoose');

const variantSchema = new mongoose.Schema(
  {
    color: { type: String, required: true }, // e.g. "Maroon"
    colorHex: { type: String, default: '#000000' }, // for swatch UI
    images: [
      {
        url: { type: String, required: true },
        publicId: { type: String, default: '' },
      },
    ],
    sizes: [
      {
        size: { type: String, enum: ['Free Size', 'S', 'M', 'L', 'XL', 'XXL'], default: 'Free Size' },
        stock: { type: Number, default: 0 },
      },
    ],
  },
  { _id: true }
);

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, default: '' },
  },
  { timestamps: true }
);

const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, default: '' },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    brand: { type: String, default: 'Charithra Silks' },
    fabric: { type: String, default: '' }, // Silk, Cotton, Linen etc
    sku: { type: String, unique: true, sparse: true },
    productCode: { type: String, required: true, unique: true, trim: true },

    mrp: { type: Number, required: true }, // original price
    price: { type: Number, required: true }, // selling price
    discountPercent: { type: Number, default: 0 },
    taxIncluded: { type: Boolean, default: true },

    variants: [variantSchema], // colors -> images + sizes/stock

    // Flattened default images (first variant) shown in listing cards
    thumbnail: { type: String, default: '' },

    careInstructions: { type: String, default: '' },
    specifications: [
      {
        key: { type: String },
        value: { type: String },
      },
    ],

    ratingAverage: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
    reviews: [reviewSchema],

    type: { type: String, enum: ['Saree', 'Accessory', 'Herbal'], default: 'Saree', index: true },
    material: { type: String, default: '' },
    weight: { type: String, default: '' },
    ingredients: { type: String, default: '' },
    benefits: { type: String, default: '' },
    usageInstructions: { type: String, default: '' },

    isFeatured: { type: Boolean, default: false },
    isNewArrival: { type: Boolean, default: false },
    isBestDeal: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },

    totalStock: { type: Number, default: 0 }, // computed from variants
    soldCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

productSchema.index({ title: 'text', description: 'text', fabric: 'text' });
productSchema.index({ category: 1 });
productSchema.index({ type: 1 });
productSchema.index({ isFeatured: 1 });
productSchema.index({ isNewArrival: 1 });
productSchema.index({ isBestDeal: 1 });

// Auto compute discountPercent and totalStock before save
productSchema.pre('save', function (next) {
  if (this.mrp > 0) {
    this.discountPercent = Math.round(((this.mrp - this.price) / this.mrp) * 100);
  }
  if (this.variants && this.variants.length > 0) {
    this.totalStock = this.variants.reduce((sum, v) => {
      const variantStock = (v.sizes || []).reduce((s, sz) => s + (sz.stock || 0), 0);
      return sum + variantStock;
    }, 0);
    if (!this.thumbnail && this.variants[0]?.images?.[0]?.url) {
      this.thumbnail = this.variants[0].images[0].url;
    }
  }
  next();
});

module.exports = mongoose.model('Product', productSchema);
