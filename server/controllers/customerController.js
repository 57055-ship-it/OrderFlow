const Customer = require('../models/Customer');
const Order = require('../models/Order');
const { logActivity } = require('../services/activityService');

// @desc Get all customers (with search & pagination)
// @route GET /api/customers
const getCustomers = async (req, res, next) => {
  try {
    const { search, page = 1, limit = 20, sort = '-createdAt' } = req.query;

    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { companyName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Customer.countDocuments(query);
    const customers = await Customer.find(query)
      .sort(sort)
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      data: customers,
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

// @desc Get customer by ID with detailed order history
// @route GET /api/customers/:id
const getCustomerById = async (req, res, next) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    const orders = await Order.find({ customer: customer._id }).sort({ date: -1 });

    const totalOrders = orders.length;
    let totalProductsOrdered = 0;
    orders.forEach((order) => {
      order.products.forEach((prod) => {
        totalProductsOrdered += prod.quantity || 0;
      });
    });

    res.json({
      success: true,
      data: {
        customer,
        stats: {
          totalOrders,
          totalProductsOrdered
        },
        orders
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc Create customer
// @route POST /api/customers
const createCustomer = async (req, res, next) => {
  try {
    const { name, companyName, contactPerson, phone, email, address, notes } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Customer name is required' });
    }

    const customer = await Customer.create({
      name,
      companyName,
      contactPerson,
      phone,
      email,
      address,
      notes
    });

    await logActivity({
      user: req.user,
      action: 'CUSTOMER_CREATED',
      entityType: 'Customer',
      entityId: customer._id,
      entityName: customer.name,
      description: `Added new customer: ${customer.name}`
    });

    res.status(201).json({ success: true, data: customer });
  } catch (error) {
    next(error);
  }
};

// @desc Update customer
// @route PUT /api/customers/:id
const updateCustomer = async (req, res, next) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    const updated = await Customer.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });

    await logActivity({
      user: req.user,
      action: 'CUSTOMER_UPDATED',
      entityType: 'Customer',
      entityId: updated._id,
      entityName: updated.name,
      description: `Updated customer information for: ${updated.name}`
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

// @desc Delete customer
// @route DELETE /api/customers/:id
const deleteCustomer = async (req, res, next) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    // Check if customer has associated orders
    const orderCount = await Order.countDocuments({ customer: customer._id });
    if (orderCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete customer. There are ${orderCount} existing order(s) associated with this customer.`
      });
    }

    await Customer.findByIdAndDelete(req.params.id);

    await logActivity({
      user: req.user,
      action: 'CUSTOMER_DELETED',
      entityType: 'Customer',
      entityId: customer._id,
      entityName: customer.name,
      description: `Deleted customer: ${customer.name}`
    });

    res.json({ success: true, message: 'Customer deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getCustomers, getCustomerById, createCustomer, updateCustomer, deleteCustomer };
