const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const twilio = require('twilio');
const crypto = require('crypto');
const User = require('../models/User');
const { PhoneVerification, PasswordReset } = require('../models');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Initialize Twilio client
const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// Helper function to generate JWT
const generateTokens = (userId) => {
  const accessToken = jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '24h' }
  );
  
  const refreshToken = jwt.sign(
    { userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d' }
  );
  
  return { accessToken, refreshToken };
};

// Helper function to generate SMS code
const generateSMSCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// POST /api/auth/register
router.post('/register', [
  body('firstName').trim().isLength({ min: 2, max: 50 }).withMessage('First name must be 2-50 characters'),
  body('lastName').trim().isLength({ min: 2, max: 50 }).withMessage('Last name must be 2-50 characters'),
  body('phoneNumber').isMobilePhone().withMessage('Valid phone number required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('city').trim().isLength({ min: 2 }).withMessage('City is required')
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

    const { firstName, lastName, phoneNumber, password, city, email } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ phoneNumber });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User with this phone number already exists'
      });
    }

    // Create new user
    const user = new User({
      firstName,
      lastName,
      phoneNumber,
      password,
      city,
      email: email || undefined
    });

    await user.save();

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user._id);

    // Send verification SMS
    const verificationCode = generateSMSCode();
    const verification = new PhoneVerification({
      phoneNumber,
      code: verificationCode
    });
    await verification.save();

    // Send SMS (in production)
    if (process.env.NODE_ENV === 'production') {
      await twilioClient.messages.create({
        body: `Your DejaNew verification code is: ${verificationCode}`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phoneNumber
      });
    }

    res.status(201).json({
      success: true,
      message: 'User registered successfully. Please verify your phone number.',
      data: {
        user: user.getPublicProfile(),
        accessToken,
        refreshToken,
        verificationSent: true
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
});

// POST /api/auth/login
router.post('/login', [
  body('phoneNumber').isMobilePhone().withMessage('Valid phone number required'),
  body('password').notEmpty().withMessage('Password is required')
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

    const { phoneNumber, password } = req.body;

    // Find user
    const user = await User.findOne({ phoneNumber, isActive: true });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid phone number or password'
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid phone number or password'
      });
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user._id);

    // Update last login and add session
    user.lastLogin = new Date();
    const sessionId = crypto.randomUUID();
    user.activeSessions.push({
      sessionId,
      deviceInfo: req.headers['user-agent'] || 'Unknown',
      ipAddress: req.ip
    });

    // Keep only last 5 sessions
    if (user.activeSessions.length > 5) {
      user.activeSessions = user.activeSessions.slice(-5);
    }

    await user.save();

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: user.getPublicProfile(),
        accessToken,
        refreshToken,
        sessionId
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
});

// POST /api/auth/verify-phone
router.post('/verify-phone', [
  body('phoneNumber').isMobilePhone().withMessage('Valid phone number required'),
  body('code').isLength({ min: 6, max: 6 }).withMessage('Verification code must be 6 digits')
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

    const { phoneNumber, code } = req.body;

    // Find verification
    const verification = await PhoneVerification.findOne({
      phoneNumber,
      code,
      isUsed: false,
      expiresAt: { $gt: new Date() }
    });

    if (!verification) {
      // Increment attempts
      await PhoneVerification.updateOne(
        { phoneNumber, code },
        { $inc: { attempts: 1 } }
      );

      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification code'
      });
    }

    // Update user verification status
    const user = await User.findOneAndUpdate(
      { phoneNumber },
      { isPhoneVerified: true },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Mark verification as used
    verification.isUsed = true;
    await verification.save();

    res.json({
      success: true,
      message: 'Phone number verified successfully',
      data: {
        user: user.getPublicProfile()
      }
    });

  } catch (error) {
    console.error('Phone verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during phone verification'
    });
  }
});

// POST /api/auth/resend-verification
router.post('/resend-verification', [
  body('phoneNumber').isMobilePhone().withMessage('Valid phone number required')
], async (req, res) => {
  try {
    const { phoneNumber } = req.body;

    // Check if user exists
    const user = await User.findOne({ phoneNumber });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.isPhoneVerified) {
      return res.status(400).json({
        success: false,
        message: 'Phone number already verified'
      });
    }

    // Generate new verification code
    const verificationCode = generateSMSCode();
    const verification = new PhoneVerification({
      phoneNumber,
      code: verificationCode
    });
    await verification.save();

    // Send SMS (in production)
    if (process.env.NODE_ENV === 'production') {
      await twilioClient.messages.create({
        body: `Your DejaNew verification code is: ${verificationCode}`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phoneNumber
      });
    }

    res.json({
      success: true,
      message: 'Verification code sent successfully'
    });

  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while resending verification'
    });
  }
});

// POST /api/auth/request-reset
router.post('/request-reset', [
  body('phoneNumber').isMobilePhone().withMessage('Valid phone number required')
], async (req, res) => {
  try {
    const { phoneNumber } = req.body;

    const user = await User.findOne({ phoneNumber, isActive: true });
    if (!user) {
      // Don't reveal if user exists or not
      return res.json({
        success: true,
        message: 'If an account with this phone number exists, a reset code will be sent.'
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const passwordReset = new PasswordReset({
      user: user._id,
      token: resetToken
    });
    await passwordReset.save();

    // Generate SMS code for reset
    const resetCode = generateSMSCode();
    const verification = new PhoneVerification({
      phoneNumber,
      code: resetCode
    });
    await verification.save();

    // Send SMS (in production)
    if (process.env.NODE_ENV === 'production') {
      await twilioClient.messages.create({
        body: `Your DejaNew password reset code is: ${resetCode}`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phoneNumber
      });
    }

    res.json({
      success: true,
      message: 'Password reset code sent successfully',
      data: { resetToken }
    });

  } catch (error) {
    console.error('Password reset request error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during password reset request'
    });
  }
});

// POST /api/auth/reset-password
router.post('/reset-password', [
  body('resetToken').notEmpty().withMessage('Reset token is required'),
  body('code').isLength({ min: 6, max: 6 }).withMessage('Verification code must be 6 digits'),
  body('newPassword').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
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

    const { resetToken, code, newPassword } = req.body;

    // Find reset request
    const passwordReset = await PasswordReset.findOne({
      token: resetToken,
      isUsed: false,
      expiresAt: { $gt: new Date() }
    }).populate('user');

    if (!passwordReset) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    // Verify SMS code
    const verification = await PhoneVerification.findOne({
      phoneNumber: passwordReset.user.phoneNumber,
      code,
      isUsed: false,
      expiresAt: { $gt: new Date() }
    });

    if (!verification) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification code'
      });
    }

    // Update password
    passwordReset.user.password = newPassword;
    await passwordReset.user.save();

    // Mark reset and verification as used
    passwordReset.isUsed = true;
    verification.isUsed = true;
    await Promise.all([passwordReset.save(), verification.save()]);

    res.json({
      success: true,
      message: 'Password reset successfully'
    });

  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during password reset'
    });
  }
});

// POST /api/auth/verify-identity
router.post('/verify-identity', authMiddleware, [
  body('nationalId').isLength({ min: 10, max: 10 }).withMessage('National ID must be 10 digits'),
  body('documents').isArray({ min: 1 }).withMessage('At least one document is required')
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

    const { nationalId, documents } = req.body;

    // Update user identity verification data
    req.user.identityVerificationData = {
      nationalId,
      documents,
      verificationStatus: 'pending',
      submittedAt: new Date()
    };

    await req.user.save();

    res.json({
      success: true,
      message: 'Identity verification submitted successfully. It will be reviewed within 24-48 hours.',
      data: {
        status: 'pending',
        submittedAt: req.user.identityVerificationData.submittedAt
      }
    });

  } catch (error) {
    console.error('Identity verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during identity verification'
    });
  }
});

// GET /api/auth/sessions
router.get('/sessions', authMiddleware, async (req, res) => {
  try {
    const sessions = req.user.activeSessions.map(session => ({
      sessionId: session.sessionId,
      deviceInfo: session.deviceInfo,
      ipAddress: session.ipAddress,
      createdAt: session.createdAt,
      lastActive: session.lastActive
    }));

    res.json({
      success: true,
      data: { sessions }
    });

  } catch (error) {
    console.error('Get sessions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching sessions'
    });
  }
});

// DELETE /api/auth/sessions/:id
router.delete('/sessions/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    req.user.activeSessions = req.user.activeSessions.filter(
      session => session.sessionId !== id
    );

    await req.user.save();

    res.json({
      success: true,
      message: 'Session terminated successfully'
    });

  } catch (error) {
    console.error('Delete session error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while terminating session'
    });
  }
});

// POST /api/auth/logout
router.post('/logout', authMiddleware, async (req, res) => {
  try {
    const sessionId = req.headers['x-session-id'];

    if (sessionId) {
      req.user.activeSessions = req.user.activeSessions.filter(
        session => session.sessionId !== sessionId
      );
      await req.user.save();
    }

    res.json({
      success: true,
      message: 'Logged out successfully'
    });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during logout'
    });
  }
});

module.exports = router;
