const express = require('express');
const router = express.Router();
const {
  getMyProfile,
  updateProfile,
  uploadProfilePicture,
  addPortfolioItem,
  removePortfolioItem,
  getProviderByUserId,
} = require('../controllers/providerController');
const { verifyToken, checkRole } = require('../middleware/auth');
const { uploadProfilePic, uploadPortfolio } = require('../config/cloudinary');

// Public
router.get('/:userId', getProviderByUserId);

// Private — provider only
router.get('/profile/me', verifyToken, checkRole('provider'), getMyProfile);
router.put('/profile/me', verifyToken, checkRole('provider'), updateProfile);

router.put(
  '/profile/picture',
  verifyToken,
  checkRole('provider'),
  uploadProfilePic.single('profilePic'),   // 'profilePic' is the form field name
  uploadProfilePicture
);

router.post(
  '/portfolio',
  verifyToken,
  checkRole('provider'),
  uploadPortfolio.single('image'),
  addPortfolioItem
);

router.delete('/portfolio/:itemId', verifyToken, checkRole('provider'), removePortfolioItem);

module.exports = router;