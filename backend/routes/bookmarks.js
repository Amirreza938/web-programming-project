const express = require('express');
const router = express.Router();
const Bookmark = require('../models/Bookmark');
const Ad = require('../models/Ad');

// GET /api/bookmarks - List bookmarked ads
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const bookmarks = await Bookmark.find({ user: req.user.id })
      .populate({
        path: 'ad',
        populate: {
          path: 'owner',
          select: 'firstName lastName avatar city'
        }
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Bookmark.countDocuments({ user: req.user.id });

    // Filter out bookmarks with deleted ads
    const validBookmarks = bookmarks.filter(bookmark => bookmark.ad);

    res.json({
      success: true,
      bookmarks: validBookmarks,
      pagination: {
        current: Number(page),
        total: Math.ceil(total / limit),
        count: validBookmarks.length,
        totalCount: total
      }
    });
  } catch (error) {
    console.error('Error fetching bookmarks:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/bookmarks - Add a new bookmark
router.post('/', async (req, res) => {
  try {
    const { adId } = req.body;

    if (!adId) {
      return res.status(400).json({ success: false, message: 'Ad ID is required' });
    }

    // Check if ad exists
    const ad = await Ad.findById(adId);
    if (!ad) {
      return res.status(404).json({ success: false, message: 'Ad not found' });
    }

    // Check if already bookmarked
    const existingBookmark = await Bookmark.findOne({
      user: req.user.id,
      ad: adId
    });

    if (existingBookmark) {
      return res.status(400).json({ success: false, message: 'Ad already bookmarked' });
    }

    const bookmark = new Bookmark({
      user: req.user.id,
      ad: adId
    });

    await bookmark.save();
    await bookmark.populate({
      path: 'ad',
      populate: {
        path: 'owner',
        select: 'firstName lastName avatar city'
      }
    });

    res.status(201).json({ success: true, bookmark });
  } catch (error) {
    console.error('Error creating bookmark:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// DELETE /api/bookmarks/:adId - Remove a bookmark
router.delete('/:adId', async (req, res) => {
  try {
    const bookmark = await Bookmark.findOneAndDelete({
      user: req.user.id,
      ad: req.params.adId
    });

    if (!bookmark) {
      return res.status(404).json({ success: false, message: 'Bookmark not found' });
    }

    res.json({ success: true, message: 'Bookmark removed successfully' });
  } catch (error) {
    console.error('Error removing bookmark:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/bookmarks/check/:adId - Check if ad is bookmarked
router.get('/check/:adId', async (req, res) => {
  try {
    const bookmark = await Bookmark.findOne({
      user: req.user.id,
      ad: req.params.adId
    });

    res.json({ success: true, isBookmarked: !!bookmark });
  } catch (error) {
    console.error('Error checking bookmark:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
