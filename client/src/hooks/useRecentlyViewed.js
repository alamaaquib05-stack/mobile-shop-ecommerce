import { useState, useEffect } from 'react';

const RECENTLY_VIEWED_KEY = 'recentlyViewedProducts';
const MAX_ITEMS = 6;

export const useRecentlyViewed = () => {
  const [recentlyViewed, setRecentlyViewed] = useState([]);

  // Load recently viewed products from localStorage on mount
  useEffect(() => {
    const loadRecentlyViewed = () => {
      try {
        const stored = localStorage.getItem(RECENTLY_VIEWED_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          setRecentlyViewed(parsed);
        }
      } catch (error) {
        console.error('Error loading recently viewed products:', error);
        localStorage.removeItem(RECENTLY_VIEWED_KEY);
      }
    };

    loadRecentlyViewed();
  }, []);

  // Add a product to recently viewed
  const addToRecentlyViewed = (product) => {
    try {
      // Create a lightweight version of the product
      const productData = {
        _id: product._id,
        name: product.name,
        slug: product.slug,
        price: product.price,
        discountPrice: product.discountPrice,
        image: product.images?.[0]?.url || '',
        category: product.category,
        ratings: product.ratings,
        stock: product.stock,
        viewedAt: new Date().toISOString()
      };

      setRecentlyViewed((prev) => {
        // Remove if already exists
        const filtered = prev.filter(item => item._id !== product._id);
        
        // Add to beginning
        const updated = [productData, ...filtered];
        
        // Keep only last MAX_ITEMS
        const trimmed = updated.slice(0, MAX_ITEMS);
        
        // Save to localStorage
        localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(trimmed));
        
        return trimmed;
      });
    } catch (error) {
      console.error('Error adding to recently viewed:', error);
    }
  };

  // Clear all recently viewed products
  const clearRecentlyViewed = () => {
    try {
      localStorage.removeItem(RECENTLY_VIEWED_KEY);
      setRecentlyViewed([]);
    } catch (error) {
      console.error('Error clearing recently viewed:', error);
    }
  };

  // Remove a specific product from recently viewed
  const removeFromRecentlyViewed = (productId) => {
    try {
      setRecentlyViewed((prev) => {
        const updated = prev.filter(item => item._id !== productId);
        localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(updated));
        return updated;
      });
    } catch (error) {
      console.error('Error removing from recently viewed:', error);
    }
  };

  return {
    recentlyViewed,
    addToRecentlyViewed,
    clearRecentlyViewed,
    removeFromRecentlyViewed
  };
};

export default useRecentlyViewed;

// Made with Bob
