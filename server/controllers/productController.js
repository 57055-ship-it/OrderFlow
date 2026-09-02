const Product = require('../models/Product');
const { logActivity } = require('../services/activityService');

// @desc Get all products
// @route GET /api/products
const getProducts = async (req, res, next) => {
  try {
    const { search, category, page = 1, limit = 50 } = req.query;

    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    if (category) {
      query.category = category;
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Product.countDocuments(query);
    const products = await Product.find(query).sort({ name: 1 }).skip(skip).limit(Number(limit));

    res.json({
      success: true,
      data: products,
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

// @desc Get product by ID
// @route GET /api/products/:id
const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

// @desc Create product
// @route POST /api/products
const createProduct = async (req, res, next) => {
  try {
    const { name, sku, description, category, defaultUOM } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Product name is required' });
    }

    if (sku) {
      const existingSku = await Product.findOne({ sku: sku.trim() });
      if (existingSku) {
        return res.status(400).json({ success: false, message: `Product with SKU '${sku}' already exists` });
      }
    }

    const product = await Product.create({
      name,
      sku: sku ? sku.trim() : undefined,
      description: description || '',
      category: category || 'General',
      defaultUOM: defaultUOM || 'PCS'
    });

    await logActivity({
      user: req.user,
      action: 'PRODUCT_CREATED',
      entityType: 'Product',
      entityId: product._id,
      entityName: product.name,
      description: `Created product catalog item: ${product.name}`
    });

    res.status(201).json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

// @desc Update product
// @route PUT /api/products/:id
const updateProduct = async (req, res, next) => {
  try {
    const { name, sku, description, category, defaultUOM } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    if (sku && sku.trim() !== product.sku) {
      const existingSku = await Product.findOne({ sku: sku.trim() });
      if (existingSku) {
        return res.status(400).json({ success: false, message: `Product with SKU '${sku}' already exists` });
      }
    }

    product.name = name || product.name;
    product.sku = sku !== undefined ? (sku ? sku.trim() : undefined) : product.sku;
    product.description = description !== undefined ? description : product.description;
    product.category = category || product.category;
    product.defaultUOM = defaultUOM || product.defaultUOM;

    await product.save();

    await logActivity({
      user: req.user,
      action: 'PRODUCT_UPDATED',
      entityType: 'Product',
      entityId: product._id,
      entityName: product.name,
      description: `Updated product item: ${product.name}`
    });

    res.json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

// @desc Delete product
// @route DELETE /api/products/:id
const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    await Product.findByIdAndDelete(req.params.id);

    await logActivity({
      user: req.user,
      action: 'PRODUCT_DELETED',
      entityType: 'Product',
      entityId: product._id,
      entityName: product.name,
      description: `Deleted product item: ${product.name}`
    });

    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getProducts, getProductById, createProduct, updateProduct, deleteProduct };
