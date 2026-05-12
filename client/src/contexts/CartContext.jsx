import { createContext, useState, useEffect, useContext } from 'react';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    const storedCart = localStorage.getItem('cart');
    if (storedCart) {
      setCart(JSON.parse(storedCart));
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  // Add item to cart
  const addToCart = (product, quantity = 1) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item._id === product._id);
      
      if (existingItem) {
        // Update quantity if item already exists
        return prevCart.map((item) =>
          item._id === product._id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        // Add new item
        return [
          ...prevCart,
          {
            _id: product._id,
            name: product.name,
            slug: product.slug,
            price: product.discountPrice || product.price,
            image: product.images?.[0]?.url || '',
            stock: product.stock,
            quantity,
          },
        ];
      }
    });
  };

  // Remove item from cart
  const removeFromCart = (productId) => {
    setCart((prevCart) => prevCart.filter((item) => item._id !== productId));
  };

  // Update item quantity
  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    setCart((prevCart) =>
      prevCart.map((item) =>
        item._id === productId ? { ...item, quantity } : item
      )
    );
  };

  // Clear entire cart
  const clearCart = () => {
    setCart([]);
  };

  // Get cart item count
  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  // Get cart subtotal
  const cartSubtotal = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  // Calculate shipping (free above ₹499, else ₹49)
  const shippingCharge = cartSubtotal >= 499 ? 0 : 49;

  // Calculate total
  const cartTotal = cartSubtotal + shippingCharge;

  // Check if product is in cart
  const isInCart = (productId) => {
    return cart.some((item) => item._id === productId);
  };

  // Get item quantity in cart
  const getItemQuantity = (productId) => {
    const item = cart.find((item) => item._id === productId);
    return item?.quantity || 0;
  };

  // Toggle cart drawer
  const toggleCart = () => {
    setIsCartOpen(!isCartOpen);
  };

  const value = {
    cart,
    cartCount,
    cartSubtotal,
    shippingCharge,
    cartTotal,
    isCartOpen,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    isInCart,
    getItemQuantity,
    toggleCart,
    setIsCartOpen,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

// Custom hook to use cart context
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};

export default CartContext;

// Made with Bob
