const supabase = require('../config/supabase');
const { asyncHandler } = require('../middleware/errorHandler');

exports.getCart = asyncHandler(async (req, res) => {
  const { data, error } = await supabase
    .from('cart_items')
    .select('*, products(id, name, price, images, stock, seller_id, seller_profiles(store_name))')
    .eq('user_id', req.user.id);

  if (error) throw error;

  const total = data.reduce((sum, item) => sum + item.quantity * item.products.price, 0);
  res.json({ items: data, total: Number(total.toFixed(2)) });
});

exports.addToCart = asyncHandler(async (req, res) => {
  const { product_id, quantity = 1 } = req.body;

  const { data: product } = await supabase
    .from('products')
    .select('id, stock, is_active')
    .eq('id', product_id)
    .single();

  if (!product || !product.is_active) return res.status(404).json({ message: 'Product not found' });
  if (product.stock < quantity) return res.status(400).json({ message: 'Insufficient stock' });

  const { data: existing } = await supabase
    .from('cart_items')
    .select('id, quantity')
    .eq('user_id', req.user.id)
    .eq('product_id', product_id)
    .single();

  if (existing) {
    const newQty = existing.quantity + Number(quantity);
    if (newQty > product.stock) return res.status(400).json({ message: 'Not enough stock' });

    const { data, error } = await supabase
      .from('cart_items')
      .update({ quantity: newQty })
      .eq('id', existing.id)
      .select()
      .single();

    if (error) throw error;
    return res.json(data);
  }

  const { data, error } = await supabase
    .from('cart_items')
    .insert({ user_id: req.user.id, product_id, quantity: Number(quantity) })
    .select()
    .single();

  if (error) throw error;
  res.status(201).json(data);
});

exports.updateCartItem = asyncHandler(async (req, res) => {
  const { quantity } = req.body;

  const { data: item } = await supabase
    .from('cart_items')
    .select('*, products(stock)')
    .eq('id', req.params.id)
    .eq('user_id', req.user.id)
    .single();

  if (!item) return res.status(404).json({ message: 'Cart item not found' });
  if (quantity > item.products.stock) return res.status(400).json({ message: 'Not enough stock' });

  const { data, error } = await supabase
    .from('cart_items')
    .update({ quantity })
    .eq('id', req.params.id)
    .select()
    .single();

  if (error) throw error;
  res.json(data);
});

exports.removeFromCart = asyncHandler(async (req, res) => {
  const { error } = await supabase
    .from('cart_items')
    .delete()
    .eq('id', req.params.id)
    .eq('user_id', req.user.id);

  if (error) throw error;
  res.json({ message: 'Item removed from cart' });
});

exports.clearCart = asyncHandler(async (req, res) => {
  const { error } = await supabase
    .from('cart_items')
    .delete()
    .eq('user_id', req.user.id);

  if (error) throw error;
  res.json({ message: 'Cart cleared' });
});
