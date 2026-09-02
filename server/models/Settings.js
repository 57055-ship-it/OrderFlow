const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      default: 'OrderFlow Enterprise'
    },
    companyLogo: {
      type: String,
      default: ''
    },
    address: {
      type: String,
      default: '100 Business Park Plaza, Suite 500, New York, NY 10001'
    },
    phone: {
      type: String,
      default: '+1 (800) 555-0199'
    },
    email: {
      type: String,
      default: 'orders@orderflow.com'
    },
    website: {
      type: String,
      default: 'www.orderflow.com'
    },
    orderPrefix: {
      type: String,
      default: 'ORD-'
    },
    defaultUOM: {
      type: String,
      default: 'PCS'
    },
    defaultOrderStatus: {
      type: String,
      default: 'Draft'
    }
  },
  {
    timestamps: true
  }
);

const Settings = mongoose.model('Settings', settingsSchema);
module.exports = Settings;
