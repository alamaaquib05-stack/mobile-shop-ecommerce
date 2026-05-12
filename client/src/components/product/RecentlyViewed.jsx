import { Link } from 'react-router-dom';
import useRecentlyViewed from '../../hooks/useRecentlyViewed';
import ProductCard from '../ProductCard';

const RecentlyViewed = () => {
  const { recentlyViewed } = useRecentlyViewed();

  if (recentlyViewed.length === 0) {
    return null;
  }

  return (
    <div className="mt-16">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Recently Viewed</h2>
        <Link
          to="/products"
          className="text-primary hover:text-primary-dark font-medium text-sm flex items-center gap-1"
        >
          Browse All
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        {recentlyViewed.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </div>
  );
};

export default RecentlyViewed;

// Made with Bob
