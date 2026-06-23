const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Auto-migrate: Assign unique productCode to existing products that do not have one
    const Product = require('../models/Product');
    const productsWithoutCode = await Product.find({ 
      $or: [
        { productCode: { $exists: false } },
        { productCode: null },
        { productCode: '' }
      ]
    });
    if (productsWithoutCode.length > 0) {
      console.log(`[Migration] Found ${productsWithoutCode.length} products without productCode. Migrating...`);
      for (let i = 0; i < productsWithoutCode.length; i++) {
        const p = productsWithoutCode[i];
        const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
        p.productCode = `CS-${i + 100}-${randomStr}`;
        await p.save();
      }
      console.log(`[Migration] Successfully updated existing products with unique codes.`);
    }
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
