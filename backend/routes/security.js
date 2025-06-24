const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Report = require('../models/Report');

// POST /api/security/report - Report scam or abuse
router.post('/report', [
  body('type').isIn(['scam', 'spam', 'inappropriate', 'fake', 'harassment', 'other']).withMessage('Invalid report type'),
  body('description').optional().isLength({ max: 1000 }).withMessage('Description must be under 1000 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { type, description, reportedUserId, reportedAdId, reportedChatId, evidence } = req.body;

    const report = new Report({
      reporter: req.user.id,
      type,
      description,
      reportedUser: reportedUserId,
      reportedAd: reportedAdId,
      reportedChat: reportedChatId,
      evidence: evidence || {}
    });

    await report.save();

    res.status(201).json({ 
      success: true, 
      message: 'Report submitted successfully',
      reportId: report._id
    });
  } catch (error) {
    console.error('Error creating report:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/security/block-user - Block another user
router.post('/block-user', [
  body('userId').notEmpty().withMessage('User ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { userId } = req.body;

    if (userId === req.user.id) {
      return res.status(400).json({ success: false, message: 'Cannot block yourself' });
    }

    const user = await User.findById(req.user.id);
    
    if (user.blockedUsers.includes(userId)) {
      return res.status(400).json({ success: false, message: 'User already blocked' });
    }

    user.blockedUsers.push(userId);
    await user.save();

    res.json({ success: true, message: 'User blocked successfully' });
  } catch (error) {
    console.error('Error blocking user:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// DELETE /api/security/unblock-user/:userId - Unblock a user
router.delete('/unblock-user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(req.user.id);
    
    const index = user.blockedUsers.indexOf(userId);
    if (index === -1) {
      return res.status(400).json({ success: false, message: 'User not blocked' });
    }

    user.blockedUsers.splice(index, 1);
    await user.save();

    res.json({ success: true, message: 'User unblocked successfully' });
  } catch (error) {
    console.error('Error unblocking user:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/security/blocked-users - List blocked users
router.get('/blocked-users', async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('blockedUsers', 'firstName lastName avatar city');

    res.json({ 
      success: true, 
      blockedUsers: user.blockedUsers || []
    });
  } catch (error) {
    console.error('Error fetching blocked users:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/security/reports - Get user's reports
router.get('/reports', async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const reports = await Report.find({ reporter: req.user.id })
      .populate('reportedUser', 'firstName lastName avatar')
      .populate('reportedAd', 'title')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Report.countDocuments({ reporter: req.user.id });

    res.json({
      success: true,
      reports,
      pagination: {
        current: Number(page),
        total: Math.ceil(total / limit),
        count: reports.length,
        totalCount: total
      }
    });
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/security/safety-tips - Get safety tips
router.get('/safety-tips', (req, res) => {
  const tips = [
    {
      category: 'General Safety',
      tips: [
        'Meet in public places for transactions',
        'Inspect items carefully before purchasing',
        'Use secure payment methods',
        'Trust your instincts if something feels wrong'
      ]
    },
    {
      category: 'Avoiding Scams',
      tips: [
        'Be wary of prices that seem too good to be true',
        'Never send money before seeing the item',
        'Verify seller identity when possible',
        'Report suspicious activities immediately'
      ]
    },
    {
      category: 'Communication',
      tips: [
        'Keep conversations within the platform',
        'Don\'t share personal information unnecessarily',
        'Be respectful in all interactions',
        'Document important communications'
      ]
    }
  ];

  res.json({ success: true, tips });
});

module.exports = router;
