const supabase = require('../config/supabase');
const { asyncHandler } = require('../middleware/errorHandler');

exports.getDashboard = asyncHandler(async (req, res) => {
  const [
    { count: totalUsers },
    { count: totalSellers },
    { count: totalOrders },
    { count: totalProducts },
    { data: recentOrders },
  ] = await Promise.all([
    supabase.from('users').select('id', { count: 'exact', head: true }).eq('role', 'buyer'),
    supabase.from('users').select('id', { count: 'exact', head: true }).eq('role', 'seller'),
    supabase.from('orders').select('id', { count: 'exact', head: true }),
    supabase.from('products').select('id', { count: 'exact', head: true }),
    supabase
      .from('orders')
      .select('id, order_ref, total, status, payment_status, created_at, users(name, email)')
      .order('created_at', { ascending: false })
      .limit(10),
  ]);

  const { data: revenue } = await supabase
    .from('orders')
    .select('total')
    .eq('payment_status', 'paid');

  const totalRevenue = (revenue || []).reduce((s, o) => s + o.total, 0);

  res.json({
    totalUsers,
    totalSellers,
    totalOrders,
    totalProducts,
    totalRevenue: Number(totalRevenue.toFixed(2)),
    recentOrders,
  });
});

exports.getUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, role, search } = req.query;
  const from = (page - 1) * limit;
  const to = from + Number(limit) - 1;

  let query = supabase
    .from('users')
    .select('id, name, email, role, is_active, created_at', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to);

  if (role) query = query.eq('role', role);
  if (search) query = query.ilike('email', `%${search}%`);

  const { data, error, count } = await query;
  if (error) throw error;
  res.json({ users: data, total: count });
});

exports.toggleUserStatus = asyncHandler(async (req, res) => {
  const { data: user } = await supabase
    .from('users')
    .select('is_active')
    .eq('id', req.params.id)
    .single();

  if (!user) return res.status(404).json({ message: 'User not found' });

  const { data, error } = await supabase
    .from('users')
    .update({ is_active: !user.is_active })
    .eq('id', req.params.id)
    .select('id, name, email, is_active')
    .single();

  if (error) throw error;
  res.json(data);
});

exports.getSellers = asyncHandler(async (req, res) => {
  const { data, error } = await supabase
    .from('seller_profiles')
    .select('*, users(name, email, is_active)')
    .order('created_at', { ascending: false });

  if (error) throw error;
  res.json(data);
});

exports.approveSeller = asyncHandler(async (req, res) => {
  const { data, error } = await supabase
    .from('seller_profiles')
    .update({ is_approved: true })
    .eq('id', req.params.id)
    .select()
    .single();

  if (error) throw error;
  res.json(data);
});

exports.rejectSeller = asyncHandler(async (req, res) => {
  const { data, error } = await supabase
    .from('seller_profiles')
    .update({ is_approved: false })
    .eq('id', req.params.id)
    .select()
    .single();

  if (error) throw error;
  res.json(data);
});

exports.getOrders = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status } = req.query;
  const from = (page - 1) * limit;
  const to = from + Number(limit) - 1;

  let query = supabase
    .from('orders')
    .select('*, users(name, email), order_items(quantity, price, products(name))', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to);

  if (status) query = query.eq('status', status);

  const { data, error, count } = await query;
  if (error) throw error;
  res.json({ orders: data, total: count });
});

exports.deleteProduct = asyncHandler(async (req, res) => {
  const { error } = await supabase.from('products').delete().eq('id', req.params.id);
  if (error) throw error;
  res.json({ message: 'Product removed by admin' });
});
