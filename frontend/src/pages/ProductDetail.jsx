import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { ShoppingCartIcon, StarIcon } from '@heroicons/react/24/outline';

export default function ProductDetail() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    api.get(`/products/${id}`)
      .then((r) => setProduct(r.data))
      .catch(() => toast.error('Product not found'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAdd = async () => {
    if (!user) { toast.error('Please login to add to cart'); return; }
    setAdding(true);
    try {
      await addToCart(product.id, qty);
      toast.success('Added to cart!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add to cart');
    } finally {
      setAdding(false);
    }
  };

  if (loading) return (
    <div className="max-w-6xl mx-auto px-4 py-12 grid md:grid-cols-2 gap-10">
      <div className="bg-gray-100 animate-pulse rounded-xl aspect-square" />
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => <div key={i} className="bg-gray-100 animate-pulse h-6 rounded" />)}
      </div>
    </div>
  );

  if (!product) return <div className="text-center py-24 text-gray-400">Product not found</div>;

  const images = product.images?.length ? product.images : ['https://placehold.co/600x600?text=No+Image'];

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <nav className="text-sm text-gray-400 mb-6">
        <Link to="/" className="hover:text-indigo-600">Home</Link> /{' '}
        <Link to="/products" className="hover:text-indigo-600">Products</Link> /{' '}
        <span className="text-gray-700">{product.name}</span>
      </nav>

      <div className="grid md:grid-cols-2 gap-10">
        {/* Images */}
        <div>
          <div className="rounded-xl overflow-hidden border border-gray-100 mb-3">
            <img src={images[activeImg]} alt={product.name} className="w-full aspect-square object-cover" />
          </div>
          {images.length > 1 && (
            <div className="flex gap-2">
              {images.map((img, i) => (
                <button
                  key={i} onClick={() => setActiveImg(i)}
                  className={`rounded-lg overflow-hidden border-2 transition-colors ${activeImg === i ? 'border-indigo-500' : 'border-transparent'}`}
                >
                  <img src={img} alt="" className="h-16 w-16 object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <Link
            to={`/products?seller_id=${product.seller_profiles?.user_id}`}
            className="text-sm text-indigo-600 font-medium hover:underline"
          >
            {product.seller_profiles?.store_name}
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mt-2">{product.name}</h1>
          <p className="text-gray-500 capitalize text-sm mt-1">{product.category}</p>

          <p className="text-3xl font-bold text-gray-900 mt-5">${Number(product.price).toFixed(2)}</p>

          <div className="mt-2">
            {product.stock > 0 ? (
              <span className="text-sm text-green-600 font-medium">✓ In Stock ({product.stock} available)</span>
            ) : (
              <span className="text-sm text-red-500 font-medium">✗ Out of Stock</span>
            )}
          </div>

          <p className="text-gray-600 text-sm leading-relaxed mt-6">{product.description}</p>

          {product.stock > 0 && (
            <div className="flex items-center gap-4 mt-8">
              <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="px-3 py-2 text-lg hover:bg-gray-50">−</button>
                <span className="px-4 py-2 text-sm font-semibold">{qty}</span>
                <button onClick={() => setQty(Math.min(product.stock, qty + 1))} className="px-3 py-2 text-lg hover:bg-gray-50">+</button>
              </div>
              <button
                onClick={handleAdd} disabled={adding}
                className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 text-white py-2.5 rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-60 transition-colors"
              >
                <ShoppingCartIcon className="h-5 w-5" />
                {adding ? 'Adding…' : 'Add to Cart'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
