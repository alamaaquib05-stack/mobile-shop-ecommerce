import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';
import { toast } from 'react-toastify';

const WishlistContext = createContext();

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within WishlistProvider');
  }
  return context;
};

export const WishlistProvider = ({ children }) => {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState([]);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Fetch wishlist when user logs in
  useEffect(() => {
    if (user) {
      fetchWishlist();
    } else {
      // Clear wishlist when user logs out
      setWishlist([]);
      setWishlistCount(0);
    }
  }, [user]);

  const fetchWishlist = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const response = await api.get('/wishlist');
      const products = response.data.wishlist.products || [];
      setWishlist(products);
      setWishlistCount(products.length);
    } catch (error) {
      console.error('Fetch wishlist error:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToWishlist = async (productId) => {
    if (!user) {
      toast.info('Please login to add items to wishlist');
      return false;
    }

    try {
      const response = await api.post(`/wishlist/add/${productId}`);
      const products = response.data.wishlist.products || [];
      setWishlist(products);
      setWishlistCount(products.length);
      toast.success('Added to wishlist');
      return true;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to add to wishlist';
      toast.error(message);
      return false;
    }
  };

  const removeFromWishlist = async (productId) => {
    if (!user) return false;

    try {
      const response = await api.delete(`/wishlist/remove/${productId}`);
      const products = response.data.wishlist.products || [];
      setWishlist(products);
      setWishlistCount(products.length);
      toast.success('Removed from wishlist');
      return true;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to remove from wishlist';
      toast.error(message);
      return false;
    }
  };

  const clearWishlist = async () => {
    if (!user) return false;

    try {
      await api.delete('/wishlist/clear');
      setWishlist([]);
      setWishlistCount(0);
      toast.success('Wishlist cleared');
      return true;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to clear wishlist';
      toast.error(message);
      return false;
    }
  };

  const isInWishlist = (productId) => {
    return wishlist.some(item => item.productId?._id === productId);
  };

  const value = {
    wishlist,
    wishlistCount,
    loading,
    addToWishlist,
    removeFromWishlist,
    clearWishlist,
    isInWishlist,
    fetchWishlist
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};

// Made with Bob
