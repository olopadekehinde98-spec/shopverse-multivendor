const { v4: uuidv4 } = require('uuid');
const supabase = require('../config/supabase');
const { asyncHandler } = require('../middleware/errorHandler');

exports.createOrder = asyncHandler(async (req, res) => {
  const { shipping_address, payment_method } = req.body;

  const { data: cartItems } = await supabase
    .from('cart_items')
    .select('*, products(id, name, price, stock, seller_id)')
    .eq('user_id', req.user.id);

  if (!cartItems || cartItems.length === 0) {
    return res.status(400).json({ message: 'Cart is empty' });
  }

  for (const item of cartItems) {
    if (item.quantity > item.products.stock) {
      return res.status(400).json({
        message: `Insufficient stock for ${item.products.name}`,
      });
    }
  }

  const total = cartItems.reduce((sum, item) => sum + item.quantity * item.products.price, 0);
  const orderRef = `ORD-${uuidv4().slice(0, 8).toUpperCase()}`;

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      user_id: req.user.id,
      order_ref: orderRef,
      total: Number(total.toFixed(2)),
      shipping_address,
      payment_method,
      status: 'pending',
      payment_status: 'unpaid',
    })
    .select()
    .single();

  if (orderError) throw orderError;

  const orderItems = cartItems.map((item) => ({
    order_id: order.id,
    product_id: item.product_id,
    seller_id: item.products.seller_id,
    quantity: item.quantity,
    price: item.products.price,
    name: item.products.name,
  }));

  const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
  if (itemsError) throw itemsError;

  for (const item of cartItems) {
    await supabase
      .from('products')
      .update({ stock: item.products.stock - item.quantity })
      .eq('id', item.product_id);
  }

  await supabase.from('cart_items').delete().eq('user_id', req.user.id);

  res.status(201).json(order);
});

exports.getMyOrders = asyncHandler(async (req, res) => {
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*, products(name, images))')
    .eq('user_id', req.user.id)
    .order('created_at', { ascending: false });

  if (error) throw error;
  res.json(data);
});

exports.getOrder = asyncHandler(async (req, res) => {
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*, products(name, images, seller_profiles(store_name)))')
    .eq('id', req.params.id)
    .eq('user_id', req.user.id)
    .single();

  if (error || !data) return res.status(404).json({ message: 'Order not found' });
  res.json(data);
});

exports.getSellerOrders = asyncHandler(async (req, res) => {
  const { data: profile } = await supabase
    .from('seller_profiles')
    .select('id')
    .eq('user_id', req.user.id)
    .single();

  const { data, error } = await supabase
    .from('order_items')
    .select('*, orders(id, order_ref, status, created_at, shipping_address, users(name, email))')
    .eq('seller_id', profile.id)
    .order('created_at', { ascending: false });

  if (error) throw error;
  res.json(data);
});

exports.updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  const { data, error } = await supabase
    .from('orders')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', req.params.id)
    .select()
    .single();

  if (error) throw error;
  res.json(data);
});

exports.getAllOrders = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const from = (page - 1) * limit;
  const to = from + Number(limit) - 1;

  const { data, error, count } = await supabase
    .from('orders')
    .select('*, users(name, email), order_items(quantity, price)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) throw error;
  res.json({ orders: data, total: count });
});
