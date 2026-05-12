import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../../services/api';
import CouponForm from '../../components/admin/CouponForm';

const AdminCoupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchCoupons();
  }, [page]);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/coupons?page=${page}&limit=10`);
      setCoupons(response.data.coupons);
      setTotalPages(response.data.pages);
    } catch (error) {
      console.error('Fetch coupons error:', error);
      toast.error('Error loading coupons');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCoupon = () => {
    setEditingCoupon(null);
    setShowForm(true);
  };

  const handleEditCoupon = (coupon) => {
    setEditingCoupon(coupon);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingCoupon(null);
  };

  const handleSaveCoupon = async (couponData) => {
    try {
      if (editingCoupon) {
        await api.put(`/coupons/${editingCoupon._id}`, couponData);
        toast.success('Coupon updated successfully');
      } else {
        await api.post('/coupons', couponData);
        toast.success('Coupon created successfully');
      }
      fetchCoupons();
      handleCloseForm();
    } catch (error) {
      console.error('Save coupon error:', error);
      toast.error(error.response?.data?.message || 'Error saving coupon');
    }
  };

  const handleToggleStatus = async (couponId, currentStatus) => {
    try {
      await api.patch(`/coupons/${couponId}/toggle`);
      toast.success(`Coupon ${currentStatus ? 'deactivated' : 'activated'} successfully`);
      fetchCoupons();
    } catch (error) {
      console.error('Toggle status error:', error);
      toast.error('Error updating coupon status');
    }
  };

  const handleDeleteCoupon = async (couponId) => {
    if (!window.confirm('Are you sure you want to delete this coupon?')) {
      return;
    }

    try {
      await api.delete(`/coupons/${couponId}`);
      toast.success('Coupon deleted successfully');
      fetchCoupons();
    } catch (error) {
      console.error('Delete coupon error:', error);
      toast.error('Error deleting coupon');
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  if (loading && coupons.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Coupon Management</h1>
          <p className="text-gray-600 mt-1">Create and manage discount coupons</p>
        </div>
        <button
          onClick={handleCreateCoupon}
          className="btn-primary"
        >
          + Create Coupon
        </button>
      </div>

      {/* Coupons Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Code
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Discount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Min Order
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usage
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Valid Until
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {coupons.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                    No coupons found. Create your first coupon!
                  </td>
                </tr>
              ) : (
                coupons.map((coupon) => (
                  <tr key={coupon._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-bold text-gray-900">{coupon.code}</div>
                          <div className="text-xs text-gray-500">{coupon.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {coupon.discountType === 'percentage'
                          ? `${coupon.discountValue}%`
                          : formatPrice(coupon.discountValue)}
                      </div>
                      {coupon.maxDiscount && (
                        <div className="text-xs text-gray-500">
                          Max: {formatPrice(coupon.maxDiscount)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatPrice(coupon.minOrderAmount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {coupon.usedCount} / {coupon.maxUses || '∞'}
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                        <div
                          className="bg-primary h-1.5 rounded-full"
                          style={{
                            width: coupon.maxUses
                              ? `${(coupon.usedCount / coupon.maxUses) * 100}%`
                              : '0%'
                          }}
                        ></div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(coupon.validUntil)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          coupon.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {coupon.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleEditCoupon(coupon)}
                        className="text-primary hover:text-primary-dark"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleToggleStatus(coupon._id, coupon.isActive)}
                        className="text-yellow-600 hover:text-yellow-700"
                      >
                        {coupon.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        onClick={() => handleDeleteCoupon(coupon._id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="btn-secondary disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages}
                className="btn-secondary disabled:opacity-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Page <span className="font-medium">{page}</span> of{' '}
                  <span className="font-medium">{totalPages}</span>
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={page === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Coupon Form Modal */}
      {showForm && (
        <CouponForm
          coupon={editingCoupon}
          onSave={handleSaveCoupon}
          onClose={handleCloseForm}
        />
      )}
    </div>
  );
};

export default AdminCoupons;

// Made with Bob
