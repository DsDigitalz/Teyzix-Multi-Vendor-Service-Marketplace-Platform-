const Review = require('../models/Review');
const ServiceRequest = require('../models/ServiceRequest');

// @route   POST /api/reviews
// @access  Private (customer only)
const submitReview = async (req, res) => {
  try {
    const { requestId, rating, feedback } = req.body;

    const request = await ServiceRequest.findById(requestId);

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    // Only the customer on this request can review
    if (request.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only the customer can leave a review' });
    }

    // Can only review after delivery
    if (request.status !== 'Delivered') {
      return res.status(400).json({ success: false, message: 'You can only review after the project is delivered' });
    }

    // Prevent duplicate reviews
    if (request.isReviewed) {
      return res.status(400).json({ success: false, message: 'You have already reviewed this project' });
    }

    const review = await Review.create({
      customer: req.user._id,
      provider: request.provider,
      serviceRequest: requestId,
      listing: request.listing,
      rating,
      feedback: feedback || '',
    });

    // Mark the request as reviewed
    request.isReviewed = true;
    await request.save();

    // Note: averageRating on ProviderProfile updates automatically
    // via the post('save') hook on the Review model

    await review.populate([
      { path: 'customer', select: 'name profilePic' },
      { path: 'provider', select: 'name' },
    ]);

    res.status(201).json({ success: true, review });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'You have already reviewed this project' });
    }
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   GET /api/reviews/provider/:providerId
// @access  Public
const getProviderReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ provider: req.params.providerId })
      .populate('customer', 'name profilePic')
      .populate('listing', 'title')
      .sort('-createdAt');

    res.status(200).json({ success: true, count: reviews.length, reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { submitReview, getProviderReviews };