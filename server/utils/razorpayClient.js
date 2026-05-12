import Razorpay from 'razorpay';
import crypto from 'crypto';

// Lazy initialization of Razorpay instance
let razorpay = null;

const getRazorpayInstance = () => {
  if (!razorpay) {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      console.warn('⚠️  Razorpay credentials not configured. Payment gateway will not work.');
      return null;
    }
    razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });
  }
  return razorpay;
};

/**
 * Create a Razorpay order
 * @param {Number} amount - Amount in paise (multiply rupees by 100)
 * @param {String} currency - Currency code (default: INR)
 * @param {String} receipt - Unique receipt ID
 * @returns {Promise<Object>} Razorpay order object
 */
export const createRazorpayOrder = async (amount, currency = 'INR', receipt) => {
  try {
    const razorpayInstance = getRazorpayInstance();
    if (!razorpayInstance) {
      throw new Error('Razorpay not configured');
    }

    const options = {
      amount: Math.round(amount * 100), // Convert to paise
      currency,
      receipt,
      payment_capture: 1 // Auto capture payment
    };

    const order = await razorpayInstance.orders.create(options);
    return order;
  } catch (error) {
    console.error('Razorpay order creation error:', error);
    throw new Error('Failed to create Razorpay order');
  }
};

/**
 * Verify Razorpay payment signature
 * @param {String} razorpayOrderId - Razorpay order ID
 * @param {String} razorpayPaymentId - Razorpay payment ID
 * @param {String} razorpaySignature - Razorpay signature
 * @returns {Boolean} True if signature is valid
 */
export const verifyRazorpaySignature = (razorpayOrderId, razorpayPaymentId, razorpaySignature) => {
  try {
    const body = razorpayOrderId + '|' + razorpayPaymentId;
    
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    return expectedSignature === razorpaySignature;
  } catch (error) {
    console.error('Signature verification error:', error);
    return false;
  }
};

/**
 * Verify Razorpay webhook signature
 * @param {String} webhookBody - Raw webhook body
 * @param {String} webhookSignature - Signature from X-Razorpay-Signature header
 * @returns {Boolean} True if webhook signature is valid
 */
export const verifyWebhookSignature = (webhookBody, webhookSignature) => {
  try {
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
      .update(webhookBody)
      .digest('hex');

    return expectedSignature === webhookSignature;
  } catch (error) {
    console.error('Webhook signature verification error:', error);
    return false;
  }
};

/**
 * Fetch payment details from Razorpay
 * @param {String} paymentId - Razorpay payment ID
 * @returns {Promise<Object>} Payment details
 */
export const fetchPaymentDetails = async (paymentId) => {
  try {
    const razorpayInstance = getRazorpayInstance();
    if (!razorpayInstance) {
      throw new Error('Razorpay not configured');
    }

    const payment = await razorpayInstance.payments.fetch(paymentId);
    return payment;
  } catch (error) {
    console.error('Error fetching payment details:', error);
    throw new Error('Failed to fetch payment details');
  }
};

export default getRazorpayInstance;

// Made with Bob