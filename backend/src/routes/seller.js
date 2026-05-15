const router = require('express').Router();
const { getDashboard, getSellerProfile, updateSellerProfile } = require('../controllers/sellerController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect, authorize('seller'));
router.get('/dashboard', getDashboard);
router.get('/profile', getSellerProfile);
router.put('/profile', updateSellerProfile);

module.exports = router;
