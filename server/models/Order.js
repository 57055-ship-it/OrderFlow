const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    default: null
  },
  productName: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    required: [true, 'Product description is required'],
    trim: true
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [1, 'Quantity must be at least 1']
  },
  uom: {
    type: String,
    required: [true, 'UOM is required'],
    default: 'PCS'
  },
  position: {
    type: Number,
    default: 0
  }
});

const orderHistorySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  userName: {
    type: String,
    default: 'System'
  },
  action: {
    type: String,
    required: true
  },
  field: {
    type: String,
    default: ''
  },
  previousValue: {
    type: String,
    default: ''
  },
  newValue: {
    type: String,
    default: ''
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: [true, 'Customer is required']
    },
    date: {
      type: Date,
      required: [true, 'Order date is required'],
      default: Date.now
    },
    poNumber: {
      type: String,
      trim: true,
      default: ''
    },
    indentNumber: {
      type: String,
      trim: true,
      default: ''
    },
    status: {
      type: String,
      enum: ['Draft', 'Submitted', 'Processing', 'Completed', 'Cancelled'],
      default: 'Draft'
    },
    products: {
      type: [orderItemSchema],
      validate: [
        function (val) {
          return val.length > 0;
        },
        'Order must contain at least one product line item'
      ]
    },
    history: [orderHistorySchema],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true
  }
);

orderSchema.index({ customer: 1 });
orderSchema.index({ date: -1 });
orderSchema.index({ status: 1 });

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;
