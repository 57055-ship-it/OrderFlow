const Order = require('../models/Order');
const Settings = require('../models/Settings');
const Customer = require('../models/Customer');
const { logActivity } = require('../services/activityService');

// Helper to generate next unique order number
const generateNextOrderNumber = async () => {
  const settings = await Settings.findOne();
  const prefix = settings ? settings.orderPrefix : 'ORD-';

  // Find latest order
  const lastOrder = await Order.findOne().sort({ createdAt: -1 });

  let nextSeq = 1;
  if (lastOrder && lastOrder.orderNumber) {
    const numPart = lastOrder.orderNumber.replace(/^[^\d]+/, '');
    if (numPart && !isNaN(numPart)) {
      nextSeq = parseInt(numPart, 10) + 1;
    }
  }

  // Format with leading zeros e.g. ORD-000001
  const seqString = String(nextSeq).padStart(6, '0');
  const candidateNumber = `${prefix}${seqString}`;

  // Double check uniqueness
  const exists = await Order.findOne({ orderNumber: candidateNumber });
  if (exists) {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    return `${prefix}${seqString}-${randomSuffix}`;
  }

  return candidateNumber;
};

// @desc Get all orders
// @route GET /api/orders
const getOrders = async (req, res, next) => {
  try {
    const { status, customer, dateFrom, dateTo, search, page = 1, limit = 20, sort = '-createdAt' } = req.query;

    const query = {};

    // Role check: EMPLOYEE can only see their own orders unless viewing list
    if (req.user.role === 'EMPLOYEE') {
      query.createdBy = req.user._id;
    }

    if (status && status !== 'All') {
      query.status = status;
    }

    if (customer) {
      query.customer = customer;
    }

    if (dateFrom || dateTo) {
      query.date = {};
      if (dateFrom) query.date.$gte = new Date(dateFrom);
      if (dateTo) query.date.$lte = new Date(dateTo);
    }

    if (search) {
      const matchingCustomers = await Customer.find({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { companyName: { $regex: search, $options: 'i' } }
        ]
      }).select('_id');

      const customerIds = matchingCustomers.map((c) => c._id);

      query.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { poNumber: { $regex: search, $options: 'i' } },
        { indentNumber: { $regex: search, $options: 'i' } },
        { customer: { $in: customerIds } }
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .populate('customer', 'name companyName email phone')
      .populate('createdBy', 'name email')
      .sort(sort)
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      data: orders,
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

// @desc Get single order by ID
// @route GET /api/orders/:id
const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customer')
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .populate('history.user', 'name email')
      .populate('products.product');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Permission check for employee
    if (req.user.role === 'EMPLOYEE' && order.createdBy._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'You are not authorized to view this order' });
    }

    res.json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

// @desc Create new order
// @route POST /api/orders
const createOrder = async (req, res, next) => {
  try {
    const { customer, date, poNumber, indentNumber, status, products } = req.body;

    if (!customer) {
      return res.status(400).json({ success: false, message: 'Customer is required' });
    }

    if (!products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ success: false, message: 'Order must contain at least one product row' });
    }

    // Validate product rows
    for (let i = 0; i < products.length; i++) {
      const p = products[i];
      if (!p.description || p.description.trim() === '') {
        return res.status(400).json({ success: false, message: `Product row #${i + 1} requires a description` });
      }
      if (!p.quantity || Number(p.quantity) <= 0) {
        return res.status(400).json({ success: false, message: `Product row #${i + 1} quantity must be greater than 0` });
      }
      if (!p.uom) {
        return res.status(400).json({ success: false, message: `Product row #${i + 1} requires a UOM` });
      }
    }

    const orderNumber = await generateNextOrderNumber();

    const order = await Order.create({
      orderNumber,
      customer,
      date: date || new Date(),
      poNumber: poNumber || '',
      indentNumber: indentNumber || '',
      status: status || 'Draft',
      products: products.map((p, idx) => ({
        product: p.product || null,
        productName: p.productName || '',
        description: p.description,
        quantity: Number(p.quantity),
        uom: p.uom,
        position: idx + 1
      })),
      createdBy: req.user._id,
      updatedBy: req.user._id,
      history: [
        {
          user: req.user._id,
          userName: req.user.name,
          action: 'CREATED',
          field: 'Order',
          previousValue: '',
          newValue: `Created order ${orderNumber} in status '${status || 'Draft'}'`,
          timestamp: new Date()
        }
      ]
    });

    const populated = await Order.findById(order._id).populate('customer').populate('createdBy', 'name email');

    await logActivity({
      user: req.user,
      action: 'ORDER_CREATED',
      entityType: 'Order',
      entityId: order._id,
      entityName: order.orderNumber,
      description: `Created order ${order.orderNumber} for customer ${populated.customer?.name}`
    });

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};

// @desc Update order
// @route PUT /api/orders/:id
const updateOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('customer');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Role permissions check
    const userRole = req.user.role;
    const isOwner = order.createdBy.toString() === req.user._id.toString();

    if (userRole === 'EMPLOYEE') {
      if (!isOwner) {
        return res.status(403).json({ success: false, message: 'You can only edit your own orders' });
      }
      if (order.status !== 'Draft') {
        return res.status(403).json({ success: false, message: 'Employees can only edit Draft orders' });
      }
    } else if (userRole === 'MANAGER') {
      if (order.status === 'Completed' || order.status === 'Cancelled') {
        return res.status(403).json({ success: false, message: 'Managers cannot edit Completed or Cancelled orders' });
      }
    }

    const { customer, date, poNumber, indentNumber, status, products } = req.body;
    const historyEntries = [];

    // Track field changes
    if (customer && customer.toString() !== order.customer._id.toString()) {
      const oldCust = order.customer.name;
      const newCustDoc = await Customer.findById(customer);
      historyEntries.push({
        user: req.user._id,
        userName: req.user.name,
        action: 'CHANGED_CUSTOMER',
        field: 'Customer',
        previousValue: oldCust,
        newValue: newCustDoc ? newCustDoc.name : customer,
        timestamp: new Date()
      });
      order.customer = customer;
    }

    if (poNumber !== undefined && poNumber !== order.poNumber) {
      historyEntries.push({
        user: req.user._id,
        userName: req.user.name,
        action: 'CHANGED_PO',
        field: 'PO Number',
        previousValue: order.poNumber || '(Empty)',
        newValue: poNumber || '(Empty)',
        timestamp: new Date()
      });
      order.poNumber = poNumber;
    }

    if (indentNumber !== undefined && indentNumber !== order.indentNumber) {
      historyEntries.push({
        user: req.user._id,
        userName: req.user.name,
        action: 'CHANGED_INDENT',
        field: 'Indent Number',
        previousValue: order.indentNumber || '(Empty)',
        newValue: indentNumber || '(Empty)',
        timestamp: new Date()
      });
      order.indentNumber = indentNumber;
    }

    if (status && status !== order.status) {
      historyEntries.push({
        user: req.user._id,
        userName: req.user.name,
        action: 'CHANGED_STATUS',
        field: 'Status',
        previousValue: order.status,
        newValue: status,
        timestamp: new Date()
      });
      order.status = status;
    }

    if (date) {
      order.date = date;
    }

    if (products && Array.isArray(products)) {
      historyEntries.push({
        user: req.user._id,
        userName: req.user.name,
        action: 'UPDATED_PRODUCTS',
        field: 'Products List',
        previousValue: `${order.products.length} line items`,
        newValue: `${products.length} line items`,
        timestamp: new Date()
      });

      order.products = products.map((p, idx) => ({
        product: p.product || null,
        productName: p.productName || '',
        description: p.description,
        quantity: Number(p.quantity),
        uom: p.uom,
        position: idx + 1
      }));
    }

    order.updatedBy = req.user._id;
    if (historyEntries.length > 0) {
      order.history.push(...historyEntries);
    }

    await order.save();

    const updated = await Order.findById(order._id)
      .populate('customer')
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .populate('history.user', 'name email');

    await logActivity({
      user: req.user,
      action: 'ORDER_UPDATED',
      entityType: 'Order',
      entityId: order._id,
      entityName: order.orderNumber,
      description: `Updated order ${order.orderNumber}`
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

// @desc Duplicate order
// @route POST /api/orders/:id/duplicate
const duplicateOrder = async (req, res, next) => {
  try {
    const original = await Order.findById(req.params.id);

    if (!original) {
      return res.status(404).json({ success: false, message: 'Original order not found' });
    }

    const newOrderNumber = await generateNextOrderNumber();

    const duplicated = await Order.create({
      orderNumber: newOrderNumber,
      customer: original.customer,
      date: new Date(),
      poNumber: original.poNumber ? `${original.poNumber}-COPY` : '',
      indentNumber: original.indentNumber ? `${original.indentNumber}-COPY` : '',
      status: 'Draft',
      products: original.products.map((item, idx) => ({
        product: item.product,
        productName: item.productName,
        description: item.description,
        quantity: item.quantity,
        uom: item.uom,
        position: idx + 1
      })),
      createdBy: req.user._id,
      updatedBy: req.user._id,
      history: [
        {
          user: req.user._id,
          userName: req.user.name,
          action: 'DUPLICATED',
          field: 'Order',
          previousValue: `Duplicated from ${original.orderNumber}`,
          newValue: `Created new Draft ${newOrderNumber}`,
          timestamp: new Date()
        }
      ]
    });

    const populated = await Order.findById(duplicated._id).populate('customer').populate('createdBy', 'name email');

    await logActivity({
      user: req.user,
      action: 'ORDER_DUPLICATED',
      entityType: 'Order',
      entityId: duplicated._id,
      entityName: duplicated.orderNumber,
      description: `Duplicated order ${original.orderNumber} to ${duplicated.orderNumber}`
    });

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};

// @desc Change order status
// @route PATCH /api/orders/:id/status
const changeOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const prevStatus = order.status;
    order.status = status;
    order.updatedBy = req.user._id;

    order.history.push({
      user: req.user._id,
      userName: req.user.name,
      action: 'STATUS_CHANGED',
      field: 'Status',
      previousValue: prevStatus,
      newValue: status,
      timestamp: new Date()
    });

    await order.save();

    await logActivity({
      user: req.user,
      action: 'ORDER_STATUS_CHANGED',
      entityType: 'Order',
      entityId: order._id,
      entityName: order.orderNumber,
      description: `Changed status of ${order.orderNumber} from '${prevStatus}' to '${status}'`
    });

    res.json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

// @desc Delete order
// @route DELETE /api/orders/:id
const deleteOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (req.user.role === 'EMPLOYEE' && order.status !== 'Draft') {
      return res.status(403).json({ success: false, message: 'Employees can only delete their own Draft orders' });
    }

    await Order.findByIdAndDelete(req.params.id);

    await logActivity({
      user: req.user,
      action: 'ORDER_DELETED',
      entityType: 'Order',
      entityId: order._id,
      entityName: order.orderNumber,
      description: `Deleted order ${order.orderNumber}`
    });

    res.json({ success: true, message: 'Order deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getOrders,
  getOrderById,
  createOrder,
  updateOrder,
  duplicateOrder,
  changeOrderStatus,
  deleteOrder
};
