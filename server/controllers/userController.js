const User = require('../models/User');
const { logActivity } = require('../services/activityService');

// @desc Get all users
// @route GET /api/users
const getUsers = async (req, res, next) => {
  try {
    const users = await User.find({}).sort({ createdAt: -1 });
    res.json({ success: true, data: users });
  } catch (error) {
    next(error);
  }
};

// @desc Create new user
// @route POST /api/users
const createUser = async (req, res, next) => {
  try {
    const { name, email, password, role, isActive } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User with this email already exists' });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'EMPLOYEE',
      isActive: isActive !== undefined ? isActive : true
    });

    await logActivity({
      user: req.user,
      action: 'USER_CREATED',
      entityType: 'User',
      entityId: user._id,
      entityName: user.name,
      description: `Created user ${user.name} (${user.role})`
    });

    res.status(201).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc Update user
// @route PUT /api/users/:id
const updateUser = async (req, res, next) => {
  try {
    const { name, email, role, isActive, password } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Safety: If changing role away from ADMIN or deactivating, check if last active admin
    if ((role && role !== 'ADMIN') || isActive === false) {
      if (user.role === 'ADMIN') {
        const adminCount = await User.countDocuments({ role: 'ADMIN', isActive: true });
        if (adminCount <= 1) {
          return res.status(400).json({
            success: false,
            message: 'Cannot deactivate or change role of the last active Administrator'
          });
        }
      }
    }

    if (name) user.name = name;
    if (email) user.email = email;
    if (role) user.role = role;
    if (isActive !== undefined) user.isActive = isActive;
    if (password) user.password = password;

    await user.save();

    await logActivity({
      user: req.user,
      action: 'USER_UPDATED',
      entityType: 'User',
      entityId: user._id,
      entityName: user.name,
      description: `Updated user ${user.name}`
    });

    res.json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc Toggle active status
// @route PATCH /api/users/:id/status
const toggleUserStatus = async (req, res, next) => {
  try {
    const { isActive } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (!isActive && user.role === 'ADMIN') {
      const activeAdmins = await User.countDocuments({ role: 'ADMIN', isActive: true });
      if (activeAdmins <= 1) {
        return res.status(400).json({
          success: false,
          message: 'Cannot deactivate the last active Administrator'
        });
      }
    }

    user.isActive = isActive;
    await user.save();

    await logActivity({
      user: req.user,
      action: 'USER_UPDATED',
      entityType: 'User',
      entityId: user._id,
      entityName: user.name,
      description: `${isActive ? 'Activated' : 'Deactivated'} user ${user.name}`
    });

    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

// @desc Delete user
// @route DELETE /api/users/:id
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.role === 'ADMIN') {
      const adminCount = await User.countDocuments({ role: 'ADMIN' });
      if (adminCount <= 1) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete the last Administrator account'
        });
      }
    }

    await User.findByIdAndDelete(req.params.id);

    await logActivity({
      user: req.user,
      action: 'USER_DELETED',
      entityType: 'User',
      entityId: user._id,
      entityName: user.name,
      description: `Deleted user ${user.name}`
    });

    res.json({ success: true, message: 'User removed successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getUsers, createUser, updateUser, toggleUserStatus, deleteUser };
