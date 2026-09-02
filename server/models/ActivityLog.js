const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    userName: {
      type: String,
      required: true
    },
    userEmail: {
      type: String,
      required: true
    },
    action: {
      type: String,
      required: true // e.g. 'LOGIN', 'ORDER_CREATED', 'ORDER_STATUS_CHANGED'
    },
    entityType: {
      type: String,
      required: true // e.g. 'Order', 'Customer', 'Product', 'User', 'Settings'
    },
    entityId: {
      type: String,
      default: ''
    },
    entityName: {
      type: String,
      default: ''
    },
    description: {
      type: String,
      required: true
    },
    changes: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    }
  },
  {
    timestamps: true
  }
);

activityLogSchema.index({ createdAt: -1 });
activityLogSchema.index({ user: 1 });
activityLogSchema.index({ action: 1 });
activityLogSchema.index({ entityType: 1 });

const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);
module.exports = ActivityLog;
