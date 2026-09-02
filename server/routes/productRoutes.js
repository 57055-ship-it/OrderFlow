const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
} = require('../controllers/productController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roles');

router.use(protect);

router.route('/').get(getProducts).post(authorize('ADMIN', 'MANAGER'), createProduct);
router
  .route('/:id')
  .get(getProductById)
  .put(authorize('ADMIN', 'MANAGER'), updateProduct)
  .delete(authorize('ADMIN', 'MANAGER'), deleteProduct);

module.exports = router;
