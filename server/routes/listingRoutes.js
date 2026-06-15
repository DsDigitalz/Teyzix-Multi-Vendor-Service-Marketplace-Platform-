const express = require('express');
const router = express.Router();
const {
  getAllListings,
  getListingById,
  createListing,
  updateListing,
  deleteListing,
  getMyListings,
} = require('../controllers/listingController');
const { verifyToken, checkRole } = require('../middleware/auth');
const { uploadPortfolio } = require('../config/cloudinary');

// Public routes
router.get('/', getAllListings);                   // GET /api/services?q=&category=
router.get('/:id', getListingById);               // GET /api/services/:id

// Private — provider only
router.get('/provider/my-listings', verifyToken, checkRole('provider'), getMyListings);

router.post(
  '/',
  verifyToken,
  checkRole('provider'),
  uploadPortfolio.single('coverImage'),           // optional cover image
  createListing
);

router.put(
  '/:id',
  verifyToken,
  checkRole('provider'),
  uploadPortfolio.single('coverImage'),
  updateListing
);

router.delete('/:id', verifyToken, checkRole('provider'), deleteListing);

module.exports = router;