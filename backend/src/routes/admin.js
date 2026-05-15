const router = require('express').Router();
const {
  getDashboard, getUsers, toggleUserStatus,
  getSellers, approveSeller, rejectSeller,
  getOrders, deleteProduct,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect, authorize('admin'));
router.get('/dashboard', getDashboard);
router.get('/users', getUsers);
router.patch('/users/:id/toggle', toggleUserStatus);
router.get('/sellers', getSellers);
router.patch('/sellers/:id/approve', approveSeller);
router.patch('/sellers/:id/reject', rejectSeller);
router.get('/orders', getOrders);
router.delete('/products/:id', deleteProduct);

module.exports = router;
