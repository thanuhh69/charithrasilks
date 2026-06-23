require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('../models/Admin');
const Category = require('../models/Category');
const Product = require('../models/Product');
const slugify = require('./slugify');

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB for seeding...');

    // ---- Seed Admin ----
    const adminEmail = process.env.ADMIN_SEED_EMAIL || 'admin@charithrasilks.com';
    const existingAdmin = await Admin.findOne({ email: adminEmail });
    if (!existingAdmin) {
      await Admin.create({
        name: process.env.ADMIN_SEED_NAME || 'Super Admin',
        email: adminEmail,
        password: process.env.ADMIN_SEED_PASSWORD || 'Admin@12345',
        role: 'superadmin',
      });
      console.log(`✅ Admin created: ${adminEmail} / ${process.env.ADMIN_SEED_PASSWORD || 'Admin@12345'}`);
    } else {
      console.log('ℹ️  Admin already exists, skipping.');
    }

    // ---- Seed Categories ----
    const categoryNames = [
      'Banaras', 'Pattu', 'Mysore Crepe', 'Fancy', 'Linen', 'Dola',
      'Handloom Cotton', 'Celebrity Collection', 'Georgette', 'Chiffon', 'Tussar Silk', 'New Arrivals',
    ];
    const categoryDocs = {};
    for (const name of categoryNames) {
      const slug = slugify(name);
      let cat = await Category.findOne({ slug });
      if (!cat) {
        cat = await Category.create({ name, slug });
        console.log(`✅ Category created: ${name}`);
      }
      categoryDocs[name] = cat;
    }

    // ---- Seed Sample Products ----
    const sampleProducts = [
      {
        title: 'Banarasi Silk Saree',
        productCode: 'CS001',
        category: categoryDocs['Banaras']._id,
        fabric: 'Pure Silk',
        mrp: 5299,
        price: 2599,
        isNewArrival: true,
        isBestDeal: true,
        isFeatured: true,
        description:
          'Exquisite handwoven Banarasi silk saree featuring intricate zari work, perfect for weddings and festive occasions.',
        careInstructions: 'Dry clean only. Store in a muslin cloth away from direct sunlight.',
        variants: [
          {
            color: 'Maroon',
            colorHex: '#7a1f2b',
            images: [{ url: 'https://res.cloudinary.com/demo/image/upload/sample.jpg', publicId: '' }],
            sizes: [{ size: 'Free Size', stock: 25 }],
          },
          {
            color: 'Green',
            colorHex: '#2f4f3f',
            images: [{ url: 'https://res.cloudinary.com/demo/image/upload/sample.jpg', publicId: '' }],
            sizes: [{ size: 'Free Size', stock: 15 }],
          },
        ],
      },
      {
        title: 'Kanjivaram Pattu Saree',
        productCode: 'CS002',
        category: categoryDocs['Pattu']._id,
        fabric: 'Kanjivaram Silk',
        mrp: 5899,
        price: 2799,
        isNewArrival: true,
        isFeatured: true,
        description: 'Traditional Kanjivaram pattu saree with rich temple border design and contrast pallu.',
        variants: [
          {
            color: 'Green',
            colorHex: '#1f4d3d',
            images: [{ url: 'https://res.cloudinary.com/demo/image/upload/sample.jpg', publicId: '' }],
            sizes: [{ size: 'Free Size', stock: 20 }],
          },
        ],
      },
      {
        title: 'Mysore Crepe Saree',
        productCode: 'CS003',
        category: categoryDocs['Mysore Crepe']._id,
        fabric: 'Crepe Silk',
        mrp: 2599,
        price: 1899,
        isBestDeal: true,
        description: 'Lightweight Mysore crepe silk saree, ideal for everyday elegance.',
        variants: [
          {
            color: 'Pink',
            colorHex: '#c2487a',
            images: [{ url: 'https://res.cloudinary.com/demo/image/upload/sample.jpg', publicId: '' }],
            sizes: [{ size: 'Free Size', stock: 30 }],
          },
        ],
      },
      {
        title: 'Katan Banarasi Saree',
        productCode: 'CS004',
        category: categoryDocs['Banaras']._id,
        fabric: 'Katan Silk',
        mrp: 6899,
        price: 3199,
        isNewArrival: true,
        description: 'Premium Katan Banarasi saree with all-over floral motifs.',
        variants: [
          {
            color: 'Maroon',
            colorHex: '#7a1f2b',
            images: [{ url: 'https://res.cloudinary.com/demo/image/upload/sample.jpg', publicId: '' }],
            sizes: [{ size: 'Free Size', stock: 12 }],
          },
        ],
      },
    ];

    for (const p of sampleProducts) {
      const slug = slugify(p.title) + '-' + Math.floor(Math.random() * 100000);
      const exists = await Product.findOne({ title: p.title });
      if (!exists) {
        await Product.create({ ...p, slug });
        console.log(`✅ Product created: ${p.title}`);
      }
    }

    console.log('\n🎉 Seeding complete!\n');
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
};

seed();
