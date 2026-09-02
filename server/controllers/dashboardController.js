const Order = require('../models/Order');
const Customer = require('../models/Customer');
const Product = require('../models/Product');

// @desc Get Executive Dashboard Statistics & Chart Data
// @route GET /api/dashboard/stats
const getDashboardStats = async (req, res, next) => {
  try {
    // 1. KPI Counts
    const totalOrders = await Order.countDocuments();
    const draftOrders = await Order.countDocuments({ status: 'Draft' });
    const submittedOrders = await Order.countDocuments({ status: 'Submitted' });
    const processingOrders = await Order.countDocuments({ status: 'Processing' });
    const completedOrders = await Order.countDocuments({ status: 'Completed' });
    const cancelledOrders = await Order.countDocuments({ status: 'Cancelled' });

    const totalCustomers = await Customer.countDocuments();
    const totalProducts = await Product.countDocuments();

    // 2. Orders by Status (Pie / Bar Chart Data)
    const ordersByStatus = [
      { name: 'Draft', count: draftOrders, color: '#94a3b8' },
      { name: 'Submitted', count: submittedOrders, color: '#3b82f6' },
      { name: 'Processing', count: processingOrders, color: '#f59e0b' },
      { name: 'Completed', count: completedOrders, color: '#10b981' },
      { name: 'Cancelled', count: cancelledOrders, color: '#ef4444' }
    ];

    // 3. Orders by Month (Last 6 Months Trend)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const monthlyAggregate = await Order.aggregate([
      { $match: { date: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const ordersByMonth = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const year = d.getFullYear();
      const month = d.getMonth() + 1;

      const found = monthlyAggregate.find((m) => m._id.year === year && m._id.month === month);
      ordersByMonth.push({
        month: `${monthNames[month - 1]} ${year.toString().slice(-2)}`,
        orders: found ? found.count : 0
      });
    }

    // 4. Top Customers by Order Count
    const topCustomersAgg = await Order.aggregate([
      { $group: { _id: '$customer', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'customers',
          localField: '_id',
          foreignField: '_id',
          as: 'customerDetails'
        }
      },
      { $unwind: '$customerDetails' },
      {
        $project: {
          _id: 1,
          name: '$customerDetails.name',
          companyName: '$customerDetails.companyName',
          ordersCount: '$count'
        }
      }
    ]);

    // 5. Top Products by Quantity
    const topProductsAgg = await Order.aggregate([
      { $unwind: '$products' },
      {
        $group: {
          _id: '$products.description',
          totalQuantity: { $sum: '$products.quantity' },
          uom: { $first: '$products.uom' },
          orderCount: { $sum: 1 }
        }
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 5 }
    ]);

    // 6. Recent 5 Orders
    const recentOrders = await Order.find()
      .populate('customer', 'name companyName')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      data: {
        kpis: {
          totalOrders,
          draftOrders,
          submittedOrders,
          processingOrders,
          completedOrders,
          cancelledOrders,
          totalCustomers,
          totalProducts
        },
        charts: {
          ordersByMonth,
          ordersByStatus,
          topCustomers: topCustomersAgg,
          topProducts: topProductsAgg
        },
        recentOrders
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getDashboardStats };
