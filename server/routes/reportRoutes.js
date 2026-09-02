const express = require('express');
const router = express.Router();
const { getOrderReports, getCustomerReport, getProductReport } = require('../controllers/reportController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roles');

router.use(protect);
router.use(authorize('ADMIN', 'MANAGER'));

router.get('/orders', getOrderReports);
router.get('/customers', getCustomerReport);
router.get('/products', getProductReport);

module.exports = router;
