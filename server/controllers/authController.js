import User from '../models/User.js';
import { AppError } from '../middleware/errorHandler.js';
import jwt from 'jsonwebtoken';

/**
 * Generate JWT token
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

/**
 * Send token response
 */
const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(user._id);

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    success: true,
    token,
    user
  });
};

/**
 * @desc    Register new user (buyer)
 * @route   POST /api/auth/register
 * @access  Public
 */
export const register = async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return next(new AppError('Please provide name, email and password', 400));
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return next(new AppError('Email already registered', 400));
    }

    // Validate password strength (minimum 6 characters)
    if (password.length < 6) {
      return next(new AppError('Password must be at least 6 characters', 400));
    }

    // Create user (password will be hashed by pre-save hook)
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      phone,
      role: 'buyer' // Always create as buyer, admin created via seed script
    });

    sendTokenResponse(user, 201, res);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Login user (buyer or admin)
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate email and password
    if (!email || !password) {
      return next(new AppError('Please provide email and password', 400));
    }

    // Find user and include password field
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
      return next(new AppError('Invalid credentials', 401));
    }

    // Check if user is active
    if (!user.isActive) {
      return next(new AppError('Your account has been deactivated', 401));
    }

    // Check if password matches
    const isPasswordMatch = await user.comparePassword(password);

    if (!isPasswordMatch) {
      return next(new AppError('Invalid credentials', 401));
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Logout user (client-side token removal)
 * @route   POST /api/auth/logout
 * @access  Private
 */
export const logout = async (req, res, next) => {
  try {
    // Since we're using JWT, logout is handled client-side by removing the token
    // This endpoint is just for consistency and can be used for logging purposes
    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current logged in user
 * @route   GET /api/auth/me
 * @access  Private
 */
export const getMe = async (req, res, next) => {
  try {
    // User is already attached to req by protect middleware
    const user = await User.findById(req.user.id).select('-password');

    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update user profile
 * @route   PUT /api/auth/me
 * @access  Private
 */
export const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, email } = req.body;

    // Fields to update
    const fieldsToUpdate = {};
    if (name) fieldsToUpdate.name = name;
    if (phone) fieldsToUpdate.phone = phone;
    if (email) {
      // Check if email is already taken by another user
      const existingUser = await User.findOne({ 
        email: email.toLowerCase(),
        _id: { $ne: req.user.id }
      });
      
      if (existingUser) {
        return next(new AppError('Email already in use', 400));
      }
      
      fieldsToUpdate.email = email.toLowerCase();
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      fieldsToUpdate,
      {
        new: true,
        runValidators: true
      }
    ).select('-password');

    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Change password
 * @route   PUT /api/auth/me/password
 * @access  Private
 */
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Validate input
    if (!currentPassword || !newPassword) {
      return next(new AppError('Please provide current and new password', 400));
    }

    // Validate new password strength
    if (newPassword.length < 6) {
      return next(new AppError('New password must be at least 6 characters', 400));
    }

    // Get user with password
    const user = await User.findById(req.user.id).select('+password');

    // Check current password
    const isPasswordMatch = await user.comparePassword(currentPassword);

    if (!isPasswordMatch) {
      return next(new AppError('Current password is incorrect', 401));
    }

    // Update password (will be hashed by pre-save hook)
    user.password = newPassword;
    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Add address to user profile
 * @route   POST /api/auth/me/addresses
 * @access  Private
 */
export const addAddress = async (req, res, next) => {
  try {
    const { fullName, phone, addressLine1, addressLine2, city, state, pincode, isDefault } = req.body;

    // Validate required fields
    if (!fullName || !phone || !addressLine1 || !city || !state || !pincode) {
      return next(new AppError('Please provide all required address fields', 400));
    }

    // Validate pincode (6 digits)
    if (!/^\d{6}$/.test(pincode)) {
      return next(new AppError('Pincode must be 6 digits', 400));
    }

    // Validate phone (10 digits)
    if (!/^\d{10}$/.test(phone)) {
      return next(new AppError('Phone number must be 10 digits', 400));
    }

    const user = await User.findById(req.user.id);

    // If this is the first address or marked as default, set all others to non-default
    if (isDefault || user.addresses.length === 0) {
      user.addresses.forEach(addr => addr.isDefault = false);
    }

    // Add new address
    user.addresses.push({
      fullName,
      phone,
      addressLine1,
      addressLine2,
      city,
      state,
      pincode,
      isDefault: isDefault || user.addresses.length === 0
    });

    await user.save();

    res.status(201).json({
      success: true,
      addresses: user.addresses
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update address
 * @route   PUT /api/auth/me/addresses/:addressId
 * @access  Private
 */
export const updateAddress = async (req, res, next) => {
  try {
    const { addressId } = req.params;
    const { fullName, phone, addressLine1, addressLine2, city, state, pincode, isDefault } = req.body;

    const user = await User.findById(req.user.id);

    const address = user.addresses.id(addressId);
    if (!address) {
      return next(new AppError('Address not found', 404));
    }

    // Update fields
    if (fullName) address.fullName = fullName;
    if (phone) {
      if (!/^\d{10}$/.test(phone)) {
        return next(new AppError('Phone number must be 10 digits', 400));
      }
      address.phone = phone;
    }
    if (addressLine1) address.addressLine1 = addressLine1;
    if (addressLine2 !== undefined) address.addressLine2 = addressLine2;
    if (city) address.city = city;
    if (state) address.state = state;
    if (pincode) {
      if (!/^\d{6}$/.test(pincode)) {
        return next(new AppError('Pincode must be 6 digits', 400));
      }
      address.pincode = pincode;
    }

    // If setting as default, unset all others
    if (isDefault) {
      user.addresses.forEach(addr => addr.isDefault = false);
      address.isDefault = true;
    }

    await user.save();

    res.status(200).json({
      success: true,
      addresses: user.addresses
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete address
 * @route   DELETE /api/auth/me/addresses/:addressId
 * @access  Private
 */
export const deleteAddress = async (req, res, next) => {
  try {
    const { addressId } = req.params;

    const user = await User.findById(req.user.id);

    const address = user.addresses.id(addressId);
    if (!address) {
      return next(new AppError('Address not found', 404));
    }

    // If deleting default address and there are other addresses, set first one as default
    const wasDefault = address.isDefault;
    address.remove();

    if (wasDefault && user.addresses.length > 0) {
      user.addresses[0].isDefault = true;
    }

    await user.save();

    res.status(200).json({
      success: true,
      addresses: user.addresses
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all addresses
 * @route   GET /api/auth/me/addresses
 * @access  Private
 */
export const getAddresses = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      addresses: user.addresses
    });
  } catch (error) {
    next(error);
  }
};

// Made with Bob
