const express = require('express');
const router = express.Router();
const User = require('../models/User');

// POST /api/professional/upgrade - Request professional upgrade
router.post('/upgrade', async (req, res) => {
  try {
    const { businessName, businessType, features } = req.body;

    if (!businessName || !businessType) {
      return res.status(400).json({ 
        success: false, 
        message: 'Business name and type are required' 
      });
    }

    const user = await User.findById(req.user.id);
    
    if (user.isProfessional) {
      return res.status(400).json({ 
        success: false, 
        message: 'User is already a professional account' 
      });
    }

    user.isProfessional = true;
    user.professionalInfo = {
      businessName,
      businessType,
      upgradedAt: new Date(),
      features: features || ['premium_listing', 'analytics', 'priority_support']
    };

    await user.save();

    res.json({ 
      success: true, 
      message: 'Professional upgrade successful',
      professionalInfo: user.professionalInfo
    });
  } catch (error) {
    console.error('Error upgrading to professional:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/professional/status - Check professional account status
router.get('/status', async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    res.json({
      success: true,
      isProfessional: user.isProfessional,
      professionalInfo: user.professionalInfo || null
    });
  } catch (error) {
    console.error('Error checking professional status:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/professional/analytics - Get professional analytics
router.get('/analytics', async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user.isProfessional) {
      return res.status(403).json({ 
        success: false, 
        message: 'Professional account required' 
      });
    }

    // This would typically fetch from analytics service
    // For now, return mock data
    const analytics = {
      totalViews: 0,
      totalContacts: 0,
      activeAds: 0,
      conversionRate: 0,
      popularCategories: [],
      monthlyStats: []
    };

    res.json({ success: true, analytics });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PUT /api/professional/settings - Update professional settings
router.put('/settings', async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user.isProfessional) {
      return res.status(403).json({ 
        success: false, 
        message: 'Professional account required' 
      });
    }

    const { businessName, businessType, features } = req.body;

    if (businessName) user.professionalInfo.businessName = businessName;
    if (businessType) user.professionalInfo.businessType = businessType;
    if (features) user.professionalInfo.features = features;

    await user.save();

    res.json({ 
      success: true, 
      message: 'Professional settings updated',
      professionalInfo: user.professionalInfo
    });
  } catch (error) {
    console.error('Error updating professional settings:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
