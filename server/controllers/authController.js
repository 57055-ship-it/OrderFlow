const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { logActivity } = require('../services/activityService');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'orderflow_super_secret_jwt_key_2026_production', {
    expiresIn: '30d'
  });
};

// @desc Auth user & get token
// @route POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Your account has been deactivated. Contact Admin.' });
    }

    const token = generateToken(user._id);

    await logActivity({
      user,
      action: 'LOGIN',
      entityType: 'User',
      entityId: user._id,
      entityName: user.name,
      description: `User ${user.email} logged in successfully`
    });

    res.json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get current user profile
// @route GET /api/auth/me
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { login, getMe };
