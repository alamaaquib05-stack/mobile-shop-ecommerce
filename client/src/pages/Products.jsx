import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import { toast } from 'react-toastify';

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    total: 0
  });

  // Filter states
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    search: searchParams.get('search') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    sort: searchParams.get('sort') || '-createdAt',
    page: Number(searchParams.get('page')) || 1
  });

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get('/products/categories');
        setCategories(response.data.categories);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (filters.category) params.append('category', filters.category);
        if (filters.search) params.append('search', filters.search);
        if (filters.minPrice) params.append('minPrice', filters.minPrice);
        if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
        params.append('sort', filters.sort);
        params.append('page', filters.page);
        params.append('limit', 12);

        const response = await api.get(`/products?${params.toString()}`);
        setProducts(response.data.products);
        setPagination({
          page: response.data.page,
          pages: response.data.pages,
          total: response.data.total
        });
      } catch (error) {
        toast.error('Error loading products');
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [filters]);

  // Update URL params when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.category) params.set('category', filters.category);
    if (filters.search) params.set('search', filters.search);
    if (filters.minPrice) params.set('minPrice', filters.minPrice);
    if (filters.maxPrice) params.set('maxPrice', filters.maxPrice);
    if (filters.sort !== '-createdAt') params.set('sort', filters.sort);
    if (filters.page > 1) params.set('page', filters.page);
    setSearchParams(params);
  }, [filters, setSearchParams]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page when filters change
    }));
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      search: '',
      minPrice: '',
      maxPrice: '',
      sort: '-createdAt',
      page: 1
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Mobile Accessories</h1>
          <p className="mt-2 text-gray-600">
            Browse our collection of premium mobile accessories
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <aside className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
                {(filters.category || filters.search || filters.minPrice || filters.maxPrice) && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-primary hover:text-primary/90"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {/* Search */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search
                </label>
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  placeholder="Search products..."
                  className="input-field text-sm"
                />
              </div>

              {/* Category */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="category"
                      checked={filters.category === ''}
                      onChange={() => handleFilterChange('category', '')}
                      className="mr-2"
                    />
                    <span className="text-sm">All Categories</span>
                  </label>
                  {categories.map((cat) => (
                    <label key={cat.name} className="flex items-center">
                      <input
                        type="radio"
                        name="category"
                        checked={filters.category === cat.name}
                        onChange={() => handleFilterChange('category', cat.name)}
                        className="mr-2"
                      />
                      <span className="text-sm capitalize">
                        {cat.name.replace('-', ' ')} ({cat.count})
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price Range
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={filters.minPrice}
                    onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                    placeholder="Min"
                    className="input-field text-sm w-full"
                  />
                  <input
                    type="number"
                    value={filters.maxPrice}
                    onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                    placeholder="Max"
                    className="input-field text-sm w-full"
                  />
                </div>
              </div>

              {/* Sort */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sort By
                </label>
                <select
                  value={filters.sort}
                  onChange={(e) => handleFilterChange('sort', e.target.value)}
                  className="input-field text-sm"
                >
                  <option value="-createdAt">Newest First</option>
                  <option value="price">Price: Low to High</option>
                  <option value="-price">Price: High to Low</option>
                  <option value="name">Name: A to Z</option>
                  <option value="-name">Name: Z to A</option>
                </select>
              </div>
            </div>
          </aside>

          {/* Products Grid */}
          <main className="flex-1">
            {/* Results header */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-gray-600">
                {loading ? 'Loading...' : `${pagination.total} products found`}
              </p>
            </div>

            {/* Loading state */}
            {loading && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="card animate-pulse">
                    <div className="bg-gray-200 h-48 rounded-t-lg"></div>
                    <div className="p-4 space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-8 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Products grid */}
            {!loading && products.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            )}

            {/* No results */}
            {!loading && products.length === 0 && (
              <div className="text-center py-12">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No products found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Try adjusting your filters or search terms
                </p>
                <button
                  onClick={clearFilters}
                  className="mt-4 btn-primary"
                >
                  Clear Filters
                </button>
              </div>
            )}

            {/* Pagination */}
            {!loading && pagination.pages > 1 && (
              <div className="mt-8 flex justify-center">
                <nav className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  
                  {[...Array(pagination.pages)].map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => handlePageChange(i + 1)}
                      className={`px-4 py-2 border rounded-lg ${
                        pagination.page === i + 1
                          ? 'bg-primary text-white border-primary'
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.pages}
                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Next
                  </button>
                </nav>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Products;

// Made with Bob
