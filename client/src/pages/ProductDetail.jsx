import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useCart } from '../contexts/CartContext';
import { toast } from 'react-toastify';
import StarRating from '../components/StarRating';
import ProductReviews from '../components/ProductReviews';
import WishlistButton from '../components/WishlistButton';
import RelatedProducts from '../components/product/RelatedProducts';
import useRecentlyViewed from '../hooks/useRecentlyViewed';

const ProductDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { addToRecentlyViewed } = useRecentlyViewed();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await api.get(`/products/${slug}`);
        const fetchedProduct = response.data.product;
        setProduct(fetchedProduct);
        
        // Add to recently viewed
        addToRecentlyViewed(fetchedProduct);
      } catch (error) {
        toast.error('Product not found');
        navigate('/products');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [slug, navigate, addToRecentlyViewed]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  const handleAddToCart = () => {
    if (product.stock === 0) {
      toast.error('Product is out of stock');
      return;
    }

    if (quantity > product.stock) {
      toast.error(`Only ${product.stock} items available`);
      return;
    }

    addToCart(product, quantity);
    toast.success(`${quantity} item(s) added to cart!`);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate('/cart');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!product) {
    return null;
  }

  const discountPercentage = product.discountPrice 
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  const images = product.images && product.images.length > 0 
    ? product.images 
    : [{ url: null }]; // Placeholder

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center space-x-2 text-sm text-gray-600">
            <Link to="/" className="hover:text-primary">Home</Link>
            <span>/</span>
            <Link to="/products" className="hover:text-primary">Products</Link>
            <span>/</span>
            <span className="text-gray-900 capitalize">
              {product.category.replace('-', ' ')}
            </span>
            <span>/</span>
            <span className="text-gray-400 truncate">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <div>
            {/* Main Image */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                {images[selectedImage].url ? (
                  <img
                    src={images[selectedImage].url}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <svg className="w-32 h-32" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </div>
            </div>

            {/* Thumbnail Gallery */}
            {images.length > 1 && (
              <div className="grid grid-cols-5 gap-2">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square bg-white rounded-lg overflow-hidden border-2 ${
                      selectedImage === index ? 'border-primary' : 'border-gray-200'
                    }`}
                  >
                    {image.url ? (
                      <img
                        src={image.url}
                        alt={`${product.name} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100"></div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              {/* Brand & Category */}
              <div className="flex items-center gap-2 mb-2">
                {product.brand && (
                  <span className="text-sm font-medium text-gray-600">{product.brand}</span>
                )}
                <span className="text-sm text-gray-400">|</span>
                <span className="text-sm text-gray-600 capitalize">
                  {product.category.replace('-', ' ')}
                </span>
              </div>

              {/* Product Name */}
              <h1 className="text-2xl font-bold text-gray-900 mb-4">{product.name}</h1>

              {/* Rating */}
              {product.ratings && product.ratings.count > 0 && (
                <div className="flex items-center gap-2 mb-4">
                  <StarRating rating={product.ratings.average} size="md" />
                  <span className="text-sm text-gray-600">
                    {product.ratings.average.toFixed(1)} ({product.ratings.count} reviews)
                  </span>
                </div>
              )}

              {/* Price */}
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-3xl font-bold text-gray-900">
                    {formatPrice(product.discountPrice || product.price)}
                  </span>
                  {product.discountPrice && (
                    <>
                      <span className="text-xl text-gray-500 line-through">
                        {formatPrice(product.price)}
                      </span>
                      <span className="bg-red-500 text-white text-sm font-semibold px-2 py-1 rounded">
                        {discountPercentage}% OFF
                      </span>
                    </>
                  )}
                </div>
                <p className="text-sm text-gray-600">Inclusive of all taxes</p>
              </div>

              {/* Stock Status */}
              <div className="mb-6">
                {product.stock > 0 ? (
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                    <span className="text-green-700 font-medium">
                      In Stock {product.stock <= 10 && `(Only ${product.stock} left!)`}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                    <span className="text-red-700 font-medium">Out of Stock</span>
                  </div>
                )}
              </div>

              {/* Quantity Selector */}
              {product.stock > 0 && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-10 h-10 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, Math.min(product.stock, Number(e.target.value))))}
                      className="w-20 text-center border border-gray-300 rounded-lg py-2"
                      min="1"
                      max={product.stock}
                    />
                    <button
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      className="w-10 h-10 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      +
                    </button>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 mb-6">
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className="flex-1 btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add to Cart
                </button>
                <button
                  onClick={handleBuyNow}
                  disabled={product.stock === 0}
                  className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Buy Now
                </button>
                <WishlistButton productId={product._id} size="lg" />
              </div>

              {/* Compatibility */}
              {product.compatibility && product.compatibility.length > 0 && (
                <div className="border-t pt-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Compatible with:</h3>
                  <div className="flex flex-wrap gap-2">
                    {product.compatibility.map((device, index) => (
                      <span
                        key={index}
                        className="bg-gray-100 text-gray-700 text-sm px-3 py-1 rounded-full"
                      >
                        {device}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="mt-8 bg-white rounded-lg shadow-sm">
          {/* Tab Headers */}
          <div className="border-b">
            <div className="flex">
              <button
                onClick={() => setActiveTab('description')}
                className={`px-6 py-4 font-medium ${
                  activeTab === 'description'
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Description
              </button>
              <button
                onClick={() => setActiveTab('specifications')}
                className={`px-6 py-4 font-medium ${
                  activeTab === 'specifications'
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Specifications
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`px-6 py-4 font-medium ${
                  activeTab === 'reviews'
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Reviews {product.ratings && product.ratings.count > 0 && (
                  <span className="ml-1 text-sm">({product.ratings.count})</span>
                )}
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'description' && (
              <div className="prose max-w-none">
                <p className="text-gray-700 whitespace-pre-line">{product.description}</p>
                {product.tags && product.tags.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Tags:</h4>
                    <div className="flex flex-wrap gap-2">
                      {product.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="bg-blue-100 text-blue-700 text-sm px-3 py-1 rounded-full"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'specifications' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex justify-between py-2 border-b">
                  <span className="font-medium text-gray-700">SKU:</span>
                  <span className="text-gray-600">{product.sku || 'N/A'}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="font-medium text-gray-700">Brand:</span>
                  <span className="text-gray-600">{product.brand || 'N/A'}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="font-medium text-gray-700">Category:</span>
                  <span className="text-gray-600 capitalize">
                    {product.category.replace('-', ' ')}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="font-medium text-gray-700">Stock:</span>
                  <span className="text-gray-600">{product.stock} units</span>
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <ProductReviews productId={product._id} />
            )}
          </div>
        </div>

        {/* Related Products */}
        <RelatedProducts productSlug={slug} />
      </div>
    </div>
  );
};

export default ProductDetail;

// Made with Bob
