import express from 'express';
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
  checkWishlist
} from '../controllers/wishlistController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All wishlist routes require authentication
router.use(protect);

// Get user's wishlist
router.get('/', getWishlist);

// Add product to wishlist
router.post('/add/:productId', addToWishlist);

// Remove product from wishlist
router.delete('/remove/:productId', removeFromWishlist);

// Clear entire wishlist
router.delete('/clear', clearWishlist);

// Check if product is in wishlist
router.get('/check/:productId', checkWishlist);

export default router;

// Made with Bob
