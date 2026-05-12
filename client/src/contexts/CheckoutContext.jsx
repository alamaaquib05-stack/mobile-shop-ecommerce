import { createContext, useState, useContext } from 'react';

const CheckoutContext = createContext(null);

export const CheckoutProvider = ({ children }) => {
  const [deliveryAddress, setDeliveryAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [orderId, setOrderId] = useState(null);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponDiscount, setCouponDiscount] = useState(0);

  const clearCheckout = () => {
    setDeliveryAddress(null);
    setPaymentMethod(null);
    setOrderId(null);
    setAppliedCoupon(null);
    setCouponDiscount(0);
  };

  const applyCoupon = (couponCode, discount) => {
    setAppliedCoupon(couponCode);
    setCouponDiscount(discount);
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponDiscount(0);
  };

  const value = {
    deliveryAddress,
    setDeliveryAddress,
    paymentMethod,
    setPaymentMethod,
    orderId,
    setOrderId,
    appliedCoupon,
    couponDiscount,
    applyCoupon,
    removeCoupon,
    clearCheckout
  };

  return (
    <CheckoutContext.Provider value={value}>
      {children}
    </CheckoutContext.Provider>
  );
};

export const useCheckout = () => {
  const context = useContext(CheckoutContext);
  if (!context) {
    throw new Error('useCheckout must be used within CheckoutProvider');
  }
  return context;
};

export default CheckoutContext;

// Made with Bob
