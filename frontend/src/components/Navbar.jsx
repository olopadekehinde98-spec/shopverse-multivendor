import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };
  const itemCount = cart.items.reduce((s, i) => s + i.quantity, 0);

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <span className="text-xl font-bold text-indigo-600">ShopVerse</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/products" className="text-sm text-gray-600 hover:text-indigo-600 font-medium">Browse</Link>
            {user?.role === 'seller' && (
              <Link to="/seller/dashboard" className="text-sm text-gray-600 hover:text-indigo-600 font-medium">Dashboard</Link>
            )}
            {user?.role === 'admin' && (
              <Link to="/admin" className="text-sm text-gray-600 hover:text-indigo-600 font-medium">Admin</Link>
            )}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {user && (
              <Link to="/cart" className="relative p-2 text-gray-600 hover:text-indigo-600 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-indigo-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold">
                    {itemCount > 9 ? '9+' : itemCount}
                  </span>
                )}
              </Link>
            )}

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 text-sm text-gray-700 hover:text-indigo-600 transition-colors font-medium"
                >
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                    <span className="text-indigo-700 font-semibold text-sm">{user.name?.[0]?.toUpperCase()}</span>
                  </div>
                  <span className="hidden md:block">{user.name?.split(' ')[0]}</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 hidden md:block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {dropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg py-1 z-50 border border-gray-100">
                      <div className="px-4 py-2 border-b border-gray-50">
                        <p className="text-xs font-semibold text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-400 capitalize">{user.role}</p>
                      </div>
                      <Link to="/orders" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setDropdownOpen(false)}>My Orders</Link>
                      {user.role === 'seller' && (
                        <Link to="/seller/dashboard" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setDropdownOpen(false)}>Seller Dashboard</Link>
                      )}
                      {user.role === 'admin' && (
                        <Link to="/admin" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setDropdownOpen(false)}>Admin Panel</Link>
                      )}
                      <div className="border-t border-gray-50 mt-1">
                        <button onClick={() => { setDropdownOpen(false); handleLogout(); }} className="w-full text-left block px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                          Logout
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="text-sm text-gray-600 hover:text-indigo-600 px-3 py-1.5 font-medium">Login</Link>
                <Link to="/register" className="text-sm bg-indigo-600 text-white px-4 py-1.5 rounded-lg hover:bg-indigo-700 font-medium transition-colors">Sign Up</Link>
              </div>
            )}

            {/* Mobile hamburger */}
            <button className="md:hidden p-2 text-gray-600" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden pb-4 border-t border-gray-100 pt-3 flex flex-col gap-1">
            <Link to="/products" className="text-gray-700 text-sm py-2 px-2 rounded-lg hover:bg-gray-50 font-medium" onClick={() => setMenuOpen(false)}>Browse Products</Link>
            {user?.role === 'seller' && (
              <Link to="/seller/dashboard" className="text-gray-700 text-sm py-2 px-2 rounded-lg hover:bg-gray-50 font-medium" onClick={() => setMenuOpen(false)}>Seller Dashboard</Link>
            )}
            {user?.role === 'admin' && (
              <Link to="/admin" className="text-gray-700 text-sm py-2 px-2 rounded-lg hover:bg-gray-50 font-medium" onClick={() => setMenuOpen(false)}>Admin Panel</Link>
            )}
            {user && (
              <Link to="/orders" className="text-gray-700 text-sm py-2 px-2 rounded-lg hover:bg-gray-50 font-medium" onClick={() => setMenuOpen(false)}>My Orders</Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
