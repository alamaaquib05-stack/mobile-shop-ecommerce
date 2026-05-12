import { Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { toast } from 'react-toastify';
import WishlistButton from './WishlistButton';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();

  const handleAddToCart = (e) => {
    e.preventDefault(); // Prevent navigation when clicking add to cart
    
    if (product.stock === 0) {
      toast.error('Product is out of stock');
      return;
    }

    addToCart(product, 1);
    toast.success('Added to cart!');
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  const discountPercentage = product.discountPrice 
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  return (
    <Link 
      to={`/products/${product.slug}`}
      className="card group hover:shadow-lg transition-shadow duration-300"
    >
      {/* Image */}
      <div className="relative overflow-hidden rounded-t-lg bg-gray-100 h-48">
        {product.images && product.images.length > 0 ? (
          <img
            src={product.images[0].url}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        
        {/* Wishlist Button - Top Right */}
        <div className="absolute top-2 right-2 z-10">
          <WishlistButton productId={product._id} size="sm" />
        </div>

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.isFeatured && (
            <span className="bg-yellow-500 text-white text-xs font-semibold px-2 py-1 rounded">
              Featured
            </span>
          )}
          {discountPercentage > 0 && (
            <span className="bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded">
              {discountPercentage}% OFF
            </span>
          )}
        </div>

        {/* Stock badge */}
        {product.stock <= 5 && product.stock > 0 && (
          <div className="absolute bottom-2 right-2">
            <span className="bg-orange-500 text-white text-xs font-semibold px-2 py-1 rounded">
              Only {product.stock} left!
            </span>
          </div>
        )}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="bg-gray-800 text-white text-sm font-semibold px-4 py-2 rounded">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Category & Brand */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-500 uppercase tracking-wide">
            {product.category.replace('-', ' ')}
          </span>
          {product.brand && (
            <span className="text-xs text-gray-600 font-medium">
              {product.brand}
            </span>
          )}
        </div>

        {/* Product Name */}
        <h3 className="text-sm font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-brand-primary transition-colors">
          {product.name}
        </h3>

        {/* Rating */}
        {product.ratings && product.ratings.count > 0 && (
          <div className="flex items-center gap-1 mb-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.round(product.ratings.average)
                      ? 'text-yellow-400'
                      : 'text-gray-300'
                  }`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="text-xs text-gray-600">
              ({product.ratings.count})
            </span>
          </div>
        )}

        {/* Price */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg font-bold text-gray-900">
            {formatPrice(product.discountPrice || product.price)}
          </span>
          {product.discountPrice && (
            <span className="text-sm text-gray-500 line-through">
              {formatPrice(product.price)}
            </span>
          )}
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          disabled={product.stock === 0}
          className="w-full btn-primary text-sm py-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
        </button>
      </div>
    </Link>
  );
};

export default ProductCard;

// Made with Bob
