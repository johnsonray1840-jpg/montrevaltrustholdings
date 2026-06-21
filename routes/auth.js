const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const BASE_URL = process.env.BASE_URL || 'http://localhost:9000';
const jwt = require('jsonwebtoken');
const { sendEmail, emailTemplates } = require('../utils/emailService');

// ==================== LOGIN ====================

// Login Page
router.get('/login', (req, res) => {
  if (req.session.user) {
    return res.redirect('/user/dashboard');
  }
  res.render('login', { 
    title: 'Login - Montreval Trust Holdings',
    error: null,
    success: null,
    user: null
  });
});

// Login Handler
router.post('/login', [
  body('email').isEmail().withMessage('Please enter a valid email').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.render('login', {
      title: 'Login - Montreval Trust Holdings',
      error: errors.array()[0].msg,
      success: null,
      user: null
    });
  }

  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.render('login', {
        title: 'Login - Montreval Trust Holdings',
        error: 'Invalid email or password',
        success: null,
        user: null
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.render('login', {
        title: 'Login - Montreval Trust Holdings',
        error: 'Invalid email or password',
        success: null,
        user: null
      });
    }

    // Set session
    req.session.user = {
      id: user._id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      emailVerified: user.emailVerified || false,
      kycStatus: user.kycStatus || 'not_started'
    };

    // Generate JWT for API calls
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.cookie('token', token, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 });

    // Redirect based on role
    if (user.role === 'admin') {
      return res.redirect('/admin/dashboard');
    }
    res.redirect('/user/dashboard');
    
  } catch (error) {
    console.error('Login error:', error);
    res.render('login', {
      title: 'Login - Montreval Trust Holdings',
      error: 'Server error. Please try again.',
      success: null,
      user: null
    });
  }
});

// ==================== SIGNUP ====================

// Signup Page - FIXED: removed /auth/ prefix
router.get('/signup', (req, res) => {
  if (req.session.user) {
    return res.redirect('/user/dashboard');
  }
  res.render('signup', { 
    title: 'Create Account - Montreval Trust Holdings',
    error: null,
    formData: {},
    user: null
  });
});

// Signup Handler - FIXED: removed /auth/ prefix
router.post('/signup', [
  body('fullName').notEmpty().withMessage('Full name is required').trim().escape(),
  body('email').isEmail().withMessage('Please enter a valid email').normalizeEmail(),
  body('password').isStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1
  }).withMessage('Password must be at least 8 characters with upper, lower, number, and symbol'),
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Passwords do not match');
    }
    return true;
  })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.render('signup', { 
      title: 'Create Account - Montreval Trust Holdings', 
      error: errors.array()[0].msg, 
      formData: req.body,
      user: null
    });
  }

  try {
    const { fullName, email, password } = req.body;
    
    // Check existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.render('signup', { 
        title: 'Create Account - Montreval Trust Holdings', 
        error: 'Email already registered', 
        formData: req.body,
        user: null
      });
    }

    // Generate 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Create user
    const user = await User.create({
      fullName,
      email,
      password,
      emailVerificationCode: verificationCode,
      emailVerificationExpires: Date.now() + 10 * 60 * 1000, // 10 minutes
      emailVerified: false,
      kycStatus: 'not_started'
    });

    // Send verification email
    try {
      const emailData = emailTemplates.verificationCode(user.fullName, verificationCode);
      await sendEmail({ to: user.email, subject: emailData.subject, html: emailData.html });
    } catch (emailError) {
      console.error('Verification email failed:', emailError);
      // Continue - don't block signup if email fails
    }

    // Set session – user is logged in but NOT verified
    req.session.user = {
      id: user._id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      emailVerified: false,
      kycStatus: user.kycStatus || 'not_started'
    };

    // Redirect to verify page
    res.redirect('/auth/verify-email');

  } catch (error) {
    console.error('Signup error:', error);
    res.render('signup', { 
      title: 'Create Account - Montreval Trust Holdings', 
      error: 'Server error. Please try again.', 
      formData: req.body,
      user: null
    });
  }
});

// ==================== LOGOUT ====================

router.get('/logout', (req, res) => {
  req.session.walletUnlocked = false;
  req.session.destroy(err => {
    if (err) console.error('Logout error:', err);
    res.clearCookie('connect.sid');
    res.clearCookie('token');
    res.redirect('/');
  });
});

// ==================== EMAIL VERIFICATION ====================

// GET verify email page
router.get('/verify-email', (req, res) => {
  if (!req.session.user) return res.redirect('/auth/login');
  res.render('auth/verify-email', { 
    user: req.session.user, 
    error: null, 
    message: null 
  });
});

// POST verify code
router.post('/verify-email', async (req, res) => {
  if (!req.session.user) return res.redirect('/auth/login');
  
  const { code } = req.body;
  
  try {
    const user = await User.findById(req.session.user.id);
    if (!user) {
      return res.render('auth/verify-email', { 
        user: req.session.user, 
        error: 'User not found',
        message: null
      });
    }

    if (user.emailVerificationCode !== code) {
      return res.render('auth/verify-email', { 
        user: req.session.user, 
        error: 'Invalid verification code',
        message: null
      });
    }

    if (user.emailVerificationExpires < Date.now()) {
      return res.render('auth/verify-email', { 
        user: req.session.user, 
        error: 'Verification code has expired. Please request a new one.',
        message: null
      });
    }

    // Mark as verified
    user.emailVerified = true;
    user.emailVerificationCode = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    // Update session
    req.session.user.emailVerified = true;

    // Send welcome email
    try {
      const emailData = emailTemplates.welcome(user.fullName);
      await sendEmail({
        to: user.email,
        subject: emailData.subject,
        html: emailData.html
      });
    } catch (emailError) {
      console.error('Welcome email failed:', emailError);
    }

    res.redirect('/user/dashboard?success=Email+verified+successfully');
  } catch (error) {
    console.error('Verification error:', error);
    res.render('auth/verify-email', { 
      user: req.session.user, 
      error: 'Server error. Please try again.',
      message: null
    });
  }
});

// POST resend verification code
router.post('/resend-verification', async (req, res) => {
  if (!req.session.user) return res.redirect('/auth/login');
  
  try {
    const user = await User.findById(req.session.user.id);
    if (!user) return res.redirect('/auth/login');
    
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    user.emailVerificationCode = verificationCode;
    user.emailVerificationExpires = Date.now() + 10 * 60 * 1000;
    await user.save();
    
    const emailData = emailTemplates.verificationCode(user.fullName, verificationCode);
    await sendEmail({ to: user.email, subject: emailData.subject, html: emailData.html });
    
    res.render('auth/verify-email', { 
      user: req.session.user, 
      error: null, 
      message: 'New verification code sent to your email!' 
    });
  } catch (error) {
    console.error('Resend error:', error);
    res.render('auth/verify-email', { 
      user: req.session.user, 
      error: 'Could not resend code. Please try again.',
      message: null
    });
  }
});

// ==================== FORGOT PASSWORD ====================

// Forgot Password Page
router.get('/forgot-password', (req, res) => {
  res.render('auth/forgot-password', {
    title: 'Forgot Password - Montreval Trust Holdings',
    error: null,
    success: null,
    user: null
  });
});

// Send Reset Email
router.post('/forgot-password', [
  body('email').isEmail().withMessage('Please enter a valid email').normalizeEmail()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.render('auth/forgot-password', {
      title: 'Forgot Password',
      error: errors.array()[0].msg,
      success: null,
      user: null
    });
  }

  try {
    const user = await User.findOne({ email: req.body.email });
    
    // Always show success even if user doesn't exist (security)
    if (!user) {
      return res.render('auth/forgot-password', {
        title: 'Forgot Password',
        error: null,
        success: 'If that email is registered, you will receive a password reset link.',
        user: null
      });
    }

    // Generate token
    const crypto = require('crypto');
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.passwordResetToken = resetToken;
    user.passwordResetExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    // Send email
    const resetUrl = `${BASE_URL}/auth/reset-password/${resetToken}`;
    const emailData = emailTemplates.passwordReset(user.fullName, resetUrl);
    await sendEmail({ to: user.email, subject: emailData.subject, html: emailData.html });

    res.render('auth/forgot-password', {
      title: 'Forgot Password',
      error: null,
      success: 'If that email is registered, you will receive a password reset link.',
      user: null
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.render('auth/forgot-password', {
      title: 'Forgot Password',
      error: 'Server error. Please try again.',
      success: null,
      user: null
    });
  }
});

// Reset Password Page
router.get('/reset-password/:token', async (req, res) => {
  try {
    const user = await User.findOne({
      passwordResetToken: req.params.token,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.render('auth/reset-password', {
        title: 'Reset Password',
        error: 'Invalid or expired reset link. Please request a new one.',
        success: null,
        token: null,
        user: null
      });
    }

    res.render('auth/reset-password', {
      title: 'Reset Password',
      error: null,
      success: null,
      token: req.params.token,
      user: null
    });
  } catch (error) {
    res.render('auth/reset-password', {
      title: 'Reset Password',
      error: 'Server error. Please try again.',
      success: null,
      token: null,
      user: null
    });
  }
});

// Handle Reset Password
router.post('/reset-password/:token', [
  body('password').isStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1
  }).withMessage('Password must be at least 8 characters with upper, lower, number, and symbol'),
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.password) throw new Error('Passwords do not match');
    return true;
  })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.render('auth/reset-password', {
      title: 'Reset Password',
      error: errors.array()[0].msg,
      success: null,
      token: req.params.token,
      user: null
    });
  }

  try {
    const user = await User.findOne({
      passwordResetToken: req.params.token,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.render('auth/reset-password', {
        title: 'Reset Password',
        error: 'Invalid or expired reset link.',
        success: null,
        token: null,
        user: null
      });
    }

    user.password = req.body.password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    // Send confirmation
    const emailData = emailTemplates.passwordChanged(user.fullName);
    await sendEmail({ to: user.email, subject: emailData.subject, html: emailData.html });

    res.render('auth/reset-password', {
      title: 'Reset Password',
      error: null,
      success: 'Password changed successfully! You can now sign in.',
      token: null,
      user: null
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.render('auth/reset-password', {
      title: 'Reset Password',
      error: 'Server error. Please try again.',
      success: null,
      token: req.params.token,
      user: null
    });
  }
});

module.exports = router;