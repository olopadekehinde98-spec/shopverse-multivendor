const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const https = require('https');
const supabase = require('../config/supabase');
const { asyncHandler } = require('../middleware/errorHandler');

// ─── Stripe ─────────────────────────────────────────────────────────────────

exports.createStripeIntent = asyncHandler(async (req, res) => {
  const { order_id } = req.body;

  const { data: order } = await supabase
    .from('orders')
    .select('id, total, order_ref, user_id')
    .eq('id', order_id)
    .eq('user_id', req.user.id)
    .single();

  if (!order) return res.status(404).json({ message: 'Order not found' });

  const intent = await stripe.paymentIntents.create({
    amount: Math.round(order.total * 100),
    currency: 'usd',
    metadata: { order_id: order.id, order_ref: order.order_ref },
  });

  res.json({ clientSecret: intent.client_secret });
});

exports.stripeWebhook = asyncHandler(async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.rawBody || req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch {
    return res.status(400).json({ message: 'Webhook signature invalid' });
  }

  if (event.type === 'payment_intent.succeeded') {
    const { order_id } = event.data.object.metadata;
    await supabase
      .from('orders')
      .update({ payment_status: 'paid', status: 'confirmed' })
      .eq('id', order_id);
  }

  res.json({ received: true });
});

// ─── Paystack ────────────────────────────────────────────────────────────────

exports.initializePaystack = asyncHandler(async (req, res) => {
  const { order_id } = req.body;

  const { data: order } = await supabase
    .from('orders')
    .select('id, total, order_ref, users(email)')
    .eq('id', order_id)
    .eq('user_id', req.user.id)
    .single();

  if (!order) return res.status(404).json({ message: 'Order not found' });

  const params = JSON.stringify({
    email: order.users.email,
    amount: Math.round(order.total * 100),
    reference: `PAY-${order.order_ref}-${Date.now()}`,
    metadata: { order_id: order.id, order_ref: order.order_ref },
    callback_url: `${process.env.CLIENT_URL}/payment/verify`,
  });

  const options = {
    hostname: 'api.paystack.co',
    port: 443,
    path: '/transaction/initialize',
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
  };

  const paystackReq = https.request(options, (paystackRes) => {
    let data = '';
    paystackRes.on('data', (chunk) => { data += chunk; });
    paystackRes.on('end', () => {
      const parsed = JSON.parse(data);
      if (!parsed.status) return res.status(400).json({ message: parsed.message });
      res.json({
        authorization_url: parsed.data.authorization_url,
        reference: parsed.data.reference,
      });
    });
  });

  paystackReq.on('error', (err) => res.status(500).json({ message: err.message }));
  paystackReq.write(params);
  paystackReq.end();
});

exports.verifyPaystack = asyncHandler(async (req, res) => {
  const { reference } = req.query;

  const options = {
    hostname: 'api.paystack.co',
    port: 443,
    path: `/transaction/verify/${encodeURIComponent(reference)}`,
    method: 'GET',
    headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` },
  };

  https.request(options, (paystackRes) => {
    let data = '';
    paystackRes.on('data', (chunk) => { data += chunk; });
    paystackRes.on('end', async () => {
      const parsed = JSON.parse(data);
      if (!parsed.status || parsed.data.status !== 'success') {
        return res.status(400).json({ message: 'Payment verification failed' });
      }
      const { order_id } = parsed.data.metadata;
      await supabase
        .from('orders')
        .update({ payment_status: 'paid', status: 'confirmed' })
        .eq('id', order_id);

      res.json({ message: 'Payment verified', order_id });
    });
  }).end();
});
