const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Check if user is authenticated
const isAuthenticated = async (req, res, next) => {
  if (req.session.user) return next();

  const token = req.cookies.token;
  if (!token) return res.redirect('/auth/login');

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      res.clearCookie('token');
      return res.redirect('/auth/login');
    }
    req.session.user = {
      id: user._id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      emailVerified: user.emailVerified,
      kycStatus: user.kycStatus
    };
    next();
  } catch (error) {
    res.clearCookie('token');
    res.redirect('/auth/login');
  }
};

// Check if user is admin
const isAdmin = (req, res, next) => {
  if (req.session.user && req.session.user.role === 'admin') return next();
  res.status(403).render('403', { title: 'Access Denied' });
};

// Require email verification
const requireVerified = (req, res, next) => {
  if (!req.session.user) return res.redirect('/auth/login');
  if (!req.session.user.emailVerified) return res.redirect('/auth/verify-email');
  next();
};

// Refresh session data from database on every request
const refreshUserStatus = async (req, res, next) => {
  if (req.session.user && req.session.user.id) {
    try {
      const user = await User.findById(req.session.user.id).select('kycStatus emailVerified role');
      if (user) {
        req.session.user.kycStatus = user.kycStatus;
        req.session.user.emailVerified = user.emailVerified;
        req.session.user.role = user.role;
      }
    } catch (err) {
      console.error('Session refresh error:', err);
    }
  }
  next();
};

module.exports = { isAuthenticated, isAdmin, requireVerified, refreshUserStatus };
