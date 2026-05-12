import express from 'express';
import {
  getOrderByOrderId,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
  verifyManualPayment,
  getOrderStats
} from '../controllers/orderController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/:orderId', getOrderByOrderId);

// Protected routes (logged-in users)
router.get('/my/orders', protect, getMyOrders);

// Admin routes
router.get('/', protect, adminOnly, getAllOrders);
router.get('/admin/stats', protect, adminOnly, getOrderStats);
router.put('/:id/status', protect, adminOnly, updateOrderStatus);
router.put('/:id/verify-payment', protect, adminOnly, verifyManualPayment);

export default router;

// Made with Bob