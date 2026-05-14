import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { CheckoutProvider } from './contexts/CheckoutContext';
import { WishlistProvider } from './contexts/WishlistContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Components
import Header from './components/Header';
import CartDrawer from './components/CartDrawer';
import ErrorBoundary from './components/common/ErrorBoundary';

// Auth pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Protected route wrappers
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

// Pages
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Wishlist from './pages/Wishlist';

// Checkout pages
import CheckoutAddress from './pages/checkout/CheckoutAddress';
import CheckoutPayment from './pages/checkout/CheckoutPayment';
import OrderConfirmation from './pages/OrderConfirmation';
import MyOrders from './pages/MyOrders';
import TrackOrder from './pages/TrackOrder';

// Admin components
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminOrders from './pages/admin/AdminOrders';
import AdminProducts from './pages/admin/AdminProducts';
import ProductForm from './pages/admin/ProductForm';
import AdminCoupons from './pages/admin/AdminCoupons';
import AdminSettings from './pages/admin/AdminSettings';

// Placeholder components (will be built in later phases)
const Profile = () => <div className="p-8"><h1 className="text-3xl font-bold">My Profile</h1></div>;
const NotFound = () => <div className="p-8"><h1 className="text-3xl font-bold">404 - Page Not Found</h1></div>;

function App() {
  return (
    <ErrorBoundary>
      <HelmetProvider>
        <Router>
          <AuthProvider>
            <WishlistProvider>
              <CartProvider>
                <CheckoutProvider>
                  <div className="min-h-screen bg-gradient-to-br from-gray-100 via-gray-50 to-blue-50">
                    <Header />
                    <CartDrawer />
                    <Routes>
                  {/* Public routes */}
                  <Route path="/" element={<Home />} />
                  <Route path="/products" element={<Products />} />
                  <Route path="/products/:slug" element={<ProductDetail />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  
                  {/* Checkout routes (public - guests can checkout) */}
                  <Route path="/checkout/address" element={<CheckoutAddress />} />
                  <Route path="/checkout/payment" element={<CheckoutPayment />} />
                  <Route path="/order-confirmation/:orderId" element={<OrderConfirmation />} />
                  <Route path="/track-order" element={<TrackOrder />} />
                  
                  {/* Protected routes (require login) */}
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute>
                        <Profile />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/my-orders"
                    element={
                      <ProtectedRoute>
                        <MyOrders />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/wishlist"
                    element={
                      <ProtectedRoute>
                        <Wishlist />
                      </ProtectedRoute>
                    }
                  />
                
                  {/* Admin routes (require admin role) */}
                  <Route
                    path="/admin"
                    element={
                      <AdminRoute>
                        <AdminLayout />
                      </AdminRoute>
                    }
                  >
                    <Route path="dashboard" element={<AdminDashboard />} />
                    <Route path="products" element={<AdminProducts />} />
                    <Route path="products/new" element={<ProductForm />} />
                    <Route path="products/:id/edit" element={<ProductForm />} />
                    <Route path="orders" element={<AdminOrders />} />
                    <Route path="coupons" element={<AdminCoupons />} />
                    <Route path="settings" element={<AdminSettings />} />
                    <Route index element={<AdminDashboard />} />
                  </Route>
                  
                  {/* 404 */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </div>
              <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
              />
                </CheckoutProvider>
              </CartProvider>
            </WishlistProvider>
          </AuthProvider>
        </Router>
      </HelmetProvider>
    </ErrorBoundary>
  );
}

export default App;

// Made with Bob
