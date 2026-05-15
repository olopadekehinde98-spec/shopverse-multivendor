import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { UsersIcon, ShoppingBagIcon, CurrencyDollarIcon, ArchiveBoxIcon } from '@heroicons/react/24/outline';

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  processing: 'bg-purple-100 text-purple-700',
  shipped: 'bg-indigo-100 text-indigo-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/dashboard').then((r) => setStats(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" /></div>;

  const cards = [
    { label: 'Total Revenue', value: `$${stats?.totalRevenue?.toFixed(2) || '0'}`, icon: CurrencyDollarIcon, color: 'text-green-600 bg-green-50' },
    { label: 'Total Users', value: stats?.totalUsers || 0, icon: UsersIcon, color: 'text-blue-600 bg-blue-50' },
    { label: 'Active Sellers', value: stats?.totalSellers || 0, icon: ArchiveBoxIcon, color: 'text-purple-600 bg-purple-50' },
    { label: 'Total Orders', value: stats?.totalOrders || 0, icon: ShoppingBagIcon, color: 'text-indigo-600 bg-indigo-50' },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {cards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex gap-4 items-center">
            <div className={`p-3 rounded-xl ${color}`}><Icon className="h-6 w-6" /></div>
            <div>
              <p className="text-sm text-gray-500">{label}</p>
              <p className="text-2xl font-bold text-gray-900 mt-0.5">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick nav */}
      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        {[
          { to: '/admin/users', label: 'Manage Users', desc: 'View, suspend or activate accounts' },
          { to: '/admin/sellers', label: 'Approve Sellers', desc: 'Review and approve seller applications' },
          { to: '/admin/orders', label: 'All Orders', desc: 'Monitor platform-wide orders' },
        ].map((l) => (
          <Link key={l.to} to={l.to} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow">
            <p className="font-semibold text-gray-900">{l.label}</p>
            <p className="text-sm text-gray-500 mt-1">{l.desc}</p>
          </Link>
        ))}
      </div>

      {/* Recent orders */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between">
          <h2 className="font-bold text-gray-900">Recent Orders</h2>
          <Link to="/admin/orders" className="text-sm text-indigo-600 hover:underline">View all</Link>
        </div>
        <table className="min-w-full divide-y divide-gray-50">
          <thead><tr className="bg-gray-50">
            {['Ref', 'Customer', 'Total', 'Status', 'Date'].map((h) => (
              <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
            ))}
          </tr></thead>
          <tbody className="divide-y divide-gray-50">
            {(stats?.recentOrders || []).map((o) => (
              <tr key={o.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-semibold text-gray-900">{o.order_ref}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{o.users?.name}</td>
                <td className="px-4 py-3 text-sm font-semibold text-gray-900">${Number(o.total).toFixed(2)}</td>
                <td className="px-4 py-3"><span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${STATUS_COLORS[o.status]}`}>{o.status}</span></td>
                <td className="px-4 py-3 text-sm text-gray-400">{new Date(o.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
