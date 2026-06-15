const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const ServiceListingSchema = new mongoose.Schema(
  {
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    providerProfile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ProviderProfile',
    },

    title: {
      type: String,
      required: [true, 'Service title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },

    description: {
      type: String,
      required: [true, 'Service description is required'],
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },

    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: [
        'Web Development',
        'Mobile Development',
        'Graphic Design',
        'Logo Design',
        'Content Writing',
        'Copywriting',
        'Social Media Management',
        'Digital Marketing',
        'SEO',
        'Video Editing',
        'Photography',
        'Data Analysis',
        'Other',
      ],
    },

    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },

    // Price in NGN (Nigerian Naira) for local market
    currency: {
      type: String,
      default: 'NGN',
    },

    deliveryTime: {
      type: Number,
      required: [true, 'Delivery time is required'],
      min: [1, 'Delivery time must be at least 1 day'],
    },

    // Cover image for the listing
    coverImage: {
      type: String,
      default: '',
    },

    tags: {
      type: [String],
      default: [],
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    totalOrders: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Add text index for search — this powers ?q= on the browse endpoint
ServiceListingSchema.index({ title: 'text', description: 'text', tags: 'text' });

// Attach pagination plugin
ServiceListingSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('ServiceListing', ServiceListingSchema);