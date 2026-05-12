import Review from '../models/Review.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';

/**
 * @desc    Submit a review for a product
 * @route   POST /api/reviews/:productId
 * @access  Private
 */
export const submitReview = async (req, res) => {
  try {
    const { productId } = req.params;
    const { rating, title, comment } = req.body;
    const userId = req.user._id;

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if user already reviewed this product
    const existingReview = await Review.findOne({ productId, userId });
    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this product' });
    }

    // Check if user has purchased this product (verified purchase)
    const hasPurchased = await Order.findOne({
      'buyer.userId': userId,
      'items.productId': productId,
      status: 'delivered'
    });

    // Create review
    const review = await Review.create({
      productId,
      userId,
      rating,
      title,
      comment,
      isVerifiedPurchase: Boolean(hasPurchased)
    });

    // Update product ratings
    await updateProductRatings(productId);

    // Populate user info
    await review.populate('userId', 'name');

    res.status(201).json({
      success: true,
      review
    });
  } catch (error) {
    console.error('Submit review error:', error);
    res.status(500).json({ message: error.message || 'Error submitting review' });
  }
};

/**
 * @desc    Get all reviews for a product
 * @route   GET /api/reviews/:productId
 * @access  Public
 */
export const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const reviews = await Review.find({ productId })
      .populate('userId', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Review.countDocuments({ productId });

    res.status(200).json({
      success: true,
      reviews,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({ message: 'Error fetching reviews' });
  }
};

/**
 * @desc    Delete a review
 * @route   DELETE /api/reviews/:id
 * @access  Private (Admin or Review Owner)
 */
export const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const review = await Review.findById(id);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Check if user is admin or review owner
    if (req.user.role !== 'admin' && review.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this review' });
    }

    const productId = review.productId;
    await review.deleteOne();

    // Update product ratings
    await updateProductRatings(productId);

    res.status(200).json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({ message: 'Error deleting review' });
  }
};

/**
 * Helper function to update product ratings
 */
const updateProductRatings = async (productId) => {
  try {
    const reviews = await Review.find({ productId });
    
    if (reviews.length === 0) {
      await Product.findByIdAndUpdate(productId, {
        'ratings.average': 0,
        'ratings.count': 0
      });
      return;
    }

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviews.length;

    await Product.findByIdAndUpdate(productId, {
      'ratings.average': Math.round(averageRating * 10) / 10, // Round to 1 decimal
      'ratings.count': reviews.length
    });
  } catch (error) {
    console.error('Update ratings error:', error);
  }
};

// Made with Bob
