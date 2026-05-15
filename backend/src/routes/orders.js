const router = require('express').Router();
const {
  createOrder, getMyOrders, getOrder,
  getSellerOrders, updateOrderStatus, getAllOrders,
} = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.post('/', createOrder);
router.get('/my', getMyOrders);
router.get('/seller', authorize('seller'), getSellerOrders);
router.get('/admin', authorize('admin'), getAllOrders);
router.get('/:id', getOrder);
router.put('/:id/status', authorize('seller', 'admin'), updateOrderStatus);

module.exports = router;
