import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { toast } from 'react-toastify';

const MyOrders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await api.get('/orders/my/orders');
      setOrders(response.data.orders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Error loading orders');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      payment_pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      confirmed: 'bg-green-100 text-green-800 border-green-200',
      processing: 'bg-blue-100 text-blue-800 border-blue-200',
      shipped: 'bg-purple-100 text-purple-800 border-purple-200',
      delivered: 'bg-green-100 text-green-800 border-green-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getPaymentStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      verified: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status) => {
    const texts = {
      payment_pending: 'Payment Pending',
      confirmed: 'Confirmed',
      processing: 'Processing',
      shipped: 'Shipped',
      delivered: 'Delivered',
      cancelled: 'Cancelled'
    };
    return texts[status] || status;
  };

  const toggleOrderExpand = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
          <p className="text-gray-600 mt-2">
            View and track all your orders
          </p>
        </div>

        {/* Orders List */}
        {orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="text-6xl mb-4">📦</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Orders Yet</h2>
            <p className="text-gray-600 mb-6">
              You haven't placed any orders yet. Start shopping now!
            </p>
            <Link to="/products" className="btn-primary inline-block">
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order._id}
                className="bg-white rounded-lg shadow-sm overflow-hidden"
              >
                {/* Order Header */}
                <div
                  className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => toggleOrderExpand(order._id)}
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {order.orderId}
                        </h3>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                            order.status
                          )}`}
                        >
                          {getStatusText(order.status)}
                        </span>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(
                            order.payment.status
                          )}`}
                        >
                          {order.payment.status === 'pending'
                            ? 'Payment Pending'
                            : 'Paid'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        Placed on {formatDate(order.createdAt)}
                      </p>
                      <p className="text-sm text-gray-600">
                        {order.items.length} item(s) • {formatPrice(order.pricing.total)}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <Link
                        to={`/order-confirmation/${order.orderId}`}
                        className="btn-secondary text-sm"
                        onClick={(e) => e.stopPropagation()}
                      >
                        View Details
                      </Link>
                      <button className="text-gray-400 hover:text-gray-600">
                        {expandedOrder === order._id ? (
                          <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 15l7-7 7 7"
                            />
                          </svg>
                        ) : (
                          <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded Order Details */}
                {expandedOrder === order._id && (
                  <div className="border-t bg-gray-50 p-6">
                    {/* Items */}
                    <div className="mb-6">
                      <h4 className="font-semibold text-gray-900 mb-3">Order Items</h4>
                      <div className="space-y-3">
                        {order.items.map((item, index) => (
                          <div key={index} className="flex gap-4 bg-white p-3 rounded-lg">
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
                    </div>

                    {/* Delivery Address */}
                    <div className="mb-6">
                      <h4 className="font-semibold text-gray-900 mb-3">Delivery Address</h4>
                      <div className="bg-white p-4 rounded-lg">
                        <p className="font-medium text-gray-900">
                          {order.deliveryAddress.fullName}
                        </p>
                        <p className="text-sm text-gray-600">{order.deliveryAddress.phone}</p>
                        <p className="text-sm text-gray-600 mt-2">
                          {order.deliveryAddress.addressLine1}
                          {order.deliveryAddress.addressLine2 &&
                            `, ${order.deliveryAddress.addressLine2}`}
                        </p>
                        <p className="text-sm text-gray-600">
                          {order.deliveryAddress.city}, {order.deliveryAddress.state} -{' '}
                          {order.deliveryAddress.pincode}
                        </p>
                      </div>
                    </div>

                    {/* Payment Info */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Payment Information</h4>
                      <div className="bg-white p-4 rounded-lg">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600">Payment Mode</p>
                            <p className="font-medium text-gray-900">
                              {order.payment.mode === 'gateway' ? 'Razorpay' : 'Manual UPI'}
                            </p>
                          </div>
                          {order.payment.mode === 'manual_upi' && (
                            <>
                              <div>
                                <p className="text-gray-600">UPI Method</p>
                                <p className="font-medium text-gray-900 capitalize">
                                  {order.payment.upiMethod}
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-600">UTR Number</p>
                                <p className="font-medium text-gray-900">
                                  {order.payment.utrNumber}
                                </p>
                              </div>
                            </>
                          )}
                          <div>
                            <p className="text-gray-600">Amount Paid</p>
                            <p className="font-medium text-gray-900">
                              {formatPrice(order.payment.amount)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Tracking Number */}
                    {order.trackingNumber && (
                      <div className="mt-4">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <p className="text-sm text-blue-800">
                            <strong>Tracking Number:</strong> {order.trackingNumber}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrders;

// Made with Bob
