import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function Checkout() {
  const { cart } = useCart();
  const navigate = useNavigate();
  const [payMethod, setPayMethod] = useState('paystack');
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState({ street: '', city: '', state: '', zip: '', country: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!cart.items.length) { toast.error('Cart is empty'); return; }
    setLoading(true);
    try {
      const { data: order } = await api.post('/orders', {
        shipping_address: address,
        payment_method: payMethod,
      });

      if (payMethod === 'paystack') {
        const { data } = await api.post('/payments/paystack/initialize', { order_id: order.id });
        window.location.href = data.authorization_url;
      } else {
        navigate(`/payment/stripe/${order.id}`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Checkout failed');
    } finally {
      setLoading(false);
    }
  };

  const field = (label, key, type = 'text', placeholder = '') => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type={type} required placeholder={placeholder}
        value={address[key]}
        onChange={(e) => setAddress({ ...address, [key]: e.target.value })}
        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Checkout</h1>

      <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Shipping */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-bold text-gray-900 mb-4">Shipping Address</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {field('Street Address', 'street', 'text', '123 Main St')}
              {field('City', 'city', 'text', 'Lagos')}
              {field('State / Province', 'state', 'text', 'Lagos State')}
              {field('ZIP / Postal Code', 'zip', 'text', '100001')}
              {field('Country', 'country', 'text', 'Nigeria')}
            </div>
          </div>

          {/* Payment method */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-bold text-gray-900 mb-4">Payment Method</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { id: 'paystack', label: '🇳🇬 Paystack', desc: 'Cards, Bank Transfer, USSD' },
                { id: 'stripe', label: '🌍 Stripe', desc: 'International Cards' },
              ].map((m) => (
                <label
                  key={m.id}
                  className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-colors ${payMethod === m.id ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-gray-300'}`}
                >
                  <input type="radio" name="payment" value={m.id} checked={payMethod === m.id} onChange={() => setPayMethod(m.id)} className="mt-0.5" />
                  <div>
                    <p className="font-semibold text-sm">{m.label}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{m.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 h-fit">
          <h2 className="font-bold text-gray-900 mb-4">Order Summary</h2>
          {cart.items.map((item) => (
            <div key={item.id} className="flex justify-between text-sm text-gray-600 mb-2">
              <span className="truncate pr-2">{item.products.name} ×{item.quantity}</span>
              <span>${(item.quantity * item.products.price).toFixed(2)}</span>
            </div>
          ))}
          <div className="border-t mt-4 pt-4 flex justify-between font-bold text-gray-900 text-base">
            <span>Total</span>
            <span>${cart.total.toFixed(2)}</span>
          </div>
          <button
            type="submit" disabled={loading}
            className="w-full mt-6 bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-60 transition-colors"
          >
            {loading ? 'Processing…' : `Pay $${cart.total.toFixed(2)}`}
          </button>
        </div>
      </form>
    </div>
  );
}
