import express from 'express';
import {
  submitReview,
  getProductReviews,
  deleteReview
} from '../controllers/reviewController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/:productId', getProductReviews);

// Protected routes (require login)
router.post('/:productId', protect, submitReview);
router.delete('/:id', protect, deleteReview);

export default router;

// Made with Bob