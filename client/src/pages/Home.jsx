import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import RecentlyViewed from '../components/product/RecentlyViewed';
import SEO from '../components/common/SEO';
import { toast } from 'react-toastify';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const response = await api.get('/products/featured?limit=8');
        setFeaturedProducts(response.data.products);
      } catch (error) {
        toast.error('Error loading featured products');
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  const categories = [
    { name: 'Cases', slug: 'cases', icon: '📱', color: 'bg-blue-100 text-blue-600' },
    { name: 'Chargers', slug: 'chargers', icon: '🔌', color: 'bg-green-100 text-green-600' },
    { name: 'Cables', slug: 'cables', icon: '🔗', color: 'bg-purple-100 text-purple-600' },
    { name: 'Screen Protectors', slug: 'screen-protectors', icon: '🛡️', color: 'bg-yellow-100 text-yellow-600' },
    { name: 'Earphones', slug: 'earphones', icon: '🎧', color: 'bg-pink-100 text-pink-600' },
    { name: 'Power Banks', slug: 'power-banks', icon: '🔋', color: 'bg-red-100 text-red-600' },
    { name: 'Stands', slug: 'stands', icon: '📐', color: 'bg-indigo-100 text-indigo-600' },
    { name: 'Others', slug: 'others', icon: '✨', color: 'bg-gray-100 text-gray-600' }
  ];

  return (
    <>
      <SEO
        title="Home"
        description="Shop premium mobile accessories including phone cases, chargers, cables, screen protectors, earphones, and power banks. Fast delivery, genuine products, easy returns."
        keywords="mobile accessories, phone cases, chargers, cables, screen protectors, earphones, power banks"
        url="/"
      />
      <div className="min-h-screen bg-brand-light">
        {/* Hero Section */}
      <section className="bg-brand-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-orange-400">
              Premium Mobile Accessories
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-300">
              Protect, Power, and Accessorise Your Device
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/products"
                className="bg-brand-primary text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-orange-600 transition-all shadow-lg hover:scale-105 transform"
              >
                Shop Now
              </Link>
              <Link
                to="/products?category=cases"
                className="bg-transparent border-2 border-orange-400 text-orange-300 px-8 py-4 rounded-lg font-bold text-lg hover:bg-orange-400 hover:text-white transition-all"
              >
                Browse Cases
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-brand-navy mb-4">Shop by Category</h2>
            <p className="text-brand-gray">Find the perfect accessory for your device</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((category) => (
              <Link
                key={category.slug}
                to={`/products?category=${category.slug}`}
                className="card text-center hover:shadow-lg transition-shadow group"
              >
                <div className={`w-16 h-16 ${category.color} rounded-full flex items-center justify-center text-3xl mx-auto mb-3 group-hover:scale-110 transition-transform`}>
                  {category.icon}
                </div>
                <h3 className="font-semibold text-gray-900 group-hover:text-primary transition-colors">
                  {category.name}
                </h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Featured Products</h2>
              <p className="text-gray-600">Handpicked accessories for you</p>
            </div>
            <Link
              to="/products"
              className="text-brand-primary font-semibold hover:text-orange-600 flex items-center gap-2"
            >
              View All
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
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
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Shop With Us?</h2>
            <p className="text-gray-600">Your satisfaction is our priority</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
                ✓
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Genuine Products</h3>
              <p className="text-gray-600">
                100% authentic accessories from trusted brands
              </p>
            </div>

            {/* Feature 2 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
                🚚
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Fast Delivery</h3>
              <p className="text-gray-600">
                Quick shipping to your doorstep within 3-5 days
              </p>
            </div>

            {/* Feature 3 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
                🔄
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Easy Returns</h3>
              <p className="text-gray-600">
                7-day return policy for hassle-free shopping
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Recently Viewed Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <RecentlyViewed />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-brand-primary to-orange-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Upgrade Your Mobile Experience?</h2>
          <p className="text-xl mb-8 text-white/90">
            Browse our collection of premium accessories
          </p>
          <Link
            to="/products"
            className="inline-block bg-white text-brand-primary px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors"
          >
            Start Shopping
          </Link>
        </div>
      </section>
      </div>
    </>
  );
};

export default Home;

// Made with Bob
