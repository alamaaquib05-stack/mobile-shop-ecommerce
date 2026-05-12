import Order from '../models/Order.js';
import { sendPaymentVerifiedEmail, sendOrderShippedEmail } from '../utils/emailService.js';

/**
 * @desc    Get order by order ID
 * @route   GET /api/orders/:orderId
 * @access  Public
 */
export const getOrderByOrderId = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findOne({ orderId }).populate('items.productId', 'name images');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.status(200).json({
      success: true,
      order
    });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ message: 'Error fetching order' });
  }
};

/**
 * @desc    Get all orders for logged-in user
 * @route   GET /api/orders/my-orders
 * @access  Private
 */
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ 'buyer.userId': req.user._id })
      .sort({ createdAt: -1 })
      .populate('items.productId', 'name images');

    res.status(200).json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (error) {
    console.error('Get my orders error:', error);
    res.status(500).json({ message: 'Error fetching orders' });
  }
};

/**
 * @desc    Get all orders (Admin)
 * @route   GET /api/orders
 * @access  Private/Admin
 */
export const getAllOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = {};
    
    // Filter by status
    if (req.query.status) {
      filter.status = req.query.status;
    }

    // Filter by payment status
    if (req.query.paymentStatus) {
      filter['payment.status'] = req.query.paymentStatus;
    }

    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('items.productId', 'name images');

    const total = await Order.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: orders.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      orders
    });
  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({ message: 'Error fetching orders' });
  }
};

/**
 * @desc    Update order status (Admin)
 * @route   PUT /api/orders/:id/status
 * @access  Private/Admin
 */
export const updateOrderStatus = async (req, res) => {
  try {
    const { status, trackingNumber, notes } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (status) {
      order.status = status;
    }

    if (trackingNumber) {
      order.trackingNumber = trackingNumber;
    }

    if (notes) {
      order.notes = notes;
    }

    await order.save();

    res.status(200).json({
      success: true,
      message: 'Order updated successfully',
      order
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ message: 'Error updating order' });
  }
};

/**
 * @desc    Verify manual UPI payment (Admin)
 * @route   PUT /api/orders/:id/verify-payment
 * @access  Private/Admin
 */
export const verifyManualPayment = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.payment.mode !== 'manual_upi') {
      return res.status(400).json({ message: 'This is not a manual UPI order' });
    }

    if (order.payment.status === 'verified') {
      return res.status(400).json({ message: 'Payment already verified' });
    }

    // Update payment and order status
    order.payment.status = 'verified';
    order.payment.paidAt = new Date();
    order.status = 'confirmed';

    await order.save();

    // Send payment verified email
    sendPaymentVerifiedEmail(order).catch(err =>
      console.error('Email send failed:', err)
    );

    res.status(200).json({
      success: true,
      message: 'Payment verified successfully',
      order
    });
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({ message: 'Error verifying payment' });
  }
};

/**
 * @desc    Get order statistics (Admin)
 * @route   GET /api/orders/stats
 * @access  Private/Admin
 */
export const getOrderStats = async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const pendingPayments = await Order.countDocuments({ 'payment.status': 'pending' });
    const confirmedOrders = await Order.countDocuments({ status: 'confirmed' });
    
    const revenueResult = await Order.aggregate([
      { $match: { 'payment.status': 'verified' } },
      { $group: { _id: null, total: { $sum: '$pricing.total' } } }
    ]);

    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

    // Calculate this month's revenue
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const monthlyRevenueResult = await Order.aggregate([
      {
        $match: {
          'payment.status': 'verified',
          createdAt: { $gte: startOfMonth }
        }
      },
      { $group: { _id: null, total: { $sum: '$pricing.total' } } }
    ]);

    const monthlyRevenue = monthlyRevenueResult.length > 0 ? monthlyRevenueResult[0].total : 0;

    res.status(200).json({
      success: true,
      stats: {
        totalOrders,
        pendingPayments,
        confirmedOrders,
        totalRevenue,
        monthlyRevenue
      }
    });
  } catch (error) {
    console.error('Get order stats error:', error);
    res.status(500).json({ message: 'Error fetching statistics' });
  }
};

// Made with Bob