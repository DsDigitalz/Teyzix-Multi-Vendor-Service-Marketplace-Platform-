const User = require('../models/User');
const ServiceListing = require('../models/ServiceListing');
const ServiceRequest = require('../models/ServiceRequest');
const Review = require('../models/Review');

// @route   GET /api/admin/stats
// @access  Private (admin only)
const getDashboardStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalCustomers,
      totalProviders,
      totalListings,
      totalRequests,
      requestsByStatus,
      totalReviews,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'customer' }),
      User.countDocuments({ role: 'provider' }),
      ServiceListing.countDocuments({ isActive: true }),
      ServiceRequest.countDocuments(),
      ServiceRequest.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      Review.countDocuments(),
    ]);

    res.status(200).json({
      success: true,
      stats: {
        users: { total: totalUsers, customers: totalCustomers, providers: totalProviders },
        listings: { total: totalListings },
        requests: {
          total: totalRequests,
          byStatus: requestsByStatus.reduce((acc, s) => {
            acc[s._id] = s.count;
            return acc;
          }, {}),
        },
        reviews: { total: totalReviews },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   GET /api/admin/users
// @access  Private (admin only)
const getAllUsers = async (req, res) => {
  try {
    const { role, page = 1, limit = 20 } = req.query;
    const filter = role ? { role } : {};

    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      User.find(filter).select('-password').sort('-createdAt').skip(skip).limit(parseInt(limit)),
      User.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      users,
      pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getDashboardStats, getAllUsers };