import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  processing: 'bg-purple-100 text-purple-700',
  shipped: 'bg-indigo-100 text-indigo-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/orders/my').then((r) => setOrders(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" /></div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">My Orders</h1>

      {orders.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">📦</p>
          <p className="text-lg">No orders yet</p>
          <Link to="/products" className="mt-4 inline-block text-indigo-600 hover:underline">Start shopping</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Link to={`/orders/${order.id}`} key={order.id} className="block bg-white rounded-xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold text-gray-900">{order.order_ref}</p>
                  <p className="text-sm text-gray-400 mt-0.5">{new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">${Number(order.total).toFixed(2)}</p>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium mt-1 inline-block capitalize ${STATUS_COLORS[order.status]}`}>
                    {order.status}
                  </span>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {order.order_items?.slice(0, 3).map((item) => (
                  <span key={item.id} className="text-xs bg-gray-50 text-gray-600 px-2 py-1 rounded-md">{item.products?.name} ×{item.quantity}</span>
                ))}
                {order.order_items?.length > 3 && <span className="text-xs text-gray-400">+{order.order_items.length - 3} more</span>}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
