import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-toastify';

const OrderConfirmation = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await api.get(`/orders/${orderId}`);
        setOrder(response.data.order);
      } catch (error) {
        console.error('Error fetching order:', error);
        toast.error('Error loading order details');
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Order Not Found</h2>
          <Link to="/products" className="btn-primary">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  const isPaymentPending = order.payment.status === 'pending';

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Animation */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
            <svg
              className="w-12 h-12 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {isPaymentPending ? 'Order Placed!' : 'Order Confirmed!'}
          </h1>
          <p className="text-gray-600">
            {isPaymentPending
              ? 'Your order is placed. Payment verification in progress.'
              : 'Thank you for your purchase!'}
          </p>
        </div>

        {/* Order ID Card */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">Your Order ID</p>
            <p className="text-2xl font-bold text-primary mb-4">{order.orderId}</p>
            {isPaymentPending && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  <strong>Payment Verification Pending</strong>
                  <br />
                  We're verifying your payment. You'll receive a confirmation email once verified.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Order Details */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Details</h2>

          {/* Items */}
          <div className="space-y-4 mb-6">
            {order.items.map((item, index) => (
              <div key={index} className="flex gap-4">
                <div className="w-20 h-20 bg-gray-100 rounded flex-shrink-0">
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover rounded"
                    />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{item.name}</p>
                  <p className="text-sm text-gray-600">
                    Qty: {item.quantity} × {formatPrice(item.price)}
                  </p>
                  <p className="text-sm font-medium text-gray-900">
                    {formatPrice(item.subtotal)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Pricing */}
          <div className="border-t pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal</span>
              <span className="text-gray-900">{formatPrice(order.pricing.subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Shipping</span>
              <span className="text-gray-900">
                {order.pricing.shippingCharge === 0 ? (
                  <span className="text-green-600">FREE</span>
                ) : (
                  formatPrice(order.pricing.shippingCharge)
                )}
              </span>
            </div>
            <div className="flex justify-between text-base font-semibold border-t pt-2">
              <span className="text-gray-900">Total</span>
              <span className="text-gray-900">{formatPrice(order.pricing.total)}</span>
            </div>
          </div>
        </div>

        {/* Delivery Address */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Delivery Address</h2>
          <div className="text-gray-700">
            <p className="font-medium">{order.deliveryAddress.fullName}</p>
            <p>{order.deliveryAddress.phone}</p>
            <p className="mt-2">
              {order.deliveryAddress.addressLine1}
              {order.deliveryAddress.addressLine2 && `, ${order.deliveryAddress.addressLine2}`}
            </p>
            <p>
              {order.deliveryAddress.city}, {order.deliveryAddress.state} -{' '}
              {order.deliveryAddress.pincode}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link to="/products" className="btn-primary flex-1 text-center">
            Continue Shopping
          </Link>
          <Link to="/my-orders" className="btn-secondary flex-1 text-center">
            View My Orders
          </Link>
        </div>

        {/* Save Order ID Note */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800 text-center">
            💡 <strong>Tip:</strong> Save your Order ID ({order.orderId}) to track your order
            status
          </p>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;

// Made with Bob
