import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const AdminRoute = ({ children }) => {
  const { isAdmin, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Not logged in, redirect to login
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    // Logged in but not admin, redirect to home
    return <Navigate to="/" replace />;
  }

  return children;
};

export default AdminRoute;

// Made with Bob
