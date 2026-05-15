import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { ShoppingBagIcon, CurrencyDollarIcon, ArchiveBoxIcon, ClockIcon } from '@heroicons/react/24/outline';

export default function SellerDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/seller/dashboard').then((r) => setStats(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" /></div>;

  const chartData = stats?.monthlyEarnings
    ? Object.entries(stats.monthlyEarnings).map(([month, revenue]) => ({ month, revenue }))
    : [];

  const cards = [
    { label: 'Total Revenue', value: `$${stats?.totalRevenue?.toFixed(2) || '0.00'}`, icon: CurrencyDollarIcon, color: 'text-green-600 bg-green-50' },
    { label: 'Total Orders', value: stats?.totalOrders || 0, icon: ShoppingBagIcon, color: 'text-blue-600 bg-blue-50' },
    { label: 'Products Listed', value: stats?.totalProducts || 0, icon: ArchiveBoxIcon, color: 'text-purple-600 bg-purple-50' },
    { label: 'Pending Orders', value: stats?.pending || 0, icon: ClockIcon, color: 'text-yellow-600 bg-yellow-50' },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Seller Dashboard</h1>
        <Link to="/seller/products/new" className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700">
          + Add Product
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {cards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex gap-4 items-center">
            <div className={`p-3 rounded-xl ${color}`}>
              <Icon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{label}</p>
              <p className="text-2xl font-bold text-gray-900 mt-0.5">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Chart */}
      {chartData.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-8">
          <h2 className="font-bold text-gray-900 mb-5">Monthly Earnings</h2>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `$${v}`} />
              <Tooltip formatter={(v) => [`$${v.toFixed(2)}`, 'Revenue']} />
              <Bar dataKey="revenue" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Quick links */}
      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { to: '/seller/products', label: 'Manage Products', desc: 'View, edit or remove your listings' },
          { to: '/seller/orders', label: 'View Orders', desc: 'Track and fulfill customer orders' },
          { to: '/seller/profile', label: 'Store Profile', desc: 'Update your store info & branding' },
        ].map((l) => (
          <Link key={l.to} to={l.to} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow">
            <p className="font-semibold text-gray-900">{l.label}</p>
            <p className="text-sm text-gray-500 mt-1">{l.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
