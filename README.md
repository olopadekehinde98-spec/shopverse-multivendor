# ShopVerse — Multi-Vendor E-Commerce Platform

ShopVerse is a full-stack multi-vendor e-commerce platform where buyers discover and purchase products from independent sellers, while sellers manage their own storefronts, inventory, and orders. Administrators oversee the entire marketplace from a dedicated control panel.

## Live Demo

> Deploy links go here after Vercel + Render deployment (see Deploy section below).

---

## Screenshots / Features

| Feature | Description |
|---|---|
| **Authentication** | Register as Buyer or Seller, JWT-secured sessions |
| **Product Listings** | Browse, search, filter by category, paginated results |
| **Seller Storefront** | Sellers add/edit/delete products with Cloudinary image upload |
| **Shopping Cart** | Persistent cart, quantity controls, real-time total |
| **Checkout** | Shipping form, choose Paystack (Nigeria) or Stripe (global) |
| **Payment** | Paystack redirect flow + Stripe card integration |
| **Order Tracking** | Step-by-step visual tracker (Pending → Confirmed → Shipped → Delivered) |
| **Seller Dashboard** | Revenue chart, order stats, product management table |
| **Admin Panel** | Manage users, approve sellers, monitor all orders |

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS, Recharts |
| **Backend** | Node.js, Express 5 |
| **Database** | PostgreSQL via Supabase |
| **Auth** | Custom JWT (bcryptjs) |
| **Payments** | Paystack + Stripe |
| **Image Upload** | Cloudinary via Multer |
| **Deploy FE** | Vercel |
| **Deploy BE** | Render |

---

## Project Structure

```
multivendor-store/
├── backend/
│   ├── src/
│   │   ├── config/          # Supabase & Cloudinary setup
│   │   ├── controllers/     # authController, productController, orderController…
│   │   ├── middleware/       # JWT auth, error handler
│   │   ├── routes/          # /auth, /products, /cart, /orders, /payments, /seller, /admin
│   │   └── server.js        # Express app entry point
│   ├── supabase_schema.sql  # Run this in Supabase SQL editor to create all tables
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/      # Navbar, ProductCard, ProtectedRoute
│   │   ├── contexts/        # AuthContext, CartContext
│   │   ├── pages/           # Home, Products, Cart, Checkout, Orders…
│   │   │   ├── seller/      # SellerDashboard, SellerProducts, ProductForm, SellerOrders
│   │   │   └── admin/       # AdminDashboard, AdminUsers, AdminSellers, AdminOrders
│   │   ├── utils/           # axios api instance
│   │   └── App.jsx          # All routes defined here
│   └── .env.example
└── package.json             # Root: `npm run dev` starts both servers
```

---

## Run Locally — Step by Step

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project (free tier)
- A [Cloudinary](https://cloudinary.com) account (free tier)
- A [Stripe](https://stripe.com) account (test mode)
- A [Paystack](https://paystack.com) account (test mode)

---

### 1. Clone the repository

```bash
git clone https://github.com/your-username/multivendor-store.git
cd multivendor-store
```

### 2. Set up the database

1. Go to your [Supabase Dashboard](https://app.supabase.com) → SQL Editor
2. Paste and run the contents of `backend/supabase_schema.sql`
3. All tables (users, seller_profiles, products, cart_items, orders, order_items) will be created

### 3. Configure the backend

```bash
cd backend
cp .env.example .env
```

Fill in your `.env`:

```env
PORT=5000
CLIENT_URL=http://localhost:5173

SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

JWT_SECRET=any_long_random_string
JWT_EXPIRES_IN=7d

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

PAYSTACK_SECRET_KEY=sk_test_...
PAYSTACK_CALLBACK_URL=http://localhost:5173/payment/verify
```

### 4. Configure the frontend

```bash
cd ../frontend
cp .env.example .env
```

Fill in:

```env
VITE_API_URL=http://localhost:5000/api
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### 5. Install all dependencies

From the **root** of the project:

```bash
npm run install:all
```

### 6. Start development servers

```bash
npm run dev
```

This starts:
- **Backend** on `http://localhost:5000`
- **Frontend** on `http://localhost:5173`

---

## Create an Admin Account

After registering normally, open your Supabase dashboard → Table Editor → `users` table → find your user → change `role` to `admin`.

---

## API Endpoints Overview

| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Register buyer or seller |
| POST | `/api/auth/login` | Public | Login, returns JWT |
| GET | `/api/auth/me` | JWT | Get current user |
| GET | `/api/products` | Public | List products (search, filter, paginate) |
| POST | `/api/products` | Seller | Create product |
| PUT | `/api/products/:id` | Seller | Update product |
| DELETE | `/api/products/:id` | Seller | Delete product |
| GET | `/api/cart` | Buyer | Get cart |
| POST | `/api/cart` | Buyer | Add item to cart |
| POST | `/api/orders` | Buyer | Place order |
| GET | `/api/orders/my` | Buyer | My orders |
| PUT | `/api/orders/:id/status` | Seller/Admin | Update order status |
| POST | `/api/payments/paystack/initialize` | Buyer | Start Paystack payment |
| GET | `/api/payments/paystack/verify` | Buyer | Verify Paystack payment |
| POST | `/api/payments/stripe/intent` | Buyer | Create Stripe PaymentIntent |
| GET | `/api/seller/dashboard` | Seller | Dashboard stats |
| GET | `/api/admin/dashboard` | Admin | Platform overview |
| GET | `/api/admin/users` | Admin | List all users |
| PATCH | `/api/admin/sellers/:id/approve` | Admin | Approve seller |

---

## Deploy

### Frontend → Vercel

1. Push to GitHub
2. Import repo at [vercel.com](https://vercel.com)
3. Set **root directory** to `frontend`
4. Add environment variables (`VITE_API_URL`, `VITE_STRIPE_PUBLISHABLE_KEY`)
5. Deploy

### Backend → Render

1. Create a new **Web Service** at [render.com](https://render.com)
2. Set **root directory** to `backend`
3. Build command: `npm install`
4. Start command: `npm start`
5. Add all backend environment variables in Render's dashboard
6. Deploy — copy the URL and update `VITE_API_URL` on Vercel

---

## License

MIT — free to use, modify, and deploy for personal or commercial projects.
