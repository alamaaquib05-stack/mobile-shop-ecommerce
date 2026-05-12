import { Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';

const CartDrawer = () => {
  const {
    cart,
    cartCount,
    cartSubtotal,
    shippingCharge,
    cartTotal,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    updateQuantity
  } = useCart();

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  const handleQuantityChange = (productId, newQuantity, stock) => {
    if (newQuantity > stock) {
      return; // Don't allow quantity greater than stock
    }
    updateQuantity(productId, newQuantity);
  };

  if (!isCartOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        onClick={() => setIsCartOpen(false)}
      ></div>

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full sm:w-96 bg-white shadow-xl z-50 flex flex-col animate-slide-in">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">
            Shopping Cart ({cartCount})
          </h2>
          <button
            onClick={() => setIsCartOpen(false)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <svg
                className="w-24 h-24 text-gray-300 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Your cart is empty</h3>
              <p className="text-gray-600 mb-4">Add some products to get started!</p>
              <Link
                to="/products"
                onClick={() => setIsCartOpen(false)}
                className="btn-primary"
              >
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map((item) => (
                <div key={item._id} className="flex gap-4 border-b pb-4">
                  {/* Product Image */}
                  <Link
                    to={`/products/${item.slug}`}
                    onClick={() => setIsCartOpen(false)}
                    className="flex-shrink-0"
                  >
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </Link>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/products/${item.slug}`}
                      onClick={() => setIsCartOpen(false)}
                      className="text-sm font-medium text-gray-900 hover:text-primary line-clamp-2"
                    >
                      {item.name}
                    </Link>
                    <p className="text-sm font-semibold text-gray-900 mt-1">
                      {formatPrice(item.price)}
                    </p>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => handleQuantityChange(item._id, item.quantity - 1, item.stock)}
                        className="w-7 h-7 border border-gray-300 rounded hover:bg-gray-50 flex items-center justify-center"
                      >
                        -
                      </button>
                      <span className="text-sm font-medium w-8 text-center">{item.quantity}</span>
                      <button
                        onClick={() => handleQuantityChange(item._id, item.quantity + 1, item.stock)}
                        disabled={item.quantity >= item.stock}
                        className="w-7 h-7 border border-gray-300 rounded hover:bg-gray-50 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        +
                      </button>
                      <button
                        onClick={() => removeFromCart(item._id)}
                        className="ml-auto text-red-600 hover:text-red-700 text-sm"
                      >
                        Remove
                      </button>
                    </div>

                    {/* Stock Warning */}
                    {item.quantity >= item.stock && (
                      <p className="text-xs text-orange-600 mt-1">
                        Max quantity reached
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer - Summary */}
        {cart.length > 0 && (
          <div className="border-t p-4 space-y-3">
            {/* Subtotal */}
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium text-gray-900">{formatPrice(cartSubtotal)}</span>
            </div>

            {/* Shipping */}
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

            {/* Free Shipping Progress */}
            {shippingCharge > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-2">
                <p className="text-xs text-blue-700">
                  Add {formatPrice(499 - cartSubtotal)} more for FREE shipping!
                </p>
                <div className="w-full bg-blue-200 rounded-full h-1.5 mt-1">
                  <div
                    className="bg-blue-600 h-1.5 rounded-full transition-all"
                    style={{ width: `${Math.min((cartSubtotal / 499) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Total */}
            <div className="flex justify-between text-base font-semibold border-t pt-3">
              <span className="text-gray-900">Total</span>
              <span className="text-gray-900">{formatPrice(cartTotal)}</span>
            </div>

            {/* Checkout Button */}
            <Link
              to="/checkout/address"
              onClick={() => setIsCartOpen(false)}
              className="btn-primary w-full text-center block"
            >
              Proceed to Checkout
            </Link>

            {/* Continue Shopping */}
            <button
              onClick={() => setIsCartOpen(false)}
              className="w-full text-center text-sm text-gray-600 hover:text-gray-900"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </>
  );
};

export default CartDrawer;

// Made with Bob
