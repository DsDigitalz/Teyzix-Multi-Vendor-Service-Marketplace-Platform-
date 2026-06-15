const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // Which request this review belongs to — one review per request
    serviceRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ServiceRequest',
      required: true,
      unique: true,   // prevents duplicate reviews on the same request
    },

    listing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ServiceListing',
    },

    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
    },

    feedback: {
      type: String,
      trim: true,
      maxlength: [1000, 'Feedback cannot exceed 1000 characters'],
      default: '',
    },
  },
  { timestamps: true }
);

// After saving a review, recompute the provider's averageRating
ReviewSchema.post('save', async function () {
  const ProviderProfile = require('./ProviderProfile');

  // Aggregate all reviews for this provider
  const stats = await this.constructor.aggregate([
    { $match: { provider: this.provider } },
    {
      $group: {
        _id: '$provider',
        avgRating: { $avg: '$rating' },
        count: { $sum: 1 },
      },
    },
  ]);

  if (stats.length > 0) {
    await ProviderProfile.findOneAndUpdate(
      { user: this.provider },
      {
        averageRating: Math.round(stats[0].avgRating * 10) / 10,  // round to 1 decimal
        totalReviews: stats[0].count,
      }
    );
  }
});

module.exports = mongoose.model('Review', ReviewSchema);