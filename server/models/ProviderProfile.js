const mongoose = require('mongoose');

// Sub-schema: each portfolio item
const PortfolioItemSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  imageUrl: { type: String, default: '' },
  projectUrl: { type: String, default: '' },
}, { _id: true });

// Sub-schema: each experience entry
const ExperienceSchema = new mongoose.Schema({
  company: { type: String, required: true, trim: true },
  role: { type: String, required: true, trim: true },
  startYear: { type: Number },
  endYear: { type: Number },       // null means "current"
  description: { type: String, trim: true },
}, { _id: true });

// Sub-schema: pricing tiers
const PricingSchema = new mongoose.Schema({
  tier: {
    type: String,
    enum: ['basic', 'standard', 'premium'],
    required: true,
  },
  label: { type: String, trim: true },          // e.g. "Starter Package"
  price: { type: Number, required: true, min: 0 },
  deliveryDays: { type: Number, required: true, min: 1 },
  description: { type: String, trim: true },
}, { _id: true });

const ProviderProfileSchema = new mongoose.Schema(
  {
    // One-to-one with User
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },

    bio: {
      type: String,
      trim: true,
      maxlength: [500, 'Bio cannot exceed 500 characters'],
      default: '',
    },

    profilePic: {
      type: String,
      default: '',
    },

    skills: {
      type: [String],
      default: [],
      // e.g. ['React', 'Node.js', 'Figma', 'Tailwind CSS']
    },

    experience: {
      type: [ExperienceSchema],
      default: [],
    },

    pricing: {
      type: [PricingSchema],
      default: [],
    },

    portfolio: {
      type: [PortfolioItemSchema],
      default: [],
    },

    // Computed from reviews — updated whenever a review is added
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },

    totalReviews: {
      type: Number,
      default: 0,
    },

    // Earnings overview for provider dashboard
    totalEarnings: {
      type: Number,
      default: 0,
    },

    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ProviderProfile', ProviderProfileSchema);