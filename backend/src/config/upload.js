const multer = require('multer');
const cloudinary = require('./cloudinary');

/**
 * Custom multer storage engine that uploads directly to Cloudinary.
 * Replaces multer-storage-cloudinary, which only supports the old Cloudinary v1 SDK
 * and conflicts with cloudinary@2.x. This does the same job with no extra dependency.
 */
function makeCloudinaryStorage({ folder, transformation }) {
  return {
    _handleFile(req, file, cb) {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder, transformation, resource_type: 'image' },
        (error, result) => {
          if (error) return cb(error);
          cb(null, {
            path: result.secure_url, // matches what the rest of the codebase expects as `.path`
            filename: result.public_id, // matches what the rest of the codebase expects as `.filename`
            size: result.bytes,
          });
        }
      );
      // multer custom storage engines provide the incoming file as a readable stream (file.stream)
      file.stream.pipe(uploadStream);
    },
    _removeFile(req, file, cb) {
      if (file.filename) {
        cloudinary.uploader.destroy(file.filename).then(() => cb(null)).catch(cb);
      } else {
        cb(null);
      }
    },
  };
}

const productStorage = makeCloudinaryStorage({
  folder: 'charithra-silks/products',
  transformation: [{ width: 1200, height: 1500, crop: 'limit', quality: 'auto' }],
});

const bannerStorage = makeCloudinaryStorage({
  folder: 'charithra-silks/banners',
  transformation: [{ width: 1600, crop: 'limit', quality: 'auto' }],
});

const screenshotStorage = makeCloudinaryStorage({
  folder: 'charithra-silks/payments',
  transformation: [{ width: 1000, crop: 'limit', quality: 'auto' }],
});

const qrStorage = makeCloudinaryStorage({
  folder: 'charithra-silks/payment-settings',
  transformation: [{ width: 800, crop: 'limit', quality: 'auto' }],
});

const uploadProductImages = multer({
  storage: productStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed'));
    }
    cb(null, true);
  },
});

const uploadBannerImage = multer({
  storage: bannerStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed'));
    }
    cb(null, true);
  },
});

const uploadPaymentScreenshot = multer({
  storage: screenshotStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed'));
    }
    cb(null, true);
  },
});

const uploadQrCode = multer({
  storage: qrStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed'));
    }
    cb(null, true);
  },
});

module.exports = {
  uploadProductImages,
  uploadBannerImage,
  uploadPaymentScreenshot,
  uploadQrCode,
  cloudinary,
};
