const express = require('express');
const router = express.Router();
const Activity = require('../models/Activity');

// GET /api/activities/recent - List recently viewed ads
router.get('/recent', async (req, res) => {
  try {
    const { type = 'view', page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const filter = { user: req.user.id };
    if (type !== 'all') {
      filter.type = type;
    }

    const activities = await Activity.find(filter)
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

    const total = await Activity.countDocuments(filter);

    // Filter out activities with deleted ads (for view type)
    const validActivities = activities.filter(activity => 
      activity.type !== 'view' || activity.ad
    );

    res.json({
      success: true,
      activities: validActivities,
      pagination: {
        current: Number(page),
        total: Math.ceil(total / limit),
        count: validActivities.length,
        totalCount: total
      }
    });
  } catch (error) {
    console.error('Error fetching activities:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// DELETE /api/activities/clear - Clear all recent activities
router.delete('/clear', async (req, res) => {
  try {
    const { type } = req.query;
    const filter = { user: req.user.id };
    
    if (type) {
      filter.type = type;
    }

    await Activity.deleteMany(filter);

    res.json({ success: true, message: 'Activities cleared successfully' });
  } catch (error) {
    console.error('Error clearing activities:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/activities/search - Track search activity
router.post('/search', async (req, res) => {
  try {
    const { query, filters } = req.body;

    if (!query) {
      return res.status(400).json({ success: false, message: 'Search query is required' });
    }

    const activity = new Activity({
      user: req.user.id,
      type: 'search',
      searchQuery: query,
      metadata: filters
    });

    await activity.save();

    res.status(201).json({ success: true, activity });
  } catch (error) {
    console.error('Error tracking search:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/activities/stats - Get activity statistics
router.get('/stats', async (req, res) => {
  try {
    const userId = req.user.id;

    const stats = await Activity.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          lastActivity: { $max: '$createdAt' }
        }
      }
    ]);

    const result = {
      totalActivities: stats.reduce((sum, stat) => sum + stat.count, 0),
      byType: stats.reduce((acc, stat) => {
        acc[stat._id] = {
          count: stat.count,
          lastActivity: stat.lastActivity
        };
        return acc;
      }, {})
    };

    res.json({ success: true, stats: result });
  } catch (error) {
    console.error('Error fetching activity stats:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
