const ActivityLog = require('../models/ActivityLog');

// @desc Get all activity logs (Admin only)
// @route GET /api/activity-logs
const getActivityLogs = async (req, res, next) => {
  try {
    const { user, action, entityType, dateFrom, dateTo, search, page = 1, limit = 50 } = req.query;

    const query = {};

    if (user) query.user = user;
    if (action) query.action = action;
    if (entityType) query.entityType = entityType;

    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
      if (dateTo) {
        const d = new Date(dateTo);
        d.setHours(23, 59, 59, 999);
        query.createdAt.$lte = d;
      }
    }

    if (search) {
      query.$or = [
        { userName: { $regex: search, $options: 'i' } },
        { userEmail: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { entityName: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await ActivityLog.countDocuments(query);
    const logs = await ActivityLog.find(query)
      .populate('user', 'name email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      data: logs,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getActivityLogs };
