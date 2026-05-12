import express from 'express';
import {
  createGatewayOrder,
  verifyGatewayPayment,
  handleRazorpayWebhook,
  confirmManualPayment
} from '../controllers/paymentController.js';
import { optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Gateway payment routes
router.post('/gateway/create-order', optionalAuth, createGatewayOrder);
router.post('/gateway/verify', optionalAuth, verifyGatewayPayment);
router.post('/gateway/webhook', handleRazorpayWebhook);

// Manual UPI payment routes
router.post('/manual/confirm', optionalAuth, confirmManualPayment);

export default router;

// Made with Bob