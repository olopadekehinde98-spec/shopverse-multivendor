import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';

const STEPS = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  processing: 'bg-purple-100 text-purple-700',
  shipped: 'bg-indigo-100 text-indigo-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/orders/${id}`).then((r) => setOrder(r.data)).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" /></div>;
  if (!order) return <div className="text-center py-24 text-gray-400">Order not found</div>;

  const stepIdx = STEPS.indexOf(order.status);
  const addr = order.shipping_address || {};

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <Link to="/orders" className="text-sm text-indigo-600 hover:underline mb-4 inline-block">← Back to Orders</Link>

      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{order.order_ref}</h1>
          <p className="text-sm text-gray-400 mt-0.5">{new Date(order.created_at).toLocaleString()}</p>
        </div>
        <span className={`text-sm px-3 py-1 rounded-full font-medium capitalize ${STATUS_COLORS[order.status]}`}>{order.status}</span>
      </div>

      {/* Tracking timeline */}
      {order.status !== 'cancelled' && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-6">
          <h2 className="font-bold text-gray-900 mb-5">Tracking</h2>
          <div className="flex items-center gap-0">
            {STEPS.map((step, i) => (
              <div key={step} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors ${i <= stepIdx ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-gray-200 text-gray-400'}`}>
                    {i < stepIdx ? '✓' : i + 1}
                  </div>
                  <span className={`text-xs mt-1.5 capitalize text-center leading-tight ${i <= stepIdx ? 'text-indigo-600 font-medium' : 'text-gray-400'}`}>{step}</span>
                </div>
                {i < STEPS.length - 1 && <div className={`flex-1 h-0.5 mb-4 mx-1 ${i < stepIdx ? 'bg-indigo-600' : 'bg-gray-200'}`} />}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Items */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-6">
        <h2 className="font-bold text-gray-900 mb-4">Items</h2>
        {order.order_items.map((item) => (
          <div key={item.id} className="flex gap-4 py-3 border-b border-gray-50 last:border-0">
            <img src={item.products?.images?.[0] || 'https://placehold.co/80x80?text=?'} alt={item.name} className="h-16 w-16 rounded-lg object-cover flex-shrink-0" />
            <div className="flex-1">
              <p className="font-medium text-gray-900">{item.name}</p>
              <p className="text-xs text-gray-400 mt-0.5">{item.products?.seller_profiles?.store_name}</p>
            </div>
            <div className="text-right">
              <p className="font-semibold text-gray-900">${(item.quantity * item.price).toFixed(2)}</p>
              <p className="text-xs text-gray-400">×{item.quantity} @ ${Number(item.price).toFixed(2)}</p>
            </div>
          </div>
        ))}
        <div className="flex justify-between font-bold text-gray-900 mt-4 pt-4 border-t border-gray-100">
          <span>Total</span>
          <span>${Number(order.total).toFixed(2)}</span>
        </div>
      </div>

      {/* Shipping */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h2 className="font-bold text-gray-900 mb-3">Shipping Address</h2>
        <p className="text-sm text-gray-600">{addr.street}, {addr.city}, {addr.state} {addr.zip}, {addr.country}</p>
        <div className="mt-4 flex gap-4 text-sm">
          <div>
            <span className="text-gray-400">Payment</span>
            <p className="font-medium capitalize text-gray-800 mt-0.5">{order.payment_method} — <span className={order.payment_status === 'paid' ? 'text-green-600' : 'text-red-500'}>{order.payment_status}</span></p>
          </div>
        </div>
      </div>
    </div>
  );
}
