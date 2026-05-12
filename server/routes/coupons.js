import express from 'express';
import {
  getAllCoupons,
  getActiveCoupons,
  validateCoupon,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  toggleCouponStatus
} from '../controllers/couponController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/active', getActiveCoupons);
router.post('/validate', validateCoupon);

// Admin routes
router.use(protect, adminOnly);
router.get('/', getAllCoupons);
router.post('/', createCoupon);
router.put('/:id', updateCoupon);
router.delete('/:id', deleteCoupon);
router.patch('/:id/toggle', toggleCouponStatus);

export default router;

// Made with Bob
