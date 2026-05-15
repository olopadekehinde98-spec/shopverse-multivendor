import { Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { user } = useAuth();

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!user) { toast.error('Please login to add to cart'); return; }
    try {
      await addToCart(product.id, 1);
      toast.success('Added to cart!');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Could not add to cart');
    }
  };

  const image = product.images?.[0] || 'https://placehold.co/400x400/e0e7ff/6366f1?text=No+Image';

  return (
    <Link
      to={`/products/${product.id}`}
      className="group bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden border border-gray-100"
    >
      <div className="aspect-square overflow-hidden bg-gray-50">
        <img
          src={image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => { e.target.src = 'https://placehold.co/400x400/e0e7ff/6366f1?text=No+Image'; }}
        />
      </div>
      <div className="p-4">
        {product.seller_profiles?.store_name && (
          <p className="text-xs text-indigo-600 font-medium mb-1 truncate">{product.seller_profiles.store_name}</p>
        )}
        <h3 className="text-sm font-semibold text-gray-800 truncate">{product.name}</h3>
        <p className="text-xs text-gray-400 capitalize mt-0.5">{product.category}</p>
        <div className="flex items-center justify-between mt-3 gap-2">
          <span className="text-base font-bold text-gray-900">${Number(product.price).toFixed(2)}</span>
          <button
            onClick={handleAdd}
            disabled={product.stock === 0}
            className="flex items-center gap-1 bg-indigo-600 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
          >
            {product.stock === 0 ? 'Out of Stock' : '+ Add'}
          </button>
        </div>
      </div>
    </Link>
  );
}
