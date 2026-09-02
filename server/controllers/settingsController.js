const Settings = require('../models/Settings');
const { logActivity } = require('../services/activityService');

// @desc Get system settings
// @route GET /api/settings
const getSettings = async (req, res, next) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({});
    }
    res.json({ success: true, data: settings });
  } catch (error) {
    next(error);
  }
};

// @desc Update system settings
// @route PUT /api/settings
const updateSettings = async (req, res, next) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create(req.body);
    } else {
      settings = await Settings.findByIdAndUpdate(settings._id, req.body, { new: true, runValidators: true });
    }

    await logActivity({
      user: req.user,
      action: 'SETTINGS_UPDATED',
      entityType: 'Settings',
      entityId: settings._id,
      entityName: 'System Settings',
      description: 'Updated system configurations and company branding'
    });

    res.json({ success: true, data: settings });
  } catch (error) {
    next(error);
  }
};

module.exports = { getSettings, updateSettings };
