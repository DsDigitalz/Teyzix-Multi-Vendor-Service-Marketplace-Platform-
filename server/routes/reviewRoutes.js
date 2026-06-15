const express = require('express');
const router = express.Router();
const { submitReview, getProviderReviews } = require('../controllers/reviewController');
const { verifyToken, checkRole } = require('../middleware/auth');

router.post('/', verifyToken, checkRole('customer'), submitReview);
router.get('/provider/:providerId', getProviderReviews);

module.exports = router;