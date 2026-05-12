import express from 'express';
import {
  getProducts,
  getFeaturedProducts,
  getCategories,
  getProductBySlug,
  getRelatedProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImage,
  deleteProductImage
} from '../controllers/productController.js';
import { protect, adminOnly } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// Public routes
router.get('/', getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/categories', getCategories);
router.get('/:slug', getProductBySlug);
router.get('/:slug/related', getRelatedProducts);

// Admin routes
router.post('/', protect, adminOnly, createProduct);
router.get('/id/:id', protect, adminOnly, getProductById);
router.put('/:id', protect, adminOnly, updateProduct);
router.delete('/:id', protect, adminOnly, deleteProduct);

// Image upload routes
router.post('/upload-image', protect, adminOnly, upload.single('image'), uploadProductImage);
router.delete('/delete-image/:publicId', protect, adminOnly, deleteProductImage);

export default router;

// Made with Bob
