import express from 'express';
import {
  createAdmin,
  getAllAdmins,
  deactivateAdmin,
  activateAdmin
} from '../controllers/adminController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// All routes require admin authentication
router.use(protect);
router.use(adminOnly);

// Admin management routes
router.post('/create-admin', createAdmin);
router.get('/admins', getAllAdmins);
router.put('/admins/:id/deactivate', deactivateAdmin);
router.put('/admins/:id/activate', activateAdmin);

export default router;

// Made with Bob