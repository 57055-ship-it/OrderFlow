const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true
    },
    sku: {
      type: String,
      trim: true,
      unique: true,
      sparse: true
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    category: {
      type: String,
      trim: true,
      default: 'General'
    },
    defaultUOM: {
      type: String,
      required: [true, 'Default UOM is required'],
      default: 'PCS'
    }
  },
  {
    timestamps: true
  }
);

productSchema.index({ name: 'text', sku: 'text', category: 'text' });

const Product = mongoose.model('Product', productSchema);
module.exports = Product;
