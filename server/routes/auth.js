import express from 'express';
import {
  register,
  login,
  logout,
  getMe,
  updateProfile,
  changePassword,
  addAddress,
  updateAddress,
  deleteAddress,
  getAddresses
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes (require authentication)
router.use(protect); // All routes below this require authentication

router.post('/logout', logout);
router.get('/me', getMe);
router.put('/me', updateProfile);
router.put('/me/password', changePassword);

// Address management routes
router.get('/me/addresses', getAddresses);
router.post('/me/addresses', addAddress);
router.put('/me/addresses/:addressId', updateAddress);
router.delete('/me/addresses/:addressId', deleteAddress);

export default router;

// Made with Bob
