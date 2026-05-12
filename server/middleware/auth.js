import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { AppError } from './errorHandler.js';

/**
 * Protect middleware - Verify JWT token and attach user to request
 */
export const protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Check if token exists
    if (!token) {
      return next(new AppError('Not authorized to access this route', 401));
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from token (exclude password)
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return next(new AppError('User no longer exists', 401));
      }

      // Check if user is active
      if (!req.user.isActive) {
        return next(new AppError('Your account has been deactivated', 401));
      }

      next();
    } catch (error) {
      return next(new AppError('Not authorized to access this route', 401));
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Admin only middleware - Check if user has admin role
 * Must be used after protect middleware
 */
export const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return next(new AppError('Access denied. Admin privileges required.', 403));
  }
};

/**
 * Optional auth middleware - Attach user if token exists, but don't require it
 * Useful for routes that work for both guests and logged-in users
 */
export const optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id).select('-password');
      } catch (error) {
        // Token invalid, but that's okay for optional auth
        req.user = null;
      }
    }

    next();
  } catch (error) {
    next(error);
  }
};

// Made with Bob
