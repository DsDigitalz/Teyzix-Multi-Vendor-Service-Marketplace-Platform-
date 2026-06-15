const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure cloudinary with your credentials
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Storage config for profile pictures
const profilePicStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'teyzix/profile-pics',   // folder name in your Cloudinary media library
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 400, height: 400, crop: 'fill', gravity: 'face' }],
  },
});

// Storage config for portfolio items
const portfolioStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'teyzix/portfolio',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'pdf'],
    transformation: [{ width: 800, quality: 'auto' }],
  },
});

// Multer upload instances — used directly in routes
const uploadProfilePic = multer({
  storage: profilePicStorage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB max
});

const uploadPortfolio = multer({
  storage: portfolioStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
});

module.exports = { cloudinary, uploadProfilePic, uploadPortfolio };