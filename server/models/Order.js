import mongoose from 'mongoose';

const addressSchema = new mongoose.Schema({
  fullName: String,
  phone: String,
  addressLine1: String,
  addressLine2: String,
  city: String,
  state: String,
  pincode: String,
});

const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
      unique: true,
    },
    buyer: {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null, // Nullable for guest orders
      },
      name: {
        type: String,
        required: true,
      },
      email: {
        type: String,
        required: true,
      },
      phone: {
        type: String,
        required: true,
      },
    },
    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        name: {
          type: String,
          required: true,
        },
        image: String,
        price: {
          type: Number,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        subtotal: {
          type: Number,
          required: true,
        },
      },
    ],
    deliveryAddress: {
      type: addressSchema,
      required: true,
    },
    pricing: {
      subtotal: {
        type: Number,
        required: true,
      },
      shippingCharge: {
        type: Number,
        default: 0,
      },
      discount: {
        type: Number,
        default: 0,
      },
      total: {
        type: Number,
        required: true,
      },
    },
    payment: {
      mode: {
        type: String,
        enum: ['gateway', 'manual_upi'],
        required: true,
      },
      // Gateway fields (Razorpay)
      gatewayProvider: {
        type: String,
        enum: ['razorpay'],
        default: null,
      },
      razorpayOrderId: String,
      razorpayPaymentId: String,
      razorpaySignature: String,
      // Manual UPI fields
      upiMethod: {
        type: String,
        enum: ['phonepe', 'googlepay', 'paytm', 'upi'],
        default: null,
      },
      upiId: String,
      utrNumber: String,
      // Common fields
      amount: {
        type: Number,
        required: true,
      },
      currency: {
        type: String,
        default: 'INR',
      },
      status: {
        type: String,
        enum: ['pending', 'verified', 'failed', 'refunded'],
        default: 'pending',
      },
      paidAt: Date,
    },
    couponCode: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: [
        'payment_pending',
        'confirmed',
        'processing',
        'shipped',
        'delivered',
        'cancelled',
      ],
      default: 'payment_pending',
    },
    trackingNumber: String,
    notes: String,
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    verifiedAt: Date,
  },
  {
    timestamps: true,
  }
);

// Add indexes
orderSchema.index({ orderId: 1 });
orderSchema.index({ 'buyer.email': 1 });
orderSchema.index({ 'buyer.userId': 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ 'payment.status': 1 });
orderSchema.index({ createdAt: -1 });

const Order = mongoose.model('Order', orderSchema);

export default Order;

// Made with Bob
