require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorHandler');

// Public/storefront routes
const authRoutes = require('./routes/authRoutes');
const paymentSettingRoutes = require('./routes/paymentSettingRoutes');
const productRoutes = require('./routes/productRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const cartRoutes = require('./routes/cartRoutes');
const addressRoutes = require('./routes/addressRoutes');
const orderRoutes = require('./routes/orderRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');
const bannerRoutes = require('./routes/bannerRoutes');

// Admin routes
const adminAuthRoutes = require('./routes/admin/adminAuthRoutes');
const adminPaymentRoutes = require('./routes/admin/adminPaymentRoutes');
const adminProductRoutes = require('./routes/admin/adminProductRoutes');
const adminCategoryRoutes = require('./routes/admin/adminCategoryRoutes');
const adminOrderRoutes = require('./routes/admin/adminOrderRoutes');
const adminMiscRoutes = require('./routes/admin/adminMiscRoutes');
const adminBannerRoutes = require('./routes/admin/adminBannerRoutes');

const app = express();

// Connect to MongoDB
connectDB();

// Security & utility middleware
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(compression());
app.use(
  cors({
    origin: process.env.CLIENT_URL || '*',
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Basic rate limiting on all API routes
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', apiLimiter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Charithra Silks API is running', timestamp: new Date() });
});

// ===== Public / storefront routes =====
app.use('/api/auth', authRoutes);
app.use('/api/payment-settings', paymentSettingRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/banners', bannerRoutes);

// ===== Admin routes =====
app.use('/api/admin/auth', adminAuthRoutes);
app.use('/api/admin/payments', adminPaymentRoutes);
app.use('/api/admin/products', adminProductRoutes);
app.use('/api/admin/categories', adminCategoryRoutes);
app.use('/api/admin/orders', adminOrderRoutes);
app.use('/api/admin/banners', adminBannerRoutes);
app.use('/api/admin', adminMiscRoutes); // /api/admin/customers, /api/admin/coupons

// 404 + error handler
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 Charithra Silks API server running on port ${PORT}`);
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`   Health check: http://localhost:${PORT}/api/health\n`);
});

module.exports = app;
