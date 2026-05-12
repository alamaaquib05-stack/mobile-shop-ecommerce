import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import { useAuth } from '../../contexts/AuthContext';

const AdminLayout = () => {
  const { user } = useAuth();

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar />
      
      <div className="flex-1 ml-64">
        {/* Top Bar */}
        <header className="bg-white shadow-sm sticky top-0 z-10">
          <div className="px-8 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Admin Dashboard</h2>
              <p className="text-sm text-gray-600">Manage your mobile accessories store</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500">Administrator</p>
              </div>
              <div className="w-10 h-10 bg-orange-600 rounded-full flex items-center justify-center text-white font-bold">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;

// Made with Bob
