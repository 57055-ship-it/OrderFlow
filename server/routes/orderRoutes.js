const express = require('express');
const router = express.Router();
const {
  getOrders,
  getOrderById,
  createOrder,
  updateOrder,
  duplicateOrder,
  changeOrderStatus,
  deleteOrder
} = require('../controllers/orderController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roles');

router.use(protect);

router.route('/').get(getOrders).post(createOrder);
router.route('/:id').get(getOrderById).put(updateOrder).delete(deleteOrder);
router.post('/:id/duplicate', duplicateOrder);
router.patch('/:id/status', changeOrderStatus);

module.exports = router;
