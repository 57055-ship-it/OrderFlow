const Order = require('../models/Order');
const Customer = require('../models/Customer');
const Product = require('../models/Product');

// @desc Get Filtered Order Reports
// @route GET /api/reports/orders
const getOrderReports = async (req, res, next) => {
  try {
    const { dateFrom, dateTo, customer, status, createdBy } = req.query;

    const query = {};

    if (dateFrom || dateTo) {
      query.date = {};
      if (dateFrom) query.date.$gte = new Date(dateFrom);
      if (dateTo) {
        const d = new Date(dateTo);
        d.setHours(23, 59, 59, 999);
        query.date.$lte = d;
      }
    }

    if (customer) query.customer = customer;
    if (status) query.status = status;
    if (createdBy) query.createdBy = createdBy;

    const orders = await Order.find(query)
      .populate('customer', 'name companyName email phone')
      .populate('createdBy', 'name email')
      .sort({ date: -1 });

    // Aggregated Report Metrics
    let totalItemsQuantity = 0;
    const statusBreakdown = {
      Draft: 0,
      Submitted: 0,
      Processing: 0,
      Completed: 0,
      Cancelled: 0
    };

    orders.forEach((ord) => {
      if (statusBreakdown[ord.status] !== undefined) {
        statusBreakdown[ord.status]++;
      }
      ord.products.forEach((p) => {
        totalItemsQuantity += p.quantity || 0;
      });
    });

    res.json({
      success: true,
      data: {
        summary: {
          totalOrders: orders.length,
          totalItemsQuantity,
          statusBreakdown
        },
        orders
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get Customer-wise Report
// @route GET /api/reports/customers
const getCustomerReport = async (req, res, next) => {
  try {
    const { dateFrom, dateTo } = req.query;

    const matchStage = {};
    if (dateFrom || dateTo) {
      matchStage.date = {};
      if (dateFrom) matchStage.date.$gte = new Date(dateFrom);
      if (dateTo) matchStage.date.$lte = new Date(dateTo);
    }

    const customerReport = await Order.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$customer',
          orderCount: { $sum: 1 },
          lastOrderDate: { $max: '$date' },
          products: { $push: '$products' }
        }
      },
      {
        $lookup: {
          from: 'customers',
          localField: '_id',
          foreignField: '_id',
          as: 'customerDetails'
        }
      },
      { $unwind: '$customerDetails' },
      { $sort: { orderCount: -1 } }
    ]);

    const formatted = customerReport.map((item) => {
      let totalQty = 0;
      item.products.forEach((prodArr) => {
        prodArr.forEach((p) => {
          totalQty += p.quantity || 0;
        });
      });
      return {
        customerId: item._id,
        customerName: item.customerDetails.name,
        companyName: item.customerDetails.companyName,
        email: item.customerDetails.email,
        phone: item.customerDetails.phone,
        orderCount: item.orderCount,
        totalQuantityOrdered: totalQty,
        lastOrderDate: item.lastOrderDate
      };
    });

    res.json({ success: true, data: formatted });
  } catch (error) {
    next(error);
  }
};

// @desc Get Product-wise Report
// @route GET /api/reports/products
const getProductReport = async (req, res, next) => {
  try {
    const { dateFrom, dateTo } = req.query;

    const matchStage = {};
    if (dateFrom || dateTo) {
      matchStage.date = {};
      if (dateFrom) matchStage.date.$gte = new Date(dateFrom);
      if (dateTo) matchStage.date.$lte = new Date(dateTo);
    }

    const productReport = await Order.aggregate([
      { $match: matchStage },
      { $unwind: '$products' },
      {
        $group: {
          _id: '$products.description',
          productId: { $first: '$products.product' },
          totalQuantity: { $sum: '$products.quantity' },
          uom: { $first: '$products.uom' },
          orderCount: { $sum: 1 },
          lastOrderedDate: { $max: '$date' }
        }
      },
      { $sort: { totalQuantity: -1 } }
    ]);

    res.json({ success: true, data: productReport });
  } catch (error) {
    next(error);
  }
};

module.exports = { getOrderReports, getCustomerReport, getProductReport };
