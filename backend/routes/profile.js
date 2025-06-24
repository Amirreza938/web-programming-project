const express = require('express');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;

const router = express.Router();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Helper function to upload to Cloudinary
const uploadToCloudinary = (buffer, originalName) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        resource_type: 'image',
        folder: 'dejanew/profiles',
        public_id: `profile_${Date.now()}`,
        transformation: [
          { width: 400, height: 400, crop: 'fill', quality: 'auto' }
        ]
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result.secure_url);
      }
    ).end(buffer);
  });
};

// GET /api/profile
router.get('/', async (req, res) => {
  try {
    const user = req.user.toObject();
    delete user.password;
    delete user.activeSessions;

    res.json({
      success: true,
      data: { user }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching profile'
    });
  }
});

// PUT /api/profile
router.put('/', [
  body('firstName').optional().trim().isLength({ min: 2, max: 50 }),
  body('lastName').optional().trim().isLength({ min: 2, max: 50 }),
  body('email').optional().isEmail(),
  body('bio').optional().isLength({ max: 500 }),
  body('city').optional().trim().isLength({ min: 2 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const allowedFields = ['firstName', 'lastName', 'email', 'bio', 'city'];
    const updates = {};

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const updatedUser = await req.user.model('User').findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    ).select('-password -activeSessions');

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { user: updatedUser }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Email already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while updating profile'
    });
  }
});

// POST /api/profile/avatar
router.post('/avatar', upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    // Upload to Cloudinary
    const avatarUrl = await uploadToCloudinary(req.file.buffer, req.file.originalname);

    // Update user avatar
    const updatedUser = await req.user.model('User').findByIdAndUpdate(
      req.user._id,
      { avatar: avatarUrl },
      { new: true }
    ).select('-password -activeSessions');

    res.json({
      success: true,
      message: 'Avatar updated successfully',
      data: { 
        user: updatedUser,
        avatarUrl
      }
    });

  } catch (error) {
    console.error('Avatar upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while uploading avatar'
    });
  }
});

// DELETE /api/profile/avatar
router.delete('/avatar', async (req, res) => {
  try {
    const updatedUser = await req.user.model('User').findByIdAndUpdate(
      req.user._id,
      { avatar: null },
      { new: true }
    ).select('-password -activeSessions');

    res.json({
      success: true,
      message: 'Avatar removed successfully',
      data: { user: updatedUser }
    });

  } catch (error) {
    console.error('Remove avatar error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while removing avatar'
    });
  }
});

// GET /api/profile/public/:userId
router.get('/public/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await req.user.model('User').findById(userId)
      .select('firstName lastName avatar city isProfessional professionalInfo.businessName createdAt')
      .where('isActive').equals(true);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: { user }
    });

  } catch (error) {
    console.error('Get public profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching public profile'
    });
  }
});

// PUT /api/profile/chat-settings
router.put('/chat-settings', [
  body('chatDisplayName').optional().trim().isLength({ min: 2, max: 50 }),
  body('showAnonymousCalls').optional().isBoolean(),
  body('showInactiveChats').optional().isBoolean(),
  body('showDisabledChats').optional().isBoolean(),
  body('autoFilterSuspicious').optional().isBoolean(),
  body('availabilityHours.start').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  body('availabilityHours.end').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const updates = {};
    
    if (req.body.chatDisplayName !== undefined) {
      updates.chatDisplayName = req.body.chatDisplayName;
    }

    const chatSettingsFields = [
      'showAnonymousCalls', 'showInactiveChats', 
      'showDisabledChats', 'autoFilterSuspicious'
    ];

    chatSettingsFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[`chatSettings.${field}`] = req.body[field];
      }
    });

    if (req.body.availabilityHours) {
      if (req.body.availabilityHours.start !== undefined) {
        updates['chatSettings.availabilityHours.start'] = req.body.availabilityHours.start;
      }
      if (req.body.availabilityHours.end !== undefined) {
        updates['chatSettings.availabilityHours.end'] = req.body.availabilityHours.end;
      }
    }

    const updatedUser = await req.user.model('User').findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password -activeSessions');

    res.json({
      success: true,
      message: 'Chat settings updated successfully',
      data: { user: updatedUser }
    });

  } catch (error) {
    console.error('Update chat settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating chat settings'
    });
  }
});

module.exports = router;
