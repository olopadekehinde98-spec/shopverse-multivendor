-- ─── Users ───────────────────────────────────────────────────────────────────
create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text unique not null,
  password_hash text not null,
  role text not null check (role in ('buyer','seller','admin')) default 'buyer',
  avatar_url text,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- ─── Seller Profiles ─────────────────────────────────────────────────────────
create table if not exists seller_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade unique,
  store_name text not null,
  bio text,
  logo_url text,
  banner_url text,
  is_approved boolean default false,
  created_at timestamptz default now()
);

-- ─── Products ─────────────────────────────────────────────────────────────────
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid references seller_profiles(id) on delete cascade,
  name text not null,
  description text,
  price numeric(12,2) not null check (price >= 0),
  category text,
  stock integer not null default 0 check (stock >= 0),
  images text[] default '{}',
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ─── Cart Items ───────────────────────────────────────────────────────────────
create table if not exists cart_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  product_id uuid references products(id) on delete cascade,
  quantity integer not null default 1 check (quantity > 0),
  created_at timestamptz default now(),
  unique(user_id, product_id)
);

-- ─── Orders ───────────────────────────────────────────────────────────────────
create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete set null,
  order_ref text unique not null,
  total numeric(12,2) not null,
  status text not null default 'pending'
    check (status in ('pending','confirmed','processing','shipped','delivered','cancelled')),
  payment_status text not null default 'unpaid' check (payment_status in ('unpaid','paid','refunded')),
  payment_method text check (payment_method in ('stripe','paystack')),
  shipping_address jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ─── Order Items ─────────────────────────────────────────────────────────────
create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id) on delete cascade,
  product_id uuid references products(id) on delete set null,
  seller_id uuid references seller_profiles(id) on delete set null,
  name text not null,
  quantity integer not null,
  price numeric(12,2) not null,
  created_at timestamptz default now()
);

-- ─── Indexes ─────────────────────────────────────────────────────────────────
create index if not exists idx_products_seller on products(seller_id);
create index if not exists idx_products_category on products(category);
create index if not exists idx_cart_user on cart_items(user_id);
create index if not exists idx_orders_user on orders(user_id);
create index if not exists idx_order_items_order on order_items(order_id);
create index if not exists idx_order_items_seller on order_items(seller_id);

-- ─── RLS (disable for service-role key usage) ────────────────────────────────
alter table users disable row level security;
alter table seller_profiles disable row level security;
alter table products disable row level security;
alter table cart_items disable row level security;
alter table orders disable row level security;
alter table order_items disable row level security;
