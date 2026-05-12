import { useState } from 'react';
import { toast } from 'react-toastify';
import api from '../services/api';

const TrackOrder = () => {
  const [orderId, setOrderId] = useState('');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const handleTrackOrder = async (e) => {
    e.preventDefault();
    
    if (!orderId.trim()) {
      toast.error('Please enter an Order ID');
      return;
    }

    setLoading(true);
    setNotFound(false);
    setOrder(null);

    try {
      const response = await api.get(`/orders/${orderId}`);
      setOrder(response.data.order);
    } catch (error) {
      console.error('Track order error:', error);
      if (error.response?.status === 404) {
        setNotFound(true);
        toast.error('Order not found. Please check your Order ID.');
      } else {
        toast.error('Failed to fetch order details');
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusSteps = () => {
    const steps = [
      { key: 'payment_pending', label: 'Payment Pending', icon: '💳' },
      { key: 'confirmed', label: 'Confirmed', icon: '✅' },
      { key: 'processing', label: 'Processing', icon: '📦' },
      { key: 'shipped', label: 'Shipped', icon: '🚚' },
      { key: 'delivered', label: 'Delivered', icon: '🎉' }
    ];

    const currentIndex = steps.findIndex(step => step.key === order?.status);
    
    return steps.map((step, index) => ({
      ...step,
      completed: index <= currentIndex,
      active: index === currentIndex
    }));
  };

  const getPaymentStatusBadge = () => {
    if (!order) return null;

    const status = order.payment.status;
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      verified: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800'
    };

    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${colors[status] || 'bg-gray-100 text-gray-800'}`}>
        {status === 'pending' ? '⏳ Pending Verification' : 
         status === 'verified' ? '✓ Payment Verified' : 
         '✗ Payment Failed'}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Track Your Order</h1>
          <p className="text-gray-600">Enter your Order ID to check the status</p>
        </div>

        {/* Search Form */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <form onSubmit={handleTrackOrder} className="flex gap-4">
            <input
              type="text"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value.toUpperCase())}
              placeholder="Enter Order ID (e.g., ORD-20260511-0042)"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium transition-colors"
            >
              {loading ? 'Tracking...' : 'Track Order'}
            </button>
          </form>
        </div>

        {/* Not Found Message */}
        {notFound && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <div className="text-4xl mb-3">🔍</div>
            <h3 className="text-lg font-semibold text-red-900 mb-2">Order Not Found</h3>
            <p className="text-red-700">
              We couldn't find an order with ID: <strong>{orderId}</strong>
            </p>
            <p className="text-red-600 text-sm mt-2">
              Please check your Order ID and try again.
            </p>
          </div>
        )}

        {/* Order Details */}
        {order && (
          <div className="space-y-6">
            {/* Order Info Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">
                    Order {order.orderId}
                  </h2>
                  <p className="text-gray-600">
                    Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                </div>
                {getPaymentStatusBadge()}
              </div>

              {/* Status Progress Bar */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Status</h3>
                <div className="relative">
                  {/* Progress Line */}
                  <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200">
                    <div 
                      className="h-full bg-green-500 transition-all duration-500"
                      style={{ 
                        width: `${(getStatusSteps().filter(s => s.completed).length - 1) / (getStatusSteps().length - 1) * 100}%` 
                      }}
                    />
                  </div>

                  {/* Status Steps */}
                  <div className="relative flex justify-between">
                    {getStatusSteps().map((step, index) => (
                      <div key={step.key} className="flex flex-col items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg mb-2 transition-all ${
                          step.completed 
                            ? 'bg-green-500 text-white' 
                            : 'bg-gray-200 text-gray-500'
                        } ${step.active ? 'ring-4 ring-green-200' : ''}`}>
                          {step.icon}
                        </div>
                        <span className={`text-xs font-medium text-center ${
                          step.completed ? 'text-gray-900' : 'text-gray-500'
                        }`}>
                          {step.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Tracking Number */}
              {order.trackingNumber && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">📦</span>
                    <div>
                      <p className="text-sm text-blue-900 font-medium">Tracking Number</p>
                      <p className="text-lg font-bold text-blue-700">{order.trackingNumber}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Payment Info */}
              <div className="border-t pt-4 mb-4">
                <h4 className="font-semibold text-gray-900 mb-2">Payment Details</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Payment Mode:</span>
                    <span className="ml-2 font-medium">
                      {order.payment.mode === 'gateway' ? 'Razorpay Gateway' : 'Manual UPI'}
                    </span>
                  </div>
                  {order.payment.mode === 'manual_upi' && order.payment.utrNumber && (
                    <div>
                      <span className="text-gray-600">UTR Number:</span>
                      <span className="ml-2 font-medium">{order.payment.utrNumber}</span>
                    </div>
                  )}
                  <div>
                    <span className="text-gray-600">Amount Paid:</span>
                    <span className="ml-2 font-medium">₹{order.pricing.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Items */}
              <div className="border-t pt-4">
                <h4 className="font-semibold text-gray-900 mb-3">Order Items</h4>
                <div className="space-y-3">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex gap-4">
                      <img 
                        src={item.image || '/placeholder.png'} 
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{item.name}</p>
                        <p className="text-sm text-gray-600">
                          Qty: {item.quantity} × ₹{item.price.toFixed(2)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          ₹{item.subtotal.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery Address */}
              <div className="border-t pt-4 mt-4">
                <h4 className="font-semibold text-gray-900 mb-2">Delivery Address</h4>
                <div className="text-sm text-gray-700">
                  <p className="font-medium">{order.deliveryAddress.fullName}</p>
                  <p>{order.deliveryAddress.phone}</p>
                  <p>{order.deliveryAddress.addressLine1}</p>
                  {order.deliveryAddress.addressLine2 && (
                    <p>{order.deliveryAddress.addressLine2}</p>
                  )}
                  <p>
                    {order.deliveryAddress.city}, {order.deliveryAddress.state} - {order.deliveryAddress.pincode}
                  </p>
                </div>
              </div>
            </div>

            {/* Help Section */}
            <div className="bg-gray-100 rounded-lg p-6 text-center">
              <h3 className="font-semibold text-gray-900 mb-2">Need Help?</h3>
              <p className="text-gray-600 text-sm mb-4">
                If you have any questions about your order, please contact our support team.
              </p>
              <a 
                href="mailto:support@mobileshop.com" 
                className="text-orange-600 hover:text-orange-700 font-medium"
              >
                support@mobileshop.com
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrackOrder;

// Made with Bob
