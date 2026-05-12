import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import { toast } from 'react-toastify';

const AdminOrders = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailDrawer, setShowDetailDrawer] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const statusFilter = searchParams.get('status') || 'all';

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = statusFilter !== 'all' ? `?status=${statusFilter}` : '';
      const response = await api.get(`/orders${params}`);
      setOrders(response.data.orders || []);
    } catch (error) {
      console.error('Fetch orders error:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyPayment = async (orderId) => {
    if (!window.confirm('Have you verified the payment in your UPI app? This action will confirm the order.')) {
      return;
    }

    try {
      setVerifying(true);
      await api.put(`/orders/${orderId}/verify-payment`);
      toast.success('Payment verified successfully!');
      fetchOrders();
      if (selectedOrder?._id === orderId) {
        const response = await api.get(`/orders/${selectedOrder.orderId}`);
        setSelectedOrder(response.data.order);
      }
    } catch (error) {
      console.error('Verify payment error:', error);
      toast.error(error.response?.data?.message || 'Failed to verify payment');
    } finally {
      setVerifying(false);
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      setUpdatingStatus(true);
      await api.put(`/orders/${orderId}/status`, { status: newStatus });
      toast.success('Order status updated successfully!');
      fetchOrders();
      if (selectedOrder?._id === orderId) {
        const response = await api.get(`/orders/${selectedOrder.orderId}`);
        setSelectedOrder(response.data.order);
      }
    } catch (error) {
      console.error('Update status error:', error);
      toast.error(error.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const openOrderDetail = async (order) => {
    setSelectedOrder(order);
    setShowDetailDrawer(true);
  };

  const closeOrderDetail = () => {
    setShowDetailDrawer(false);
    setTimeout(() => setSelectedOrder(null), 300);
  };

  const getStatusBadge = (status) => {
    const colors = {
      payment_pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-green-100 text-green-800',
      processing: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status] || 'bg-gray-100 text-gray-800'}`}>
        {status.replace('_', ' ').toUpperCase()}
      </span>
    );
  };

  const getPaymentStatusBadge = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      verified: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status] || 'bg-gray-100 text-gray-800'}`}>
        {status.toUpperCase()}
      </span>
    );
  };

  const getPaymentModeBadge = (mode) => {
    return mode === 'gateway' ? (
      <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
        Razorpay · Auto-verified
      </span>
    ) : (
      <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
        Manual UPI
      </span>
    );
  };

  const filterButtons = [
    { key: 'all', label: 'All Orders' },
    { key: 'payment_pending', label: 'Payment Pending' },
    { key: 'confirmed', label: 'Confirmed' },
    { key: 'processing', label: 'Processing' },
    { key: 'shipped', label: 'Shipped' },
    { key: 'delivered', label: 'Delivered' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Order Management</h2>
          <p className="text-gray-600">Manage and track all customer orders</p>
        </div>
        <div className="text-sm text-gray-600">
          Total: <span className="font-semibold">{orders.length}</span> orders
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-lg shadow p-2 flex flex-wrap gap-2">
        {filterButtons.map((filter) => (
          <button
            key={filter.key}
            onClick={() => setSearchParams(filter.key === 'all' ? {} : { status: filter.key })}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              statusFilter === filter.key
                ? 'bg-orange-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No orders found</h3>
            <p className="mt-1 text-sm text-gray-500">No orders match the selected filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Items
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment Mode
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => openOrderDetail(order)}
                        className="text-sm font-medium text-orange-600 hover:text-orange-700"
                      >
                        {order.orderId}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{order.buyer.name}</div>
                      <div className="text-sm text-gray-500">{order.buyer.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.items.length} item(s)
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      ₹{order.pricing.total.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getPaymentModeBadge(order.payment.mode)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getPaymentStatusBadge(order.payment.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(order.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString('en-IN')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => openOrderDetail(order)}
                        className="text-orange-600 hover:text-orange-700 font-medium"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Detail Drawer */}
      {showDetailDrawer && selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={closeOrderDetail}></div>
          
          <div className="absolute right-0 top-0 bottom-0 w-full max-w-2xl bg-white shadow-xl overflow-y-auto">
            {/* Drawer Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Order Details</h3>
                <p className="text-sm text-gray-600">{selectedOrder.orderId}</p>
              </div>
              <button
                onClick={closeOrderDetail}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Drawer Content */}
            <div className="p-6 space-y-6">
              {/* Customer Info */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Customer Information</h4>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Name:</span>
                    <span className="font-medium">{selectedOrder.buyer.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Email:</span>
                    <span className="font-medium">{selectedOrder.buyer.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Phone:</span>
                    <span className="font-medium">{selectedOrder.buyer.phone}</span>
                  </div>
                </div>
              </div>

              {/* Payment Details */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Payment Details</h4>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Payment Mode:</span>
                    {getPaymentModeBadge(selectedOrder.payment.mode)}
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Payment Status:</span>
                    {getPaymentStatusBadge(selectedOrder.payment.status)}
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount:</span>
                    <span className="font-medium">₹{selectedOrder.payment.amount.toFixed(2)}</span>
                  </div>

                  {/* Manual UPI Details */}
                  {selectedOrder.payment.mode === 'manual_upi' && (
                    <>
                      <div className="border-t pt-3 mt-3">
                        <div className="flex justify-between mb-2">
                          <span className="text-gray-600">UPI Method:</span>
                          <span className="font-medium capitalize">{selectedOrder.payment.upiMethod}</span>
                        </div>
                        {selectedOrder.payment.utrNumber && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">UTR Number:</span>
                            <span className="font-mono font-medium">{selectedOrder.payment.utrNumber}</span>
                          </div>
                        )}
                      </div>

                      {/* Verify Payment Button */}
                      {selectedOrder.payment.status === 'pending' && (
                        <button
                          onClick={() => handleVerifyPayment(selectedOrder._id)}
                          disabled={verifying}
                          className="w-full mt-3 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium transition-colors"
                        >
                          {verifying ? 'Verifying...' : '✓ Verify Payment'}
                        </button>
                      )}
                    </>
                  )}

                  {/* Gateway Details */}
                  {selectedOrder.payment.mode === 'gateway' && selectedOrder.payment.razorpayPaymentId && (
                    <div className="border-t pt-3 mt-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Payment ID:</span>
                        <span className="font-mono text-xs">{selectedOrder.payment.razorpayPaymentId}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Order Items</h4>
                <div className="space-y-3">
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="flex gap-4 bg-gray-50 rounded-lg p-3">
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
                        <p className="font-semibold text-gray-900">₹{item.subtotal.toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pricing Summary */}
                <div className="mt-4 bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal:</span>
                    <span>₹{selectedOrder.pricing.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping:</span>
                    <span>₹{selectedOrder.pricing.shippingCharge.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-lg border-t pt-2">
                    <span>Total:</span>
                    <span>₹{selectedOrder.pricing.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Delivery Address */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Delivery Address</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="font-medium text-gray-900">{selectedOrder.deliveryAddress.fullName}</p>
                  <p className="text-gray-700 mt-1">{selectedOrder.deliveryAddress.phone}</p>
                  <p className="text-gray-700 mt-2">{selectedOrder.deliveryAddress.addressLine1}</p>
                  {selectedOrder.deliveryAddress.addressLine2 && (
                    <p className="text-gray-700">{selectedOrder.deliveryAddress.addressLine2}</p>
                  )}
                  <p className="text-gray-700">
                    {selectedOrder.deliveryAddress.city}, {selectedOrder.deliveryAddress.state} - {selectedOrder.deliveryAddress.pincode}
                  </p>
                </div>
              </div>

              {/* Update Order Status */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Update Order Status</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="mb-3">
                    <span className="text-sm text-gray-600">Current Status: </span>
                    {getStatusBadge(selectedOrder.status)}
                  </div>
                  <select
                    onChange={(e) => handleUpdateStatus(selectedOrder._id, e.target.value)}
                    disabled={updatingStatus}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    defaultValue=""
                  >
                    <option value="" disabled>Select new status...</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;

// Made with Bob
