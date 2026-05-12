import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import StarRating from './StarRating';
import api from '../services/api';
import { toast } from 'react-toastify';

const ProductReviews = ({ productId }) => {
  const { isAuthenticated, user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);
  
  const [formData, setFormData] = useState({
    rating: 5,
    title: '',
    comment: ''
  });

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/reviews/${productId}`);
      setReviews(response.data.reviews || []);
      
      // Check if current user has already reviewed
      if (isAuthenticated && user) {
        const userReview = response.data.reviews.find(
          review => review.userId._id === user._id
        );
        setHasReviewed(Boolean(userReview));
      }
    } catch (error) {
      console.error('Fetch reviews error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.comment.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    setSubmitting(true);

    try {
      await api.post(`/reviews/${productId}`, formData);
      toast.success('Review submitted successfully!');
      setFormData({ rating: 5, title: '', comment: '' });
      setShowForm(false);
      fetchReviews();
    } catch (error) {
      console.error('Submit review error:', error);
      toast.error(error.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) {
      return;
    }

    try {
      await api.delete(`/reviews/${reviewId}`);
      toast.success('Review deleted successfully');
      fetchReviews();
    } catch (error) {
      console.error('Delete review error:', error);
      toast.error('Failed to delete review');
    }
  };

  const getRatingSummary = () => {
    if (reviews.length === 0) return { average: 0, count: 0 };
    
    const total = reviews.reduce((sum, review) => sum + review.rating, 0);
    const average = total / reviews.length;
    
    return {
      average: Math.round(average * 10) / 10,
      count: reviews.length
    };
  };

  const summary = getRatingSummary();

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Customer Reviews</h3>
        
        <div className="flex items-center space-x-4 mb-6">
          <div className="text-center">
            <div className="text-4xl font-bold text-gray-900">{summary.average.toFixed(1)}</div>
            <StarRating rating={Math.round(summary.average)} size="md" />
            <div className="text-sm text-gray-600 mt-1">{summary.count} reviews</div>
          </div>
        </div>

        {/* Write Review Button */}
        {isAuthenticated ? (
          hasReviewed ? (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
              <p className="text-blue-800">You have already reviewed this product</p>
            </div>
          ) : (
            <button
              onClick={() => setShowForm(!showForm)}
              className="w-full bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 font-medium transition-colors"
            >
              {showForm ? 'Cancel' : 'Write a Review'}
            </button>
          )
        ) : (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
            <p className="text-gray-700">Please log in to write a review</p>
          </div>
        )}
      </div>

      {/* Review Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Write Your Review</h4>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Rating <span className="text-red-500">*</span>
              </label>
              <StarRating
                rating={formData.rating}
                size="xl"
                interactive
                onRatingChange={(rating) => setFormData({ ...formData, rating })}
              />
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Review Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                maxLength="100"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Sum up your experience"
              />
            </div>

            {/* Comment */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Your Review <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.comment}
                onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                maxLength="1000"
                required
                rows="5"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Share your thoughts about this product..."
              />
              <div className="text-sm text-gray-500 mt-1">
                {formData.comment.length}/1000 characters
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium transition-colors"
            >
              {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </form>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
          </div>
        ) : reviews.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No reviews yet</h3>
            <p className="mt-1 text-sm text-gray-500">Be the first to review this product!</p>
          </div>
        ) : (
          reviews.map((review) => (
            <div key={review._id} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <StarRating rating={review.rating} size="sm" />
                    {review.isVerifiedPurchase && (
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
                        ✓ Verified Purchase
                      </span>
                    )}
                  </div>
                  <h4 className="font-semibold text-gray-900">{review.title}</h4>
                </div>
                
                {/* Delete button for admin or review owner */}
                {isAuthenticated && (user?.role === 'admin' || user?._id === review.userId._id) && (
                  <button
                    onClick={() => handleDelete(review._id)}
                    className="text-red-600 hover:text-red-700 text-sm font-medium"
                  >
                    Delete
                  </button>
                )}
              </div>

              <p className="text-gray-700 mb-3">{review.comment}</p>

              <div className="flex items-center justify-between text-sm text-gray-500">
                <span className="font-medium">{review.userId.name}</span>
                <span>{new Date(review.createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ProductReviews;

// Made with Bob
