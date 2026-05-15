const supabase = require('../config/supabase');
const { asyncHandler } = require('../middleware/errorHandler');

exports.getDashboard = asyncHandler(async (req, res) => {
  const { data: profile } = await supabase
    .from('seller_profiles')
    .select('id')
    .eq('user_id', req.user.id)
    .single();

  if (!profile) return res.status(404).json({ message: 'Seller profile not found' });

  const { data: orderItems } = await supabase
    .from('order_items')
    .select('quantity, price, orders(status, payment_status, created_at)')
    .eq('seller_id', profile.id);

  const totalRevenue = orderItems
    .filter((i) => i.orders?.payment_status === 'paid')
    .reduce((sum, i) => sum + i.quantity * i.price, 0);

  const totalOrders = orderItems.length;

  const { count: totalProducts } = await supabase
    .from('products')
    .select('id', { count: 'exact', head: true })
    .eq('seller_id', profile.id);

  const pending = orderItems.filter((i) => i.orders?.status === 'pending').length;
  const shipped = orderItems.filter((i) => i.orders?.status === 'shipped').length;
  const delivered = orderItems.filter((i) => i.orders?.status === 'delivered').length;

  // Monthly earnings for chart (last 6 months)
  const monthly = {};
  orderItems
    .filter((i) => i.orders?.payment_status === 'paid')
    .forEach((i) => {
      const month = new Date(i.orders.created_at).toLocaleString('default', { month: 'short', year: '2-digit' });
      monthly[month] = (monthly[month] || 0) + i.quantity * i.price;
    });

  res.json({
    totalRevenue: Number(totalRevenue.toFixed(2)),
    totalOrders,
    totalProducts,
    pending,
    shipped,
    delivered,
    monthlyEarnings: monthly,
  });
});

exports.getSellerProfile = asyncHandler(async (req, res) => {
  const { data, error } = await supabase
    .from('seller_profiles')
    .select('*, users(name, email, avatar_url)')
    .eq('user_id', req.user.id)
    .single();

  if (error || !data) return res.status(404).json({ message: 'Profile not found' });
  res.json(data);
});

exports.updateSellerProfile = asyncHandler(async (req, res) => {
  const { store_name, bio, logo_url, banner_url } = req.body;
  const updates = {};
  if (store_name) updates.store_name = store_name;
  if (bio !== undefined) updates.bio = bio;
  if (logo_url) updates.logo_url = logo_url;
  if (banner_url) updates.banner_url = banner_url;

  const { data, error } = await supabase
    .from('seller_profiles')
    .update(updates)
    .eq('user_id', req.user.id)
    .select()
    .single();

  if (error) throw error;
  res.json(data);
});
