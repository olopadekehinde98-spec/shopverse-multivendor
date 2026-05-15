const bcrypt = require('bcryptjs');
const supabase = require('../config/supabase');
const generateToken = require('../utils/generateToken');
const { asyncHandler } = require('../middleware/errorHandler');

exports.register = asyncHandler(async (req, res) => {
  const { name, email, password, role = 'buyer' } = req.body;

  if (!['buyer', 'seller'].includes(role)) {
    return res.status(400).json({ message: 'Invalid role' });
  }

  const { data: existing } = await supabase
    .from('users')
    .select('id')
    .eq('email', email)
    .single();

  if (existing) return res.status(409).json({ message: 'Email already registered' });

  const passwordHash = await bcrypt.hash(password, 12);

  const { data: user, error } = await supabase
    .from('users')
    .insert({ name, email, password_hash: passwordHash, role, is_active: true })
    .select('id, name, email, role')
    .single();

  if (error) throw error;

  if (role === 'seller') {
    await supabase.from('seller_profiles').insert({
      user_id: user.id,
      store_name: `${name}'s Store`,
      is_approved: false,
    });
  }

  res.status(201).json({
    user,
    token: generateToken(user.id, user.role),
  });
});

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const { data: user } = await supabase
    .from('users')
    .select('id, name, email, role, password_hash, is_active')
    .eq('email', email)
    .single();

  if (!user) return res.status(401).json({ message: 'Invalid credentials' });
  if (!user.is_active) return res.status(403).json({ message: 'Account suspended' });

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) return res.status(401).json({ message: 'Invalid credentials' });

  const { password_hash, ...safeUser } = user;

  res.json({
    user: safeUser,
    token: generateToken(user.id, user.role),
  });
});

exports.getMe = asyncHandler(async (req, res) => {
  const { data: user } = await supabase
    .from('users')
    .select('id, name, email, role, avatar_url, created_at')
    .eq('id', req.user.id)
    .single();

  if (user.role === 'seller') {
    const { data: profile } = await supabase
      .from('seller_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();
    return res.json({ ...user, seller_profile: profile });
  }

  res.json(user);
});

exports.updateProfile = asyncHandler(async (req, res) => {
  const { name, avatar_url } = req.body;
  const updates = {};
  if (name) updates.name = name;
  if (avatar_url) updates.avatar_url = avatar_url;

  const { data: user, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', req.user.id)
    .select('id, name, email, role, avatar_url')
    .single();

  if (error) throw error;
  res.json(user);
});
