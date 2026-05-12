import Wishlist from '../models/Wishlist.js';
import Product from '../models/Product.js';

// @desc    Get user's wishlist
// @route   GET /api/wishlist
// @access  Private
export const getWishlist = async (req, res) => {
  try {
    let wishlist = await Wishlist.findOne({ userId: req.user._id })
      .populate({
        path: 'products.productId',
        select: 'name slug price discountPrice images stock isActive category'
      });

    if (!wishlist) {
      wishlist = await Wishlist.create({ userId: req.user._id, products: [] });
    }

    // Filter out inactive products or deleted products
    const activeProducts = wishlist.products.filter(
      item => item.productId && item.productId.isActive
    );

    res.json({
      success: true,
      wishlist: {
        products: activeProducts,
        count: activeProducts.length
      }
    });
  } catch (error) {
    console.error('Get wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch wishlist'
    });
  }
};

// @desc    Add product to wishlist
// @route   POST /api/wishlist/add/:productId
// @access  Private
export const addToWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    // Check if product exists and is active
    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    let wishlist = await Wishlist.findOne({ userId: req.user._id });

    if (!wishlist) {
      wishlist = await Wishlist.create({
        userId: req.user._id,
        products: [{ productId }]
      });
    } else {
      // Check if product already in wishlist
      const exists = wishlist.products.some(
        item => item.productId.toString() === productId
      );

      if (exists) {
        return res.status(400).json({
          success: false,
          message: 'Product already in wishlist'
        });
      }

      wishlist.products.push({ productId });
      await wishlist.save();
    }

    // Populate and return updated wishlist
    wishlist = await Wishlist.findOne({ userId: req.user._id })
      .populate({
        path: 'products.productId',
        select: 'name slug price discountPrice images stock isActive category'
      });

    res.json({
      success: true,
      message: 'Product added to wishlist',
      wishlist: {
        products: wishlist.products,
        count: wishlist.products.length
      }
    });
  } catch (error) {
    console.error('Add to wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add product to wishlist'
    });
  }
};

// @desc    Remove product from wishlist
// @route   DELETE /api/wishlist/remove/:productId
// @access  Private
export const removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    const wishlist = await Wishlist.findOne({ userId: req.user._id });

    if (!wishlist) {
      return res.status(404).json({
        success: false,
        message: 'Wishlist not found'
      });
    }

    wishlist.products = wishlist.products.filter(
      item => item.productId.toString() !== productId
    );

    await wishlist.save();

    // Populate and return updated wishlist
    const updatedWishlist = await Wishlist.findOne({ userId: req.user._id })
      .populate({
        path: 'products.productId',
        select: 'name slug price discountPrice images stock isActive category'
      });

    res.json({
      success: true,
      message: 'Product removed from wishlist',
      wishlist: {
        products: updatedWishlist.products,
        count: updatedWishlist.products.length
      }
    });
  } catch (error) {
    console.error('Remove from wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove product from wishlist'
    });
  }
};

// @desc    Clear entire wishlist
// @route   DELETE /api/wishlist/clear
// @access  Private
export const clearWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ userId: req.user._id });

    if (!wishlist) {
      return res.status(404).json({
        success: false,
        message: 'Wishlist not found'
      });
    }

    wishlist.products = [];
    await wishlist.save();

    res.json({
      success: true,
      message: 'Wishlist cleared',
      wishlist: {
        products: [],
        count: 0
      }
    });
  } catch (error) {
    console.error('Clear wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear wishlist'
    });
  }
};

// @desc    Check if product is in wishlist
// @route   GET /api/wishlist/check/:productId
// @access  Private
export const checkWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    const wishlist = await Wishlist.findOne({ userId: req.user._id });

    if (!wishlist) {
      return res.json({
        success: true,
        inWishlist: false
      });
    }

    const inWishlist = wishlist.products.some(
      item => item.productId.toString() === productId
    );

    res.json({
      success: true,
      inWishlist
    });
  } catch (error) {
    console.error('Check wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check wishlist'
    });
  }
};

// Made with Bob
