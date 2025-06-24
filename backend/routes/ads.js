const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Ad = require('../models/Ad');
const Activity = require('../models/Activity');

// GET /api/ads - List all ads with filters
router.get('/', async (req, res) => {
  try {
    const {
      category,
      subcategory,
      city,
      minPrice,
      maxPrice,
      search,
      sort = 'createdAt',
      order = 'desc',
      page = 1,
      limit = 20
    } = req.query;

    const filter = { status: 'active' };

    if (category) filter.category = category;
    if (subcategory) filter.subcategory = subcategory;
    if (city) filter.city = city;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const sortOrder = order === 'desc' ? -1 : 1;
    const skip = (page - 1) * limit;

    const [ads, total] = await Promise.all([
      Ad.find(filter)
        .populate('owner', 'firstName lastName avatar city')
        .sort({ [sort]: sortOrder })
        .skip(skip)
        .limit(Number(limit)),
      Ad.countDocuments(filter)
    ]);

    res.json({
      success: true,
      ads,
      pagination: {
        current: Number(page),
        total: Math.ceil(total / limit),
        count: ads.length,
        totalCount: total
      }
    });
  } catch (error) {
    console.error('Error fetching ads:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/ads - Create a new ad
router.post('/', [
  body('title').trim().isLength({ min: 1, max: 100 }).withMessage('Title is required and must be under 100 characters'),
  body('description').trim().isLength({ min: 1, max: 2000 }).withMessage('Description is required and must be under 2000 characters'),
  body('price').isNumeric().withMessage('Price must be a number'),
  body('category').notEmpty().withMessage('Category is required'),
  body('subcategory').notEmpty().withMessage('Subcategory is required'),
  body('city').notEmpty().withMessage('City is required'),
  body('district').notEmpty().withMessage('District is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const adData = {
      ...req.body,
      owner: req.user.id
    };

    const ad = new Ad(adData);
    await ad.save();
    await ad.populate('owner', 'firstName lastName avatar city');

    res.status(201).json({ success: true, ad });
  } catch (error) {
    console.error('Error creating ad:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/ads/my - List user's ads
router.get('/my', async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = { owner: req.user.id };

    if (status && status !== 'all') {
      filter.status = status;
    }

    const skip = (page - 1) * limit;

    const [ads, total] = await Promise.all([
      Ad.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Ad.countDocuments(filter)
    ]);

    res.json({
      success: true,
      ads,
      pagination: {
        current: Number(page),
        total: Math.ceil(total / limit),
        count: ads.length,
        totalCount: total
      }
    });
  } catch (error) {
    console.error('Error fetching user ads:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/ads/:id - Get ad details
router.get('/:id', async (req, res) => {
  try {
    const ad = await Ad.findById(req.params.id)
      .populate('owner', 'firstName lastName avatar city isIdentityVerified');

    if (!ad) {
      return res.status(404).json({ success: false, message: 'Ad not found' });
    }

    // Track view if user is authenticated
    if (req.user && req.user.id !== ad.owner._id.toString()) {
      // Create activity record
      const activity = new Activity({
        user: req.user.id,
        type: 'view',
        ad: ad._id
      });
      await activity.save();

      // Update ad view count
      ad.views = (ad.views || 0) + 1;
      await ad.save();
    }

    res.json({ success: true, ad });
  } catch (error) {
    console.error('Error fetching ad:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PUT /api/ads/:id - Update ad
router.put('/:id', async (req, res) => {
  try {
    const ad = await Ad.findOne({ _id: req.params.id, owner: req.user.id });

    if (!ad) {
      return res.status(404).json({ success: false, message: 'Ad not found or not owned by user' });
    }

    Object.assign(ad, req.body);
    await ad.save();
    await ad.populate('owner', 'firstName lastName avatar city');

    res.json({ success: true, ad });
  } catch (error) {
    console.error('Error updating ad:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// DELETE /api/ads/:id - Delete ad
router.delete('/:id', async (req, res) => {
  try {
    const ad = await Ad.findOneAndDelete({ _id: req.params.id, owner: req.user.id });

    if (!ad) {
      return res.status(404).json({ success: false, message: 'Ad not found or not owned by user' });
    }

    res.json({ success: true, message: 'Ad deleted successfully' });
  } catch (error) {
    console.error('Error deleting ad:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/ads/:id/publish - Publish incomplete ad
router.post('/:id/publish', async (req, res) => {
  try {
    const ad = await Ad.findOne({ _id: req.params.id, owner: req.user.id });

    if (!ad) {
      return res.status(404).json({ success: false, message: 'Ad not found or not owned by user' });
    }

    ad.status = 'active';
    ad.publishedAt = new Date();
    await ad.save();

    res.json({ success: true, ad, message: 'Ad published successfully' });
  } catch (error) {
    console.error('Error publishing ad:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/ads/:id/deactivate - Deactivate ad
router.post('/:id/deactivate', async (req, res) => {
  try {
    const ad = await Ad.findOne({ _id: req.params.id, owner: req.user.id });

    if (!ad) {
      return res.status(404).json({ success: false, message: 'Ad not found or not owned by user' });
    }

    ad.status = 'inactive';
    await ad.save();

    res.json({ success: true, ad, message: 'Ad deactivated successfully' });
  } catch (error) {
    console.error('Error deactivating ad:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
