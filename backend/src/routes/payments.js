const router = require('express').Router();
const {
  createStripeIntent, stripeWebhook,
  initializePaystack, verifyPaystack,
} = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

router.post('/stripe/intent', protect, createStripeIntent);
router.post('/stripe/webhook', stripeWebhook);

router.post('/paystack/initialize', protect, initializePaystack);
router.get('/paystack/verify', protect, verifyPaystack);

module.exports = router;
