const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Activity = require('../models/Activity');
const Bookmark = require('../models/Bookmark');
const Note = require('../models/Note');

// GET /api/settings/account - Get account security settings
router.get('/account', async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('activeSessions isPhoneVerified isIdentityVerified');
    
    res.json({
      success: true,
      data: {
        activeSessions: user.activeSessions,
        isPhoneVerified: user.isPhoneVerified,
        isIdentityVerified: user.isIdentityVerified,
        twoFactorEnabled: false // TODO: Implement 2FA
      }
    });
  } catch (error) {
    console.error('Error fetching account settings:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PUT /api/settings/account - Update account security settings
router.put('/account', async (req, res) => {
  try {
    const { currentPassword, newPassword, enableTwoFactor } = req.body;
    const user = await User.findById(req.user.id);

    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({
          success: false,
          message: 'Current password is required'
        });
      }

      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        return res.status(400).json({
          success: false,
          message: 'Current password is incorrect'
        });
      }

      user.password = newPassword;
      await user.save();
    }

    // TODO: Implement 2FA logic here

    res.json({
      success: true,
      message: 'Account settings updated successfully'
    });
  } catch (error) {
    console.error('Error updating account settings:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/settings/notifications - Get notification preferences
router.get('/notifications', async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('settings.notifications');
    
    res.json({
      success: true,
      data: user.settings.notifications
    });
  } catch (error) {
    console.error('Error fetching notification settings:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PUT /api/settings/notifications - Update notification preferences
router.put('/notifications', async (req, res) => {
  try {
    const { push, sms, email, sound, vibration } = req.body;
    const user = await User.findById(req.user.id);

    if (push !== undefined) user.settings.notifications.push = push;
    if (sms !== undefined) user.settings.notifications.sms = sms;
    if (email !== undefined) user.settings.notifications.email = email;
    if (sound !== undefined) user.settings.notifications.sound = sound;
    if (vibration !== undefined) user.settings.notifications.vibration = vibration;

    await user.save();

    res.json({
      success: true,
      message: 'Notification settings updated successfully',
      data: user.settings.notifications
    });
  } catch (error) {
    console.error('Error updating notification settings:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/settings/privacy - Get privacy settings
router.get('/privacy', async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('settings.privacy blockedUsers');
    
    res.json({
      success: true,
      data: {
        privacy: user.settings.privacy,
        blockedUsersCount: user.blockedUsers.length
      }
    });
  } catch (error) {
    console.error('Error fetching privacy settings:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PUT /api/settings/privacy - Update privacy settings
router.put('/privacy', async (req, res) => {
  try {
    const { showPhone, showOnlineStatus } = req.body;
    const user = await User.findById(req.user.id);

    if (showPhone !== undefined) user.settings.privacy.showPhone = showPhone;
    if (showOnlineStatus !== undefined) user.settings.privacy.showOnlineStatus = showOnlineStatus;

    await user.save();

    res.json({
      success: true,
      message: 'Privacy settings updated successfully',
      data: user.settings.privacy
    });
  } catch (error) {
    console.error('Error updating privacy settings:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/settings/theme - Get theme settings
router.get('/theme', async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('settings.theme');
    
    res.json({
      success: true,
      data: { theme: user.settings.theme }
    });
  } catch (error) {
    console.error('Error fetching theme settings:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PUT /api/settings/theme - Update theme settings
router.put('/theme', async (req, res) => {
  try {
    const { theme } = req.body;
    
    if (!['light', 'dark'].includes(theme)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid theme value'
      });
    }

    const user = await User.findById(req.user.id);
    user.settings.theme = theme;
    await user.save();

    res.json({
      success: true,
      message: 'Theme updated successfully',
      data: { theme }
    });
  } catch (error) {
    console.error('Error updating theme:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/settings/city - Get city settings
router.get('/city', async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('city');
    
    res.json({
      success: true,
      data: { city: user.city }
    });
  } catch (error) {
    console.error('Error fetching city settings:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PUT /api/settings/city - Update city settings
router.put('/city', async (req, res) => {
  try {
    const { city } = req.body;
    
    if (!city) {
      return res.status(400).json({
        success: false,
        message: 'City is required'
      });
    }

    const user = await User.findById(req.user.id);
    user.city = city;
    await user.save();

    res.json({
      success: true,
      message: 'City updated successfully',
      data: { city }
    });
  } catch (error) {
    console.error('Error updating city:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/settings/history/clear - Clear various types of history
router.post('/history/clear', async (req, res) => {
  try {
    const { type } = req.body; // 'visits', 'notes', 'bookmarks', 'search'
    const userId = req.user.id;

    switch (type) {
      case 'visits':
        await Activity.deleteMany({ user: userId });
        break;
      case 'notes':
        await Note.deleteMany({ user: userId });
        break;
      case 'bookmarks':
        await Bookmark.deleteMany({ user: userId });
        break;
      case 'search':
        // TODO: Implement search history clearing
        break;
      case 'all':
        await Promise.all([
          Activity.deleteMany({ user: userId }),
          Note.deleteMany({ user: userId }),
          Bookmark.deleteMany({ user: userId })
        ]);
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid history type'
        });
    }

    res.json({
      success: true,
      message: `${type === 'all' ? 'All history' : type} cleared successfully`
    });
  } catch (error) {
    console.error('Error clearing history:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/settings/chat - Get chat settings
router.get('/chat', async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('chatSettings chatDisplayName');
    
    res.json({
      success: true,
      data: {
        displayName: user.chatDisplayName,
        settings: user.chatSettings
      }
    });
  } catch (error) {
    console.error('Error fetching chat settings:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PUT /api/settings/chat - Update chat settings
router.put('/chat', async (req, res) => {
  try {
    const {
      displayName,
      showAnonymousCalls,
      showInactiveChats,
      showDisabledChats,
      autoFilterSuspicious,
      availabilityHours
    } = req.body;

    const user = await User.findById(req.user.id);

    if (displayName !== undefined) user.chatDisplayName = displayName;
    if (showAnonymousCalls !== undefined) user.chatSettings.showAnonymousCalls = showAnonymousCalls;
    if (showInactiveChats !== undefined) user.chatSettings.showInactiveChats = showInactiveChats;
    if (showDisabledChats !== undefined) user.chatSettings.showDisabledChats = showDisabledChats;
    if (autoFilterSuspicious !== undefined) user.chatSettings.autoFilterSuspicious = autoFilterSuspicious;
    if (availabilityHours) {
      if (availabilityHours.start) user.chatSettings.availabilityHours.start = availabilityHours.start;
      if (availabilityHours.end) user.chatSettings.availabilityHours.end = availabilityHours.end;
    }

    await user.save();

    res.json({
      success: true,
      message: 'Chat settings updated successfully',
      data: {
        displayName: user.chatDisplayName,
        settings: user.chatSettings
      }
    });
  } catch (error) {
    console.error('Error updating chat settings:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
