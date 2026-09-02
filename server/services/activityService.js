const ActivityLog = require('../models/ActivityLog');

const logActivity = async ({ user, action, entityType, entityId = '', entityName = '', description, changes = null }) => {
  try {
    if (!user) return;
    await ActivityLog.create({
      user: user._id || user.id,
      userName: user.name || 'Unknown',
      userEmail: user.email || 'unknown@orderflow.com',
      action,
      entityType,
      entityId,
      entityName,
      description,
      changes
    });
  } catch (error) {
    console.error('[ActivityLog Error]', error.message);
  }
};

module.exports = { logActivity };
