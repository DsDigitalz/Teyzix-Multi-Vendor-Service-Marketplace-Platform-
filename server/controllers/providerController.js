const ProviderProfile = require('../models/ProviderProfile');
const { cloudinary } = require('../config/cloudinary');

// @route   GET /api/providers/profile
// @access  Private (provider only)
const getMyProfile = async (req, res) => {
  try {
    let profile = await ProviderProfile.findOne({ user: req.user._id })
      .populate('user', 'name email');

    // Auto-create empty profile if it doesn't exist yet
    if (!profile) {
      profile = await ProviderProfile.create({ user: req.user._id });
    }

    res.status(200).json({ success: true, profile });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   PUT /api/providers/profile
// @access  Private (provider only)
const updateProfile = async (req, res) => {
  try {
    const { bio, skills, experience, pricing, isAvailable } = req.body;

    const updateData = {};
    if (bio !== undefined) updateData.bio = bio;
    if (skills !== undefined) updateData.skills = skills;
    if (experience !== undefined) updateData.experience = experience;
    if (pricing !== undefined) updateData.pricing = pricing;
    if (isAvailable !== undefined) updateData.isAvailable = isAvailable;

    const profile = await ProviderProfile.findOneAndUpdate(
      { user: req.user._id },
      updateData,
      { new: true, upsert: true, runValidators: true }
    ).populate('user', 'name email');

    res.status(200).json({ success: true, profile });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   PUT /api/providers/profile/picture
// @access  Private (provider only)
// multer runs before this — req.file is the uploaded image
const uploadProfilePicture = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    // Cloudinary URL is in req.file.path after multer-storage-cloudinary
    const imageUrl = req.file.path;

    // Also update User model's profilePic for quick access
    req.user.profilePic = imageUrl;
    await req.user.save();

    const profile = await ProviderProfile.findOneAndUpdate(
      { user: req.user._id },
      { profilePic: imageUrl },
      { new: true, upsert: true }
    );

    res.status(200).json({ success: true, profilePic: imageUrl, profile });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   POST /api/providers/portfolio
// @access  Private (provider only)
const addPortfolioItem = async (req, res) => {
  try {
    const { title, description, projectUrl } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, message: 'Portfolio item title is required' });
    }

    const newItem = {
      title,
      description: description || '',
      projectUrl: projectUrl || '',
      imageUrl: req.file ? req.file.path : '',
    };

    const profile = await ProviderProfile.findOneAndUpdate(
      { user: req.user._id },
      { $push: { portfolio: newItem } },
      { new: true, upsert: true }
    );

    res.status(201).json({ success: true, portfolio: profile.portfolio });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   DELETE /api/providers/portfolio/:itemId
// @access  Private (provider only)
const removePortfolioItem = async (req, res) => {
  try {
    const profile = await ProviderProfile.findOneAndUpdate(
      { user: req.user._id },
      { $pull: { portfolio: { _id: req.params.itemId } } },
      { new: true }
    );

    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }

    res.status(200).json({ success: true, portfolio: profile.portfolio });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   GET /api/providers/:userId
// @access  Public
const getProviderByUserId = async (req, res) => {
  try {
    const profile = await ProviderProfile.findOne({ user: req.params.userId })
      .populate('user', 'name email profilePic');

    if (!profile) {
      return res.status(404).json({ success: false, message: 'Provider not found' });
    }

    res.status(200).json({ success: true, profile });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getMyProfile,
  updateProfile,
  uploadProfilePicture,
  addPortfolioItem,
  removePortfolioItem,
  getProviderByUserId,
};