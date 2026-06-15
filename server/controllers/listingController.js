const ServiceListing = require('../models/ServiceListing');
const ProviderProfile = require('../models/ProviderProfile');

// @route   GET /api/services
// @access  Public
// Supports: ?q=keyword  ?category=Web Development  ?page=1  ?limit=10
const getAllListings = async (req, res) => {
  try {
    const { q, category, page = 1, limit = 10, sort = '-createdAt' } = req.query;

    // Build the filter object
    const filter = { isActive: true };

    // Category filter — exact match from enum
    if (category) {
      filter.category = category;
    }

    // Full-text search using the text index we set on the model
    if (q) {
      filter.$text = { $search: q };
    }

    // Pagination options for mongoose-paginate-v2
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort,
      populate: [
        { path: 'provider', select: 'name profilePic' },
        { path: 'providerProfile', select: 'averageRating totalReviews isAvailable' },
      ],
    };

    const result = await ServiceListing.paginate(filter, options);

    res.status(200).json({
      success: true,
      listings: result.docs,
      pagination: {
        total: result.totalDocs,
        page: result.page,
        pages: result.totalPages,
        hasNextPage: result.hasNextPage,
        hasPrevPage: result.hasPrevPage,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   GET /api/services/:id
// @access  Public
const getListingById = async (req, res) => {
  try {
    const listing = await ServiceListing.findById(req.params.id)
      .populate('provider', 'name email profilePic')
      .populate('providerProfile', 'bio skills averageRating totalReviews portfolio');

    if (!listing || !listing.isActive) {
      return res.status(404).json({ success: false, message: 'Listing not found' });
    }

    res.status(200).json({ success: true, listing });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   POST /api/services
// @access  Private (provider only)
const createListing = async (req, res) => {
  try {
    const { title, description, category, price, deliveryTime, tags } = req.body;

    // Attach provider profile reference
    const providerProfile = await ProviderProfile.findOne({ user: req.user._id });

    const listing = await ServiceListing.create({
      provider: req.user._id,
      providerProfile: providerProfile?._id,
      title,
      description,
      category,
      price,
      deliveryTime,
      tags: tags || [],
      coverImage: req.file ? req.file.path : '',
    });

    res.status(201).json({ success: true, listing });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   PUT /api/services/:id
// @access  Private (provider — must own the listing)
const updateListing = async (req, res) => {
  try {
    const listing = await ServiceListing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found' });
    }

    // Ownership check — only the provider who created it can edit
    if (listing.provider.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to edit this listing' });
    }

    const fields = ['title', 'description', 'category', 'price', 'deliveryTime', 'tags', 'isActive'];
    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        listing[field] = req.body[field];
      }
    });

    if (req.file) {
      listing.coverImage = req.file.path;
    }

    await listing.save();

    res.status(200).json({ success: true, listing });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   DELETE /api/services/:id
// @access  Private (provider — must own the listing)
const deleteListing = async (req, res) => {
  try {
    const listing = await ServiceListing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found' });
    }

    if (listing.provider.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this listing' });
    }

    // Soft delete — keeps data, just hides from browse
    listing.isActive = false;
    await listing.save();

    res.status(200).json({ success: true, message: 'Listing deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   GET /api/services/my-listings
// @access  Private (provider only)
const getMyListings = async (req, res) => {
  try {
    const listings = await ServiceListing.find({ provider: req.user._id })
      .sort('-createdAt');

    res.status(200).json({ success: true, count: listings.length, listings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAllListings,
  getListingById,
  createListing,
  updateListing,
  deleteListing,
  getMyListings,
};