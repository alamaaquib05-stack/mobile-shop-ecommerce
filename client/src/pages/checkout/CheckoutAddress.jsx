import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { useCheckout } from '../../contexts/CheckoutContext';
import api from '../../services/api';
import { toast } from 'react-toastify';
import CouponInput from '../../components/CouponInput';

const CheckoutAddress = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { cart, cartSubtotal, shippingCharge, cartTotal } = useCart();
  const { setDeliveryAddress, applyCoupon, removeCoupon, couponDiscount } = useCheckout();

  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: ''
  });

  const indianStates = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
    'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
    'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
    'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
    'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
    'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'
  ];

  // Redirect if cart is empty
  useEffect(() => {
    if (cart.length === 0) {
      toast.error('Your cart is empty');
      navigate('/products');
    }
  }, [cart, navigate]);

  // Fetch saved addresses for logged-in users
  useEffect(() => {
    if (isAuthenticated) {
      fetchSavedAddresses();
    } else {
      setShowNewAddressForm(true);
    }
  }, [isAuthenticated]);

  const fetchSavedAddresses = async () => {
    try {
      const response = await api.get('/auth/me/addresses');
      setSavedAddresses(response.data.addresses);
      
      // Auto-select default address
      const defaultAddress = response.data.addresses.find(addr => addr.isDefault);
      if (defaultAddress) {
        setSelectedAddressId(defaultAddress._id);
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const validateForm = () => {
    const { fullName, email, phone, addressLine1, city, state, pincode } = formData;

    if (!fullName || !email || !phone || !addressLine1 || !city || !state || !pincode) {
      toast.error('Please fill in all required fields');
      return false;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address');
      return false;
    }

    if (!/^\d{10}$/.test(phone)) {
      toast.error('Phone number must be 10 digits');
      return false;
    }

    if (!/^\d{6}$/.test(pincode)) {
      toast.error('Pincode must be 6 digits');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      // Save address for logged-in users
      if (isAuthenticated) {
        await api.post('/auth/me/addresses', formData);
        toast.success('Address saved successfully');
      }

      // Set delivery address in checkout context
      setDeliveryAddress(formData);

      // Navigate to payment page
      navigate('/checkout/payment');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error saving address');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSavedAddress = () => {
    if (!selectedAddressId) {
      toast.error('Please select an address');
      return;
    }

    const address = savedAddresses.find(addr => addr._id === selectedAddressId);
    setDeliveryAddress(address);
    navigate('/checkout/payment');
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center">
            <div className="flex items-center">
              <div className="flex items-center text-primary">
                <div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-semibold">
                  1
                </div>
                <span className="ml-2 font-medium">Address</span>
              </div>
              <div className="w-16 h-1 bg-gray-300 mx-4"></div>
              <div className="flex items-center text-gray-400">
                <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center font-semibold">
                  2
                </div>
                <span className="ml-2 font-medium">Payment</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Address Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Delivery Address</h2>

              {/* Saved Addresses for Logged-in Users */}
              {isAuthenticated && savedAddresses.length > 0 && !showNewAddressForm && (
                <div className="space-y-4">
                  {savedAddresses.map((address) => (
                    <label
                      key={address._id}
                      className={`block border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                        selectedAddressId === address._id
                          ? 'border-primary bg-primary/5'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-start">
                        <input
                          type="radio"
                          name="address"
                          checked={selectedAddressId === address._id}
                          onChange={() => setSelectedAddressId(address._id)}
                          className="mt-1 mr-3"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-gray-900">{address.fullName}</span>
                            {address.isDefault && (
                              <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded">
                                Default
                              </span>
                            )}
                          </div>
                          <p className="text-gray-600 text-sm">{address.phone}</p>
                          <p className="text-gray-600 text-sm mt-2">
                            {address.addressLine1}
                            {address.addressLine2 && `, ${address.addressLine2}`}
                          </p>
                          <p className="text-gray-600 text-sm">
                            {address.city}, {address.state} - {address.pincode}
                          </p>
                        </div>
                      </div>
                    </label>
                  ))}

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={handleSelectSavedAddress}
                      className="btn-primary flex-1"
                    >
                      Deliver Here
                    </button>
                    <button
                      onClick={() => setShowNewAddressForm(true)}
                      className="btn-secondary"
                    >
                      Add New Address
                    </button>
                  </div>
                </div>
              )}

              {/* New Address Form */}
              {(showNewAddressForm || !isAuthenticated || savedAddresses.length === 0) && (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {isAuthenticated && savedAddresses.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setShowNewAddressForm(false)}
                      className="text-primary hover:text-primary/80 text-sm font-medium mb-4"
                    >
                      ← Back to saved addresses
                    </button>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        required
                        className="input-field"
                        placeholder="Enter your full name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="input-field"
                        placeholder="your.email@example.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      maxLength="10"
                      className="input-field"
                      placeholder="10-digit mobile number"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address Line 1 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="addressLine1"
                      value={formData.addressLine1}
                      onChange={handleChange}
                      required
                      className="input-field"
                      placeholder="House No., Building Name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address Line 2
                    </label>
                    <input
                      type="text"
                      name="addressLine2"
                      value={formData.addressLine2}
                      onChange={handleChange}
                      className="input-field"
                      placeholder="Road Name, Area, Colony (Optional)"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        City <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        required
                        className="input-field"
                        placeholder="City"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        State <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        required
                        className="input-field"
                      >
                        <option value="">Select State</option>
                        {indianStates.map((state) => (
                          <option key={state} value={state}>
                            {state}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Pincode <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="pincode"
                        value={formData.pincode}
                        onChange={handleChange}
                        required
                        maxLength="6"
                        className="input-field"
                        placeholder="6-digit PIN"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Saving...' : 'Continue to Payment'}
                  </button>
                </form>
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

              {/* Coupon Input */}
              <div className="mb-4">
                <CouponInput
                  orderAmount={cartSubtotal}
                  categories={cart.map(item => item.category).filter(Boolean)}
                  onCouponApplied={applyCoupon}
                  onCouponRemoved={removeCoupon}
                />
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
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Coupon Discount</span>
                    <span className="font-medium">-{formatPrice(couponDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-semibold border-t pt-2">
                  <span className="text-gray-900">Total</span>
                  <span className="text-gray-900">{formatPrice(cartTotal - couponDiscount)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutAddress;

// Made with Bob
