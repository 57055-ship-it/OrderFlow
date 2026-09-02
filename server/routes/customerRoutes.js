const express = require('express');
const router = express.Router();
const {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer
} = require('../controllers/customerController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roles');

router.use(protect);

router.route('/').get(getCustomers).post(authorize('ADMIN', 'MANAGER'), createCustomer);
router
  .route('/:id')
  .get(getCustomerById)
  .put(authorize('ADMIN', 'MANAGER'), updateCustomer)
  .delete(authorize('ADMIN', 'MANAGER'), deleteCustomer);

module.exports = router;
