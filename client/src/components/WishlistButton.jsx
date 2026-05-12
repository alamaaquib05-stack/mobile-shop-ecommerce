import { useState } from 'react';
import { useWishlist } from '../contexts/WishlistContext';
import { useAuth } from '../contexts/AuthContext';

const WishlistButton = ({ productId, size = 'md', showText = false }) => {
  const { user } = useAuth();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const [loading, setLoading] = useState(false);

  const inWishlist = isInWishlist(productId);

  const handleClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      // Context will show login toast
      addToWishlist(productId);
      return;
    }

    setLoading(true);
    if (inWishlist) {
      await removeFromWishlist(productId);
    } else {
      await addToWishlist(productId);
    }
    setLoading(false);
  };

  // Size classes
  const sizeClasses = {
    sm: 'w-8 h-8 text-base',
    md: 'w-10 h-10 text-lg',
    lg: 'w-12 h-12 text-xl'
  };

  const iconSizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`
        ${sizeClasses[size]}
        ${showText ? 'px-4 py-2 w-auto h-auto' : 'rounded-full'}
        flex items-center justify-center gap-2
        transition-all duration-200
        ${inWishlist 
          ? 'bg-red-50 text-red-600 hover:bg-red-100' 
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }
        ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110'}
        disabled:opacity-50 disabled:cursor-not-allowed
      `}
      title={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
    >
      {loading ? (
        <svg
          className={`animate-spin ${iconSizeClasses[size]}`}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      ) : (
        <>
          <svg
            className={iconSizeClasses[size]}
            fill={inWishlist ? 'currentColor' : 'none'}
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
          {showText && (
            <span className="text-sm font-medium">
              {inWishlist ? 'Saved' : 'Save'}
            </span>
          )}
        </>
      )}
    </button>
  );
};

export default WishlistButton;

// Made with Bob
