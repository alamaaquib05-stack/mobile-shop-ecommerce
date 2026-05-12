import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { toast } from 'react-toastify';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'cases', label: 'Cases' },
    { value: 'chargers', label: 'Chargers' },
    { value: 'cables', label: 'Cables' },
    { value: 'screen-protectors', label: 'Screen Protectors' },
    { value: 'earphones', label: 'Earphones' },
    { value: 'power-banks', label: 'Power Banks' },
    { value: 'stands', label: 'Stands' },
    { value: 'others', label: 'Others' }
  ];

  useEffect(() => {
    fetchProducts();
  }, [categoryFilter]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = categoryFilter !== 'all' ? `?category=${categoryFilter}` : '';
      const response = await api.get(`/products${params}`);
      setProducts(response.data.products || []);
    } catch (error) {
      console.error('Fetch products error:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (productId, currentStatus) => {
    try {
      await api.put(`/products/${productId}`, { isActive: !currentStatus });
      toast.success(`Product ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
      fetchProducts();
    } catch (error) {
      console.error('Toggle active error:', error);
      toast.error('Failed to update product status');
    }
  };

  const handleDelete = async (productId, productName) => {
    if (!window.confirm(`Are you sure you want to delete "${productName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await api.delete(`/products/${productId}`);
      toast.success('Product deleted successfully');
      fetchProducts();
    } catch (error) {
      console.error('Delete product error:', error);
      toast.error('Failed to delete product');
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStockBadge = (stock) => {
    if (stock === 0) {
      return <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">Out of Stock</span>;
    } else if (stock <= 5) {
      return <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Low Stock</span>;
    } else {
      return <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">In Stock</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Product Management</h2>
          <p className="text-gray-600">Manage your product catalog</p>
        </div>
        <Link
          to="/admin/products/new"
          className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 font-medium transition-colors flex items-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Add New Product</span>
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search Products</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, brand, or SKU..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
          <span>
            Showing <strong>{filteredProducts.length}</strong> of <strong>{products.length}</strong> products
          </span>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="text-orange-600 hover:text-orange-700 font-medium"
            >
              Clear search
            </button>
          )}
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No products found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm ? 'Try adjusting your search terms.' : 'Get started by adding a new product.'}
            </p>
            {!searchTerm && (
              <Link
                to="/admin/products/new"
                className="mt-4 inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Product
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProducts.map((product) => (
                  <tr key={product._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <img
                          src={product.images?.[0]?.url || '/placeholder.png'}
                          alt={product.name}
                          className="w-12 h-12 object-cover rounded"
                        />
                        <div>
                          <div className="font-medium text-gray-900">{product.name}</div>
                          <div className="text-sm text-gray-500">
                            {product.brand && `${product.brand} • `}
                            SKU: {product.sku || 'N/A'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                        {product.category.replace('-', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">₹{product.price.toFixed(2)}</div>
                      {product.discountPrice && (
                        <div className="text-xs text-gray-500 line-through">₹{product.discountPrice.toFixed(2)}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-900">{product.stock}</span>
                        {getStockBadge(product.stock)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleActive(product._id, product.isActive)}
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          product.isActive
                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                        }`}
                      >
                        {product.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center space-x-3">
                        <Link
                          to={`/admin/products/${product._id}/edit`}
                          className="text-orange-600 hover:text-orange-700 font-medium"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(product._id, product.name)}
                          className="text-red-600 hover:text-red-700 font-medium"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Low Stock Alert */}
      {products.filter(p => p.stock > 0 && p.stock <= 5).length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-yellow-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">Low Stock Alert</h3>
              <p className="text-sm text-yellow-700 mt-1">
                {products.filter(p => p.stock > 0 && p.stock <= 5).length} product(s) have low stock (≤5 units). Consider restocking soon.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;

// Made with Bob
