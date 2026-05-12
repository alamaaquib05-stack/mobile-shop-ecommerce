import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Coupon from '../models/Coupon.js';
import { createRazorpayOrder, verifyRazorpaySignature, verifyWebhookSignature } from '../utils/razorpayClient.js';
import { generateOrderId } from '../utils/generateOrderId.js';
import { sendOrderConfirmationEmail } from '../utils/emailService.js';

/**
 * @desc    Create Razorpay order for gateway payment
 * @route   POST /api/payment/gateway/create-order
 * @access  Public
 */
export const createGatewayOrder = async (req, res) => {
  try {
    const { amount, cartItems } = req.body;

    // Validate cart items and recalculate amount from DB
    let calculatedTotal = 0;
    const validatedItems = [];

    for (const item of cartItems) {
      const product = await Product.findById(item.productId);
      
      if (!product) {
        return res.status(404).json({ message: `Product ${item.name} not found` });
      }

      if (!product.isActive) {
        return res.status(400).json({ message: `Product ${product.name} is no longer available` });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({ 
          message: `Insufficient stock for ${product.name}. Only ${product.stock} left` 
        });
      }

      const itemTotal = product.price * item.quantity;
      calculatedTotal += itemTotal;

      validatedItems.push({
        productId: product._id,
        name: product.name,
        image: product.images[0]?.url || '',
        price: product.price,
        quantity: item.quantity,
        subtotal: itemTotal
      });
    }

    // Add shipping charge
    const shippingCharge = calculatedTotal >= 499 ? 0 : 49;
    const finalTotal = calculatedTotal + shippingCharge;

    // Verify amount matches
    if (Math.abs(finalTotal - amount) > 1) {
      return res.status(400).json({ 
        message: 'Amount mismatch. Please refresh and try again.' 
      });
    }

    // Generate temporary receipt ID
    const receipt = `rcpt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create Razorpay order
    const razorpayOrder = await createRazorpayOrder(finalTotal, 'INR', receipt);

    res.status(200).json({
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
      receipt: razorpayOrder.receipt
    });

  } catch (error) {
    console.error('Create gateway order error:', error);
    res.status(500).json({ 
      message: error.message || 'Error creating payment order' 
    });
  }
};

/**
 * @desc    Verify Razorpay payment and create order
 * @route   POST /api/payment/gateway/verify
 * @access  Public
 */
export const verifyGatewayPayment = async (req, res) => {
  try {
    const {
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      cartItems,
      deliveryAddress,
      buyerInfo,
      couponCode,
      couponDiscount
    } = req.body;

    // Verify signature
    const isValid = verifyRazorpaySignature(
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature
    );

    if (!isValid) {
      return res.status(400).json({ message: 'Invalid payment signature' });
    }

    // Validate cart items and recalculate pricing
    let subtotal = 0;
    const orderItems = [];

    for (const item of cartItems) {
      const product = await Product.findById(item.productId);
      
      if (!product) {
        return res.status(404).json({ message: `Product ${item.name} not found` });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({ 
          message: `Insufficient stock for ${product.name}` 
        });
      }

      const itemTotal = product.price * item.quantity;
      subtotal += itemTotal;

      orderItems.push({
        productId: product._id,
        name: product.name,
        image: product.images[0]?.url || '',
        price: product.price,
        quantity: item.quantity,
        subtotal: itemTotal
      });

      // Decrement stock
      product.stock -= item.quantity;
      await product.save();
    }

    // Calculate final pricing
    const shippingCharge = subtotal >= 499 ? 0 : 49;
    let discount = 0;

    // Apply coupon if provided
    if (couponCode && couponDiscount > 0) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });
      if (coupon && coupon.isValid()) {
        discount = couponDiscount;
        // Increment coupon usage
        coupon.usedCount += 1;
        await coupon.save();
      }
    }

    const total = subtotal + shippingCharge - discount;

    // Generate order ID
    const orderId = await generateOrderId();

    // Create order
    const order = await Order.create({
      orderId,
      buyer: {
        userId: req.user?._id || null,
        name: buyerInfo.name || deliveryAddress.fullName,
        email: buyerInfo.email || '',
        phone: buyerInfo.phone || deliveryAddress.phone
      },
      items: orderItems,
      deliveryAddress,
      pricing: {
        subtotal,
        shippingCharge,
        discount,
        total
      },
      couponCode: couponCode || null,
      payment: {
        mode: 'gateway',
        gatewayProvider: 'razorpay',
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
        amount: total,
        currency: 'INR',
        status: 'verified',
        paidAt: new Date()
      },
      status: 'confirmed'
    });

    // Send order confirmation email
    sendOrderConfirmationEmail(order).catch(err =>
      console.error('Email send failed:', err)
    );

    res.status(201).json({
      success: true,
      message: 'Payment verified successfully',
      orderId: order.orderId,
      order
    });

  } catch (error) {
    console.error('Verify gateway payment error:', error);
    res.status(500).json({ 
      message: error.message || 'Error verifying payment' 
    });
  }
};

/**
 * @desc    Handle Razorpay webhook events
 * @route   POST /api/payment/gateway/webhook
 * @access  Public (with signature verification)
 */
export const handleRazorpayWebhook = async (req, res) => {
  try {
    const webhookSignature = req.headers['x-razorpay-signature'];
    const webhookBody = JSON.stringify(req.body);

    // Verify webhook signature
    const isValid = verifyWebhookSignature(webhookBody, webhookSignature);

    if (!isValid) {
      console.error('Invalid webhook signature');
      return res.status(400).json({ message: 'Invalid signature' });
    }

    const event = req.body.event;
    const payload = req.body.payload.payment.entity;

    console.log('Razorpay webhook event:', event);

    // Handle different events
    switch (event) {
      case 'payment.captured':
        // Payment was successfully captured
        await handlePaymentCaptured(payload);
        break;

      case 'payment.failed':
        // Payment failed
        await handlePaymentFailed(payload);
        break;

      default:
        console.log('Unhandled webhook event:', event);
    }

    // Always return 200 to Razorpay
    res.status(200).json({ received: true });

  } catch (error) {
    console.error('Webhook error:', error);
    // Still return 200 to prevent Razorpay retries
    res.status(200).json({ received: true });
  }
};

/**
 * @desc    Submit UTR for manual UPI payment
 * @route   POST /api/payment/manual/confirm
 * @access  Public
 */
export const confirmManualPayment = async (req, res) => {
  try {
    const {
      cartItems,
      deliveryAddress,
      buyerInfo,
      upiMethod,
      upiId,
      utrNumber,
      couponCode,
      couponDiscount
    } = req.body;

    // Validate UTR number (12 digits)
    if (!utrNumber || !/^\d{12}$/.test(utrNumber)) {
      return res.status(400).json({ 
        message: 'Invalid UTR number. Must be 12 digits.' 
      });
    }

    // Validate cart items and calculate pricing
    let subtotal = 0;
    const orderItems = [];

    for (const item of cartItems) {
      const product = await Product.findById(item.productId);
      
      if (!product) {
        return res.status(404).json({ message: `Product ${item.name} not found` });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({ 
          message: `Insufficient stock for ${product.name}` 
        });
      }

      const itemTotal = product.price * item.quantity;
      subtotal += itemTotal;

      orderItems.push({
        productId: product._id,
        name: product.name,
        image: product.images[0]?.url || '',
        price: product.price,
        quantity: item.quantity,
        subtotal: itemTotal
      });

      // Decrement stock immediately
      product.stock -= item.quantity;
      await product.save();
    }

    // Calculate final pricing
    const shippingCharge = subtotal >= 499 ? 0 : 49;
    let discount = 0;

    // Apply coupon if provided
    if (couponCode && couponDiscount > 0) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });
      if (coupon && coupon.isValid()) {
        discount = couponDiscount;
        // Increment coupon usage
        coupon.usedCount += 1;
        await coupon.save();
      }
    }

    const total = subtotal + shippingCharge - discount;

    // Generate order ID
    const orderId = await generateOrderId();

    // Create order with pending payment status
    const order = await Order.create({
      orderId,
      buyer: {
        userId: req.user?._id || null,
        name: buyerInfo.name || deliveryAddress.fullName,
        email: buyerInfo.email || '',
        phone: buyerInfo.phone || deliveryAddress.phone
      },
      items: orderItems,
      deliveryAddress,
      pricing: {
        subtotal,
        shippingCharge,
        discount,
        total
      },
      couponCode: couponCode || null,
      payment: {
        mode: 'manual_upi',
        upiMethod,
        upiId: upiId || process.env.SHOP_UPI_ID,
        utrNumber,
        amount: total,
        currency: 'INR',
        status: 'pending'
      },
      status: 'payment_pending'
    });

    // Send order confirmation email
    sendOrderConfirmationEmail(order).catch(err =>
      console.error('Email send failed:', err)
    );

    res.status(201).json({
      success: true,
      message: 'Order placed. Payment verification in progress.',
      orderId: order.orderId,
      order
    });

  } catch (error) {
    console.error('Confirm manual payment error:', error);
    res.status(500).json({ 
      message: error.message || 'Error processing order' 
    });
  }
};

// Helper functions for webhook handling
const handlePaymentCaptured = async (payload) => {
  try {
    const order = await Order.findOne({ 
      'payment.razorpayOrderId': payload.order_id 
    });

    if (order) {
      order.payment.status = 'verified';
      order.payment.paidAt = new Date();
      order.status = 'confirmed';
      await order.save();
      console.log('Order confirmed via webhook:', order.orderId);
    }
  } catch (error) {
    console.error('Error handling payment captured:', error);
  }
};

const handlePaymentFailed = async (payload) => {
  try {
    const order = await Order.findOne({ 
      'payment.razorpayOrderId': payload.order_id 
    });

    if (order) {
      order.payment.status = 'failed';
      order.status = 'cancelled';
      await order.save();
      console.log('Order marked as failed via webhook:', order.orderId);
    }
  } catch (error) {
    console.error('Error handling payment failed:', error);
  }
};

// Made with Bob