import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

const Header = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { cartCount, toggleCart } = useCart();

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <span className="text-2xl font-bold text-primary">MobileShop</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className="text-gray-700 hover:text-primary font-medium transition-colors"
            >
              Home
            </Link>
            <Link
              to="/products"
              className="text-gray-700 hover:text-primary font-medium transition-colors"
            >
              Products
            </Link>
            <Link
              to="/track-order"
              className="text-gray-700 hover:text-primary font-medium transition-colors"
            >
              Track Order
            </Link>
            {isAuthenticated && (
              <Link
                to="/my-orders"
                className="text-gray-700 hover:text-primary font-medium transition-colors"
              >
                My Orders
              </Link>
            )}
            {isAuthenticated && user?.role === 'admin' && (
              <Link
                to="/admin"
                className="text-gray-700 hover:text-primary font-medium transition-colors"
              >
                Admin
              </Link>
            )}
          </nav>

          {/* Right Side - Cart, Auth */}
          <div className="flex items-center space-x-4">
            {/* Cart Button */}
            <button
              onClick={toggleCart}
              className="relative p-2 text-gray-700 hover:text-primary transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </button>

            {/* Auth Buttons */}
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <Link
                  to="/profile"
                  className="text-gray-700 hover:text-primary font-medium transition-colors hidden md:block"
                >
                  {user?.name}
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-gray-700 hover:text-primary font-medium transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-primary font-medium transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden border-t">
        <nav className="flex justify-around py-2">
          <Link
            to="/"
            className="flex flex-col items-center text-gray-700 hover:text-primary transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="text-xs mt-1">Home</span>
          </Link>
          <Link
            to="/products"
            className="flex flex-col items-center text-gray-700 hover:text-primary transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            <span className="text-xs mt-1">Products</span>
          </Link>
          <Link
            to="/track-order"
            className="flex flex-col items-center text-gray-700 hover:text-primary transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <span className="text-xs mt-1">Track</span>
          </Link>
          {isAuthenticated ? (
            <Link
              to="/my-orders"
              className="flex flex-col items-center text-gray-700 hover:text-primary transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <span className="text-xs mt-1">Orders</span>
            </Link>
          ) : (
            <Link
              to="/login"
              className="flex flex-col items-center text-gray-700 hover:text-primary transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              <span className="text-xs mt-1">Login</span>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;

// Made with Bob
