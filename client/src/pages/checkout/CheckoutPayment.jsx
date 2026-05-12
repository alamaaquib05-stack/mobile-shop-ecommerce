import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { useCheckout } from '../../contexts/CheckoutContext';
import { QRCodeSVG } from 'qrcode.react';
import api from '../../services/api';
import { toast } from 'react-toastify';

const CheckoutPayment = () => {
  const navigate = useNavigate();
  const { cart, cartSubtotal, shippingCharge, cartTotal, clearCart } = useCart();
  const { deliveryAddress, appliedCoupon, couponDiscount } = useCheckout();

  const [selectedUpiApp, setSelectedUpiApp] = useState('');
  const [customUpiId, setCustomUpiId] = useState('');
  const [utrNumber, setUtrNumber] = useState('');
  const [confirmPayment, setConfirmPayment] = useState(false);
  const [loading, setLoading] = useState(false);

  const shopUpiId = 'mobileshop@paytm';
  const shopName = 'MobileShop';

  // Redirect if no delivery address
  if (!deliveryAddress) {
    navigate('/checkout/address');
    return null;
  }

  const upiApps = [
    {
      id: 'phonepe',
      name: 'PhonePe',
      color: 'bg-purple-600',
      hoverColor: 'hover:bg-purple-700',
      icon: '📱'
    },
    {
      id: 'googlepay',
      name: 'Google Pay',
      color: 'bg-blue-600',
      hoverColor: 'hover:bg-blue-700',
      icon: '💳'
    },
    {
      id: 'paytm',
      name: 'Paytm',
      color: 'bg-cyan-600',
      hoverColor: 'hover:bg-cyan-700',
      icon: '💰'
    },
    {
      id: 'upi',
      name: 'Other UPI',
      color: 'bg-gray-600',
      hoverColor: 'hover:bg-gray-700',
      icon: '🏦'
    }
  ];

  // Generate UPI payment URL
  const generateUpiUrl = () => {
    const upiId = selectedUpiApp === 'upi' && customUpiId ? customUpiId : shopUpiId;
    return `upi://pay?pa=${upiId}&pn=${encodeURIComponent(shopName)}&am=${cartTotal}&cu=INR&tn=Order Payment`;
  };

  const handleUpiAppSelect = (appId) => {
    setSelectedUpiApp(appId);
    if (appId !== 'upi') {
      setCustomUpiId('');
    }
  };

  const handleSubmitOrder = async () => {
    // Validate UTR number
    if (!utrNumber || !/^\d{12}$/.test(utrNumber)) {
      toast.error('Please enter a valid 12-digit UTR number');
      return;
    }

    if (!confirmPayment) {
      toast.error('Please confirm that you have made the payment');
      return;
    }

    if (!selectedUpiApp) {
      toast.error('Please select a UPI app');
      return;
    }

    setLoading(true);

    try {
      const orderData = {
        cartItems: cart.map(item => ({
          productId: item._id,
          name: item.name,
          image: item.image,
          price: item.price,
          quantity: item.quantity
        })),
        deliveryAddress,
        buyerInfo: {
          name: deliveryAddress.fullName,
          phone: deliveryAddress.phone,
          email: deliveryAddress.email
        },
        upiMethod: selectedUpiApp,
        upiId: selectedUpiApp === 'upi' ? customUpiId : shopUpiId,
        utrNumber,
        couponCode: appliedCoupon?.code || null,
        couponDiscount: couponDiscount || 0
      };

      const response = await api.post('/payment/manual/confirm', orderData);

      if (response.data.success) {
        toast.success('Order placed successfully!');
        clearCart();
        navigate(`/order-confirmation/${response.data.orderId}`);
      }
    } catch (error) {
      console.error('Order submission error:', error);
      toast.error(error.response?.data?.message || 'Error placing order');
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

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center">
            <div className="flex items-center">
              <div className="flex items-center text-green-600">
                <div className="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center font-semibold">
                  ✓
                </div>
                <span className="ml-2 font-medium">Address</span>
              </div>
              <div className="w-16 h-1 bg-primary mx-4"></div>
              <div className="flex items-center text-primary">
                <div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-semibold">
                  2
                </div>
                <span className="ml-2 font-medium">Payment</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Payment Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Pay via UPI</h2>

              {/* UPI App Selection */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Select UPI App</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {upiApps.map((app) => (
                    <button
                      key={app.id}
                      onClick={() => handleUpiAppSelect(app.id)}
                      className={`${app.color} ${app.hoverColor} ${
                        selectedUpiApp === app.id ? 'ring-4 ring-offset-2 ring-primary' : ''
                      } text-white p-6 rounded-lg transition-all transform hover:scale-105 flex flex-col items-center justify-center gap-2`}
                    >
                      <span className="text-4xl">{app.icon}</span>
                      <span className="font-semibold">{app.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom UPI ID Input */}
              {selectedUpiApp === 'upi' && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Enter UPI ID
                  </label>
                  <input
                    type="text"
                    value={customUpiId}
                    onChange={(e) => setCustomUpiId(e.target.value)}
                    placeholder="yourname@upi"
                    className="input-field"
                  />
                </div>
              )}

              {/* Payment Instructions */}
              {selectedUpiApp && (
                <div className="space-y-6">
                  {/* QR Code */}
                  <div className="bg-gray-50 rounded-lg p-6 text-center">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Scan QR Code to Pay
                    </h3>
                    <div className="inline-block bg-white p-4 rounded-lg shadow-md">
                      <QRCodeSVG
                        value={generateUpiUrl()}
                        size={200}
                        level="H"
                        includeMargin={true}
                      />
                    </div>
                    <p className="text-sm text-gray-600 mt-4">
                      Scan this QR code with any UPI app
                    </p>
                  </div>

                  {/* UPI ID Display */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Pay to UPI ID:</p>
                        <p className="text-lg font-bold text-gray-900">{shopUpiId}</p>
                      </div>
                      <button
                        onClick={() => copyToClipboard(shopUpiId)}
                        className="btn-secondary text-sm"
                      >
                        Copy
                      </button>
                    </div>
                  </div>

                  {/* Amount Display */}
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Amount to Pay:</p>
                        <p className="text-2xl font-bold text-green-700">{formatPrice(cartTotal - couponDiscount)}</p>
                        {couponDiscount > 0 && (
                          <p className="text-xs text-gray-500 mt-1">
                            (Coupon discount: {formatPrice(couponDiscount)})
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => copyToClipboard((cartTotal - couponDiscount).toString())}
                        className="btn-secondary text-sm"
                      >
                        Copy
                      </button>
                    </div>
                  </div>

                  {/* UTR Number Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Transaction Reference Number (UTR) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={utrNumber}
                      onChange={(e) => setUtrNumber(e.target.value.replace(/\D/g, '').slice(0, 12))}
                      placeholder="Enter 12-digit UTR number"
                      maxLength="12"
                      className="input-field"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      You can find the UTR number in your UPI app's transaction history
                    </p>
                  </div>

                  {/* Confirmation Checkbox */}
                  <div className="flex items-start">
                    <input
                      type="checkbox"
                      id="confirmPayment"
                      checked={confirmPayment}
                      onChange={(e) => setConfirmPayment(e.target.checked)}
                      className="mt-1 mr-3"
                    />
                    <label htmlFor="confirmPayment" className="text-sm text-gray-700">
                      I confirm that I have paid <strong>{formatPrice(cartTotal)}</strong> to{' '}
                      <strong>{shopUpiId}</strong> and entered the correct UTR number
                    </label>
                  </div>

                  {/* Submit Button */}
                  <button
                    onClick={handleSubmitOrder}
                    disabled={loading || !utrNumber || !confirmPayment}
                    className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Placing Order...' : 'Place Order'}
                  </button>

                  {/* Info Note */}
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-sm text-yellow-800">
                      <strong>Note:</strong> Your order will be confirmed after our team verifies
                      your payment. You will receive a confirmation email once verified.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-20">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>

              {/* Cart Items */}
              <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                {cart.map((item) => (
                  <div key={item._id} className="flex gap-3">
                    <div className="w-16 h-16 bg-gray-100 rounded flex-shrink-0">
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover rounded"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 line-clamp-2">
                        {item.name}
                      </p>
                      <p className="text-sm text-gray-600">
                        Qty: {item.quantity} × {formatPrice(item.price)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Price Breakdown */}
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium text-gray-900">{formatPrice(cartSubtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium text-gray-900">
                    {shippingCharge === 0 ? (
                      <span className="text-green-600">FREE</span>
                    ) : (
                      formatPrice(shippingCharge)
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-base font-semibold border-t pt-2">
                  <span className="text-gray-900">Total</span>
                  <span className="text-gray-900">{formatPrice(cartTotal)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPayment;

// Made with Bob
