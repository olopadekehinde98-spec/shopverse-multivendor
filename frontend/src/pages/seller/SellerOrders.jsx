import { useState, useEffect } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  processing: 'bg-purple-100 text-purple-700',
  shipped: 'bg-indigo-100 text-indigo-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

const NEXT_STATUS = { pending: 'confirmed', confirmed: 'processing', processing: 'shipped', shipped: 'delivered' };

export default function SellerOrders() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/orders/seller').then((r) => setItems(r.data)).finally(() => setLoading(false));
  }, []);

  const handleAdvance = async (orderId, currentStatus) => {
    const next = NEXT_STATUS[currentStatus];
    if (!next) return;
    try {
      await api.put(`/orders/${orderId}/status`, { status: next });
      setItems((prev) => prev.map((i) =>
        i.orders?.id === orderId ? { ...i, orders: { ...i.orders, status: next } } : i
      ));
      toast.success(`Order marked as ${next}`);
    } catch { toast.error('Failed to update status'); }
  };

  if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" /></div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">My Orders ({items.length})</h1>

      {items.length === 0 ? (
        <div className="text-center py-24 text-gray-400"><p className="text-4xl mb-3">📭</p><p>No orders yet</p></div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-gray-100">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Order</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Customer</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Product</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Amount</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {items.map((item) => {
                const order = item.orders || {};
                const next = NEXT_STATUS[order.status];
                return (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="text-sm font-semibold text-gray-900">{order.order_ref}</p>
                      <p className="text-xs text-gray-400">{new Date(order.created_at).toLocaleDateString()}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-gray-900">{order.users?.name}</p>
                      <p className="text-xs text-gray-400">{order.users?.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-gray-700">{item.name}</p>
                      <p className="text-xs text-gray-400">×{item.quantity}</p>
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900">${(item.quantity * item.price).toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${STATUS_COLORS[order.status]}`}>{order.status}</span>
                    </td>
                    <td className="px-4 py-3">
                      {next && (
                        <button
                          onClick={() => handleAdvance(order.id, order.status)}
                          className="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded-md hover:bg-indigo-700 capitalize"
                        >
                          Mark {next}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
