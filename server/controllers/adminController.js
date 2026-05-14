import User from '../models/User.js';
import { AppError } from '../middleware/errorHandler.js';
import logger from '../utils/logger.js';

/**
 * @desc    Create new admin user (Admin only)
 * @route   POST /api/admin/create-admin
 * @access  Private/Admin
 */
export const createAdmin = async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return next(new AppError('Please provide name, email and password', 400));
    }

    // Validate password strength (minimum 8 characters for admin)
    if (password.length < 8) {
      return next(new AppError('Admin password must be at least 8 characters long', 400));
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return next(new AppError('Email already registered', 400));
    }

    // Create admin user
    const admin = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      phone,
      role: 'admin',
      isActive: true
    });

    // Log admin creation
    logger.info(`New admin created: ${admin.email} by ${req.user.email}`);

    // Remove password from output
    admin.password = undefined;

    res.status(201).json({
      success: true,
      message: 'Admin user created successfully',
      admin
    });
  } catch (error) {
    logger.error(`Error creating admin: ${error.message}`);
    next(error);
  }
};

/**
 * @desc    Get all admin users
 * @route   GET /api/admin/admins
 * @access  Private/Admin
 */
export const getAllAdmins = async (req, res, next) => {
  try {
    const admins = await User.find({ role: 'admin' })
      .select('-password')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: admins.length,
      admins
    });
  } catch (error) {
    logger.error(`Error fetching admins: ${error.message}`);
    next(error);
  }
};

/**
 * @desc    Deactivate admin user
 * @route   PUT /api/admin/admins/:id/deactivate
 * @access  Private/Admin
 */
export const deactivateAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Prevent self-deactivation
    if (id === req.user._id.toString()) {
      return next(new AppError('You cannot deactivate your own account', 400));
    }

    const admin = await User.findById(id);

    if (!admin) {
      return next(new AppError('Admin not found', 404));
    }

    if (admin.role !== 'admin') {
      return next(new AppError('User is not an admin', 400));
    }

    admin.isActive = false;
    await admin.save();

    logger.info(`Admin deactivated: ${admin.email} by ${req.user.email}`);

    res.status(200).json({
      success: true,
      message: 'Admin deactivated successfully'
    });
  } catch (error) {
    logger.error(`Error deactivating admin: ${error.message}`);
    next(error);
  }
};

/**
 * @desc    Reactivate admin user
 * @route   PUT /api/admin/admins/:id/activate
 * @access  Private/Admin
 */
export const activateAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;

    const admin = await User.findById(id);

    if (!admin) {
      return next(new AppError('Admin not found', 404));
    }

    if (admin.role !== 'admin') {
      return next(new AppError('User is not an admin', 400));
    }

    admin.isActive = true;
    await admin.save();

    logger.info(`Admin activated: ${admin.email} by ${req.user.email}`);

    res.status(200).json({
      success: true,
      message: 'Admin activated successfully'
    });
  } catch (error) {
    logger.error(`Error activating admin: ${error.message}`);
    next(error);
  }
};

// Made with Bob