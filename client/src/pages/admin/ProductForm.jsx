import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';
import { toast } from 'react-toastify';

const ProductForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: 'cases',
    brand: '',
    price: '',
    discountPrice: '',
    stock: '',
    sku: '',
    description: '',
    compatibility: [],
    tags: [],
    isFeatured: false,
    isActive: true
  });
  const [images, setImages] = useState([]);
  const [compatibilityInput, setCompatibilityInput] = useState('');
  const [tagInput, setTagInput] = useState('');

  const categories = [
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
    if (isEditMode) {
      fetchProduct();
    }
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/products/id/${id}`);
      const product = response.data.product;
      
      setFormData({
        name: product.name || '',
        category: product.category || 'cases',
        brand: product.brand || '',
        price: product.price || '',
        discountPrice: product.discountPrice || '',
        stock: product.stock || '',
        sku: product.sku || '',
        description: product.description || '',
        compatibility: product.compatibility || [],
        tags: product.tags || [],
        isFeatured: product.isFeatured || false,
        isActive: product.isActive !== undefined ? product.isActive : true
      });
      
      setImages(product.images || []);
    } catch (error) {
      console.error('Fetch product error:', error);
      toast.error('Failed to load product');
      navigate('/admin/products');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    
    if (images.length + files.length > 6) {
      toast.error('Maximum 6 images allowed');
      return;
    }

    setUploading(true);

    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append('image', file);

        const response = await api.post('/products/upload-image', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });

        setImages(prev => [...prev, response.data.image]);
      }
      
      toast.success('Images uploaded successfully');
    } catch (error) {
      console.error('Image upload error:', error);
      toast.error('Failed to upload images');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = async (publicId, index) => {
    try {
      if (publicId) {
        await api.delete(`/products/delete-image/${publicId}`);
      }
      setImages(prev => prev.filter((_, i) => i !== index));
      toast.success('Image removed');
    } catch (error) {
      console.error('Remove image error:', error);
      toast.error('Failed to remove image');
    }
  };

  const handleAddCompatibility = (e) => {
    if (e.key === 'Enter' && compatibilityInput.trim()) {
      e.preventDefault();
      if (!formData.compatibility.includes(compatibilityInput.trim())) {
        setFormData(prev => ({
          ...prev,
          compatibility: [...prev.compatibility, compatibilityInput.trim()]
        }));
      }
      setCompatibilityInput('');
    }
  };

  const handleRemoveCompatibility = (item) => {
    setFormData(prev => ({
      ...prev,
      compatibility: prev.compatibility.filter(c => c !== item)
    }));
  };

  const handleAddTag = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!formData.tags.includes(tagInput.trim())) {
        setFormData(prev => ({
          ...prev,
          tags: [...prev.tags, tagInput.trim()]
        }));
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error('Product name is required');
      return false;
    }
    if (!formData.price || formData.price <= 0) {
      toast.error('Valid price is required');
      return false;
    }
    if (!formData.stock || formData.stock < 0) {
      toast.error('Valid stock quantity is required');
      return false;
    }
    if (images.length === 0) {
      toast.error('At least one product image is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        discountPrice: formData.discountPrice ? parseFloat(formData.discountPrice) : null,
        stock: parseInt(formData.stock),
        images
      };

      if (isEditMode) {
        await api.put(`/products/${id}`, productData);
        toast.success('Product updated successfully!');
      } else {
        await api.post('/products', productData);
        toast.success('Product created successfully!');
      }

      navigate('/admin/products');
    } catch (error) {
      console.error('Submit product error:', error);
      toast.error(error.response?.data?.message || 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditMode) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/admin/products')}
          className="text-gray-600 hover:text-gray-900 flex items-center space-x-2 mb-4"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>Back to Products</span>
        </button>
        <h2 className="text-2xl font-bold text-gray-900">
          {isEditMode ? 'Edit Product' : 'Add New Product'}
        </h2>
        <p className="text-gray-600">
          {isEditMode ? 'Update product details and images' : 'Fill in the details to create a new product'}
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="e.g., iPhone 15 Silicone Case"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
              <input
                type="text"
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="e.g., Apple, Samsung"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
              <input
                type="text"
                name="sku"
                value={formData.sku}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="e.g., IP15-CASE-001"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Describe the product features, materials, etc."
              />
            </div>
          </div>
        </div>

        {/* Pricing & Stock */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Pricing & Inventory</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price (₹) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="999.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Discount Price (₹)</label>
              <input
                type="number"
                name="discountPrice"
                value={formData.discountPrice}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="799.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stock Quantity <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                required
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="50"
              />
            </div>
          </div>
        </div>

        {/* Product Images */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Product Images <span className="text-red-500">*</span>
          </h3>
          
          <div className="space-y-4">
            {/* Upload Button */}
            <div>
              <label className="block">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploading || images.length >= 6}
                  className="hidden"
                />
                <div className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                  uploading || images.length >= 6
                    ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
                    : 'border-gray-300 hover:border-orange-500 hover:bg-orange-50'
                }`}>
                  {uploading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-orange-600"></div>
                      <span className="text-gray-600">Uploading...</span>
                    </div>
                  ) : (
                    <>
                      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      <p className="mt-2 text-sm text-gray-600">
                        Click to upload images ({images.length}/6)
                      </p>
                      <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</p>
                    </>
                  )}
                </div>
              </label>
            </div>

            {/* Image Preview Grid */}
            {images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {images.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={image.url}
                      alt={`Product ${index + 1}`}
                      className="w-full h-40 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(image.publicId, index)}
                      className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                    {index === 0 && (
                      <span className="absolute bottom-2 left-2 bg-orange-600 text-white text-xs px-2 py-1 rounded">
                        Main Image
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Compatibility & Tags */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Details</h3>
          
          <div className="space-y-4">
            {/* Compatibility */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Compatibility (Press Enter to add)
              </label>
              <input
                type="text"
                value={compatibilityInput}
                onChange={(e) => setCompatibilityInput(e.target.value)}
                onKeyDown={handleAddCompatibility}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="e.g., iPhone 15, Samsung Galaxy S24"
              />
              {formData.compatibility.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.compatibility.map((item, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                    >
                      {item}
                      <button
                        type="button"
                        onClick={() => handleRemoveCompatibility(item)}
                        className="ml-2 text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tags (Press Enter to add)
              </label>
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="e.g., wireless, fast-charging, durable"
              />
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-800"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-2 text-gray-600 hover:text-gray-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Settings */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Settings</h3>
          
          <div className="space-y-3">
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                name="isFeatured"
                checked={formData.isFeatured}
                onChange={handleChange}
                className="w-5 h-5 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
              />
              <div>
                <span className="font-medium text-gray-900">Featured Product</span>
                <p className="text-sm text-gray-600">Show this product on homepage</p>
              </div>
            </label>

            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                className="w-5 h-5 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
              />
              <div>
                <span className="font-medium text-gray-900">Active</span>
                <p className="text-sm text-gray-600">Make product visible in store</p>
              </div>
            </label>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex items-center justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/admin/products')}
            className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || uploading}
            className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium transition-colors"
          >
            {loading ? 'Saving...' : isEditMode ? 'Update Product' : 'Create Product'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;

// Made with Bob
