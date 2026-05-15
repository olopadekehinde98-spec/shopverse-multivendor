const supabase = require('../config/supabase');
const { asyncHandler } = require('../middleware/errorHandler');

exports.getProducts = asyncHandler(async (req, res) => {
  const { category, search, seller_id, page = 1, limit = 20, sort = 'created_at' } = req.query;
  const from = (page - 1) * limit;
  const to = from + Number(limit) - 1;

  let query = supabase
    .from('products')
    .select('*, seller_profiles(store_name, user_id)', { count: 'exact' })
    .eq('is_active', true)
    .range(from, to);

  if (category) query = query.eq('category', category);
  if (seller_id) query = query.eq('seller_id', seller_id);
  if (search) query = query.ilike('name', `%${search}%`);
  if (sort === 'price_asc') query = query.order('price', { ascending: true });
  else if (sort === 'price_desc') query = query.order('price', { ascending: false });
  else query = query.order('created_at', { ascending: false });

  const { data, error, count } = await query;
  if (error) throw error;

  res.json({ products: data, total: count, page: Number(page), limit: Number(limit) });
});

exports.getProduct = asyncHandler(async (req, res) => {
  const { data, error } = await supabase
    .from('products')
    .select('*, seller_profiles(store_name, user_id, bio)')
    .eq('id', req.params.id)
    .single();

  if (error || !data) return res.status(404).json({ message: 'Product not found' });
  res.json(data);
});

exports.createProduct = asyncHandler(async (req, res) => {
  const { name, description, price, category, stock, images } = req.body;

  const { data: profile } = await supabase
    .from('seller_profiles')
    .select('id, is_approved')
    .eq('user_id', req.user.id)
    .single();

  if (!profile) return res.status(400).json({ message: 'Seller profile not found' });
  if (!profile.is_approved) return res.status(403).json({ message: 'Seller account not yet approved' });

  const { data, error } = await supabase
    .from('products')
    .insert({
      seller_id: profile.id,
      name,
      description,
      price: Number(price),
      category,
      stock: Number(stock),
      images: images || [],
      is_active: true,
    })
    .select()
    .single();

  if (error) throw error;
  res.status(201).json(data);
});

exports.updateProduct = asyncHandler(async (req, res) => {
  const { data: profile } = await supabase
    .from('seller_profiles')
    .select('id')
    .eq('user_id', req.user.id)
    .single();

  const { data: product } = await supabase
    .from('products')
    .select('id')
    .eq('id', req.params.id)
    .eq('seller_id', profile.id)
    .single();

  if (!product) return res.status(404).json({ message: 'Product not found or unauthorized' });

  const { name, description, price, category, stock, images, is_active } = req.body;
  const updates = {};
  if (name !== undefined) updates.name = name;
  if (description !== undefined) updates.description = description;
  if (price !== undefined) updates.price = Number(price);
  if (category !== undefined) updates.category = category;
  if (stock !== undefined) updates.stock = Number(stock);
  if (images !== undefined) updates.images = images;
  if (is_active !== undefined) updates.is_active = is_active;

  const { data, error } = await supabase
    .from('products')
    .update(updates)
    .eq('id', req.params.id)
    .select()
    .single();

  if (error) throw error;
  res.json(data);
});

exports.deleteProduct = asyncHandler(async (req, res) => {
  const { data: profile } = await supabase
    .from('seller_profiles')
    .select('id')
    .eq('user_id', req.user.id)
    .single();

  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', req.params.id)
    .eq('seller_id', profile.id);

  if (error) throw error;
  res.json({ message: 'Product deleted' });
});

exports.uploadProductImage = asyncHandler(async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No image uploaded' });
  res.json({ url: req.file.path, public_id: req.file.filename });
});

exports.getSellerProducts = asyncHandler(async (req, res) => {
  const { data: profile } = await supabase
    .from('seller_profiles')
    .select('id')
    .eq('user_id', req.user.id)
    .single();

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('seller_id', profile.id)
    .order('created_at', { ascending: false });

  if (error) throw error;
  res.json(data);
});

exports.getCategories = asyncHandler(async (req, res) => {
  const { data, error } = await supabase
    .from('products')
    .select('category')
    .eq('is_active', true);

  if (error) throw error;
  const categories = [...new Set(data.map((p) => p.category))].filter(Boolean);
  res.json(categories);
});
