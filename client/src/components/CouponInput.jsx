import { useState } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';

const CouponInput = ({ orderAmount, categories, onCouponApplied, onCouponRemoved }) => {
  const [couponCode, setCouponCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState(null);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error('Please enter a coupon code');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/coupons/validate', {
        code: couponCode.toUpperCase(),
        orderAmount,
        categories
      });

      const { coupon, discount } = response.data;
      setAppliedCoupon({ ...coupon, discount });
      onCouponApplied(coupon.code, discount);
      toast.success(`Coupon applied! You saved ₹${discount}`);
    } catch (error) {
      const message = error.response?.data?.message || 'Invalid coupon code';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    onCouponRemoved();
    toast.info('Coupon removed');
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-3">Apply Coupon</h3>
      
      {!appliedCoupon ? (
        <div className="flex gap-2">
          <input
            type="text"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
            placeholder="Enter coupon code"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            disabled={loading}
          />
          <button
            onClick={handleApplyCoupon}
            disabled={loading || !couponCode.trim()}
            className="btn-primary px-6 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Applying...
              </span>
            ) : (
              'Apply'
            )}
          </button>
        </div>
      ) : (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <svg
                  className="w-5 h-5 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="font-semibold text-green-900">
                  {appliedCoupon.code}
                </span>
              </div>
              <p className="text-sm text-green-700 mb-2">
                {appliedCoupon.description}
              </p>
              <p className="text-lg font-bold text-green-900">
                You saved ₹{appliedCoupon.discount}!
              </p>
            </div>
            <button
              onClick={handleRemoveCoupon}
              className="text-red-600 hover:text-red-700 p-1"
              title="Remove coupon"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CouponInput;

// Made with Bob
