const ServiceRequest = require('../models/ServiceRequest');
const ServiceListing = require('../models/ServiceListing');
const ProviderProfile = require('../models/ProviderProfile');

const STATUS_FLOW = ServiceRequest.STATUS_FLOW;

// @route   POST /api/requests
// @access  Private (customer only)
const submitRequest = async (req, res) => {
  try {
    const { listingId, requirements, budget, deadline } = req.body;

    // Verify the listing exists and is active
    const listing = await ServiceListing.findById(listingId);
    if (!listing || !listing.isActive) {
      return res.status(404).json({ success: false, message: 'Service listing not found' });
    }

    // Customer cannot request their own listing
    if (listing.provider.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot request your own service' });
    }

    const request = await ServiceRequest.create({
      customer: req.user._id,
      provider: listing.provider,
      listing: listingId,
      requirements,
      budget,
      deadline,
      // Seed the status history with the initial Pending entry
      statusHistory: [{ status: 'Pending', changedAt: new Date() }],
    });

    // Populate for the response
    await request.populate([
      { path: 'customer', select: 'name email' },
      { path: 'provider', select: 'name email' },
      { path: 'listing', select: 'title category price' },
    ]);

    res.status(201).json({ success: true, request });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   PATCH /api/requests/:id/status
// @access  Private (provider only)
const updateStatus = async (req, res) => {
  try {
    const { status, note, deliveryNote } = req.body;

    const request = await ServiceRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    // Only the assigned provider can update status
    if (request.provider.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this request' });
    }

    if (request.isCancelled) {
      return res.status(400).json({ success: false, message: 'Cannot update a cancelled request' });
    }

    // Enforce strict status flow — no skipping steps, no going backwards
    const currentIndex = STATUS_FLOW.indexOf(request.status);
    const nextIndex = STATUS_FLOW.indexOf(status);

    if (nextIndex === -1) {
      return res.status(400).json({ success: false, message: `Invalid status. Must be one of: ${STATUS_FLOW.join(', ')}` });
    }

    if (nextIndex !== currentIndex + 1) {
      return res.status(400).json({
        success: false,
        message: `Cannot move from "${request.status}" to "${status}". Next valid status is "${STATUS_FLOW[currentIndex + 1]}"`,
      });
    }

    // Apply the update
    request.status = status;
    request.statusHistory.push({ status, changedAt: new Date(), note: note || '' });

    if (status === 'Delivered' && deliveryNote) {
      request.deliveryNote = deliveryNote;
    }

    // When delivered, update provider's earnings and listing order count
    if (status === 'Delivered') {
      await ProviderProfile.findOneAndUpdate(
        { user: req.user._id },
        { $inc: { totalEarnings: request.budget } }
      );
      await ServiceListing.findByIdAndUpdate(request.listing, { $inc: { totalOrders: 1 } });
    }

    await request.save();

    await request.populate([
      { path: 'customer', select: 'name email' },
      { path: 'provider', select: 'name email' },
      { path: 'listing', select: 'title category price' },
    ]);

    res.status(200).json({ success: true, request });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   PATCH /api/requests/:id/cancel
// @access  Private (customer or provider)
const cancelRequest = async (req, res) => {
  try {
    const { reason } = req.body;
    const request = await ServiceRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    const isCustomer = request.customer.toString() === req.user._id.toString();
    const isProvider = request.provider.toString() === req.user._id.toString();

    if (!isCustomer && !isProvider) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Cannot cancel once delivered
    if (request.status === 'Delivered' || request.status === 'Completed') {
      return res.status(400).json({ success: false, message: 'Cannot cancel a completed or delivered request' });
    }

    request.isCancelled = true;
    request.cancelReason = reason || '';
    request.cancelledBy = req.user._id;

    await request.save();

    res.status(200).json({ success: true, message: 'Request cancelled', request });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   GET /api/requests
// @access  Private — customer sees their own, provider sees theirs
const getMyRequests = async (req, res) => {
  try {
    const { status, role } = req.query;

    // Build filter based on who's asking
    const filter = {};

    if (req.user.role === 'customer') {
      filter.customer = req.user._id;
    } else if (req.user.role === 'provider') {
      filter.provider = req.user._id;
    }

    if (status) filter.status = status;

    const requests = await ServiceRequest.find(filter)
      .populate('customer', 'name email profilePic')
      .populate('provider', 'name email profilePic')
      .populate('listing', 'title category price coverImage')
      .sort('-createdAt');

    res.status(200).json({ success: true, count: requests.length, requests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   GET /api/requests/:id
// @access  Private — only customer or provider on that request
const getRequestById = async (req, res) => {
  try {
    const request = await ServiceRequest.findById(req.params.id)
      .populate('customer', 'name email profilePic')
      .populate('provider', 'name email profilePic')
      .populate('listing', 'title category price coverImage deliveryTime');

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    const isCustomer = request.customer._id.toString() === req.user._id.toString();
    const isProvider = request.provider._id.toString() === req.user._id.toString();

    if (!isCustomer && !isProvider && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to view this request' });
    }

    res.status(200).json({ success: true, request });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { submitRequest, updateStatus, cancelRequest, getMyRequests, getRequestById };