import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useWishlist } from '../contexts/WishlistContext';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import WishlistButton from '../components/WishlistButton';

const Wishlist = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { wishlist, loading, clearWishlist } = useWishlist();
  const { addToCart } = useCart();

  useEffect(() => {
    if (!user) {
      navigate('/auth/login');
    }
  }, [user, navigate]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  const handleMoveToCart = (product) => {
    addToCart(product.productId, 1);
  };

  const handleClearAll = async () => {
    if (window.confirm('Are you sure you want to clear your entire wishlist?')) {
      await clearWishlist();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading wishlist...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Wishlist</h1>
            <p className="text-gray-600 mt-1">
              {wishlist.length} {wishlist.length === 1 ? 'item' : 'items'} saved
            </p>
          </div>
          {wishlist.length > 0 && (
            <button
              onClick={handleClearAll}
              className="text-red-600 hover:text-red-700 font-medium"
            >
              Clear All
            </button>
          )}
        </div>

        {/* Empty State */}
        {wishlist.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <svg
              className="w-24 h-24 mx-auto text-gray-300 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Your wishlist is empty
            </h2>
            <p className="text-gray-600 mb-6">
              Save items you love to buy them later
            </p>
            <Link
              to="/products"
              className="btn-primary inline-block"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          /* Wishlist Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlist.map((item) => {
              const product = item.productId;
              if (!product) return null;

              const displayPrice = product.discountPrice || product.price;
              const hasDiscount = product.discountPrice && product.discountPrice < product.price;
              const discountPercentage = hasDiscount
                ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
                : 0;

              return (
                <div
                  key={item._id}
                  className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                >
                  {/* Product Image */}
                  <Link to={`/products/${product.slug}`} className="block relative">
                    <img
                      src={product.images?.[0]?.url || '/placeholder.png'}
                      alt={product.name}
                      className="w-full h-48 object-cover"
                    />
                    {hasDiscount && (
                      <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded">
                        {discountPercentage}% OFF
                      </span>
                    )}
                    {product.stock === 0 && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <span className="bg-white text-gray-900 px-4 py-2 rounded font-semibold">
                          Out of Stock
                        </span>
                      </div>
                    )}
                    {/* Wishlist Button */}
                    <div className="absolute top-2 right-2">
                      <WishlistButton productId={product._id} size="sm" />
                    </div>
                  </Link>

                  {/* Product Info */}
                  <div className="p-4">
                    <Link to={`/products/${product.slug}`}>
                      <h3 className="font-semibold text-gray-900 mb-1 hover:text-primary line-clamp-2">
                        {product.name}
                      </h3>
                    </Link>

                    {product.category && (
                      <p className="text-sm text-gray-500 mb-2 capitalize">
                        {product.category.replace('-', ' ')}
                      </p>
                    )}

                    {/* Price */}
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-lg font-bold text-gray-900">
                        {formatPrice(displayPrice)}
                      </span>
                      {hasDiscount && (
                        <span className="text-sm text-gray-500 line-through">
                          {formatPrice(product.price)}
                        </span>
                      )}
                    </div>

                    {/* Stock Status */}
                    {product.stock > 0 && product.stock <= 10 && (
                      <p className="text-sm text-orange-600 mb-3">
                        Only {product.stock} left!
                      </p>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleMoveToCart(product)}
                        disabled={product.stock === 0}
                        className="flex-1 btn-primary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                      </button>
                      <Link
                        to={`/products/${product.slug}`}
                        className="btn-secondary text-sm px-4"
                      >
                        View
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;

// Made with Bob
