import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { TrashIcon, MinusIcon, PlusIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function Cart() {
  const { cart, loading, updateItem, removeItem } = useCart();
  const navigate = useNavigate();

  if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" /></div>;

  if (!cart.items.length) return (
    <div className="max-w-2xl mx-auto px-4 py-24 text-center">
      <p className="text-5xl mb-4">🛒</p>
      <h2 className="text-xl font-bold text-gray-800 mb-2">Your cart is empty</h2>
      <p className="text-gray-500 mb-6">Browse our products and find something you love.</p>
      <Link to="/products" className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-indigo-700">
        Shop Now
      </Link>
    </div>
  );

  const handleQty = async (item, delta) => {
    const newQty = item.quantity + delta;
    if (newQty < 1) return;
    try { await updateItem(item.id, newQty); } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };

  const handleRemove = async (id) => {
    try { await removeItem(id); toast.success('Item removed'); } catch { toast.error('Error removing item'); }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Shopping Cart ({cart.items.length} items)</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {cart.items.map((item) => {
            const p = item.products;
            const image = p.images?.[0] || 'https://placehold.co/100x100?text=?';
            return (
              <div key={item.id} className="flex gap-4 bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                <img src={image} alt={p.name} className="h-24 w-24 object-cover rounded-lg flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <Link to={`/products/${p.id}`} className="font-semibold text-gray-900 hover:text-indigo-600 truncate block">{p.name}</Link>
                  <p className="text-xs text-indigo-600 mt-0.5">{p.seller_profiles?.store_name}</p>
                  <p className="text-base font-bold text-gray-900 mt-2">${Number(p.price).toFixed(2)}</p>
                </div>
                <div className="flex flex-col items-end justify-between">
                  <button onClick={() => handleRemove(item.id)} className="text-gray-400 hover:text-red-500">
                    <TrashIcon className="h-5 w-5" />
                  </button>
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleQty(item, -1)} className="p-1 rounded border border-gray-200 hover:bg-gray-50">
                      <MinusIcon className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                    <button onClick={() => handleQty(item, 1)} disabled={item.quantity >= p.stock} className="p-1 rounded border border-gray-200 hover:bg-gray-50 disabled:opacity-40">
                      <PlusIcon className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Order summary */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 h-fit">
          <h2 className="font-bold text-gray-900 text-lg mb-4">Order Summary</h2>
          {cart.items.map((item) => (
            <div key={item.id} className="flex justify-between text-sm text-gray-600 mb-2">
              <span className="truncate pr-2">{item.products.name} ×{item.quantity}</span>
              <span className="flex-shrink-0">${(item.quantity * item.products.price).toFixed(2)}</span>
            </div>
          ))}
          <div className="border-t border-gray-100 mt-4 pt-4 flex justify-between font-bold text-gray-900">
            <span>Total</span>
            <span>${cart.total.toFixed(2)}</span>
          </div>
          <button
            onClick={() => navigate('/checkout')}
            className="w-full mt-6 bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
          >
            Proceed to Checkout
          </button>
          <Link to="/products" className="block text-center mt-3 text-sm text-indigo-600 hover:underline">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
