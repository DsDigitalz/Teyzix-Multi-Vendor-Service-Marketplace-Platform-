const mongoose = require('mongoose');

// Valid statuses and the exact order they must flow
const STATUS_FLOW = ['Pending', 'Accepted', 'In Progress', 'Completed', 'Delivered'];

const ServiceRequestSchema = new mongoose.Schema(
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

    listing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ServiceListing',
      required: true,
    },

    // What the customer actually needs
    requirements: {
      type: String,
      required: [true, 'Please describe your requirements'],
      trim: true,
      minlength: [20, 'Requirements must be at least 20 characters'],
      maxlength: [2000, 'Requirements cannot exceed 2000 characters'],
    },

    budget: {
      type: Number,
      required: [true, 'Please provide your budget'],
      min: [0, 'Budget cannot be negative'],
    },

    currency: {
      type: String,
      default: 'NGN',
    },

    deadline: {
      type: Date,
      required: [true, 'Please provide a deadline'],
      validate: {
        validator: function (value) {
          return value > new Date();   // deadline must be in the future
        },
        message: 'Deadline must be a future date',
      },
    },

    status: {
      type: String,
      enum: STATUS_FLOW,
      default: 'Pending',
    },

    // Track when each status change happened — useful for dashboard timeline
    statusHistory: [
      {
        status: { type: String, enum: STATUS_FLOW },
        changedAt: { type: Date, default: Date.now },
        note: { type: String, default: '' },   // optional message with each update
      },
    ],

    // Provider can attach a delivery note when marking Delivered
    deliveryNote: {
      type: String,
      default: '',
    },

    // Soft cancel — either side can cancel with a reason
    isCancelled: {
      type: Boolean,
      default: false,
    },

    cancelReason: {
      type: String,
      default: '',
    },

    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    // Set to true once customer leaves a review
    isReviewed: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Attach the valid status order so controllers can import it
ServiceRequestSchema.statics.STATUS_FLOW = STATUS_FLOW;

module.exports = mongoose.model('ServiceRequest', ServiceRequestSchema);