import React, { useState } from 'react';
import { FaStar, FaThumbsUp, FaThumbsDown, FaFlag, FaUser } from 'react-icons/fa';

export default function ProductReviews({ productId, averageRating = 4.2, totalReviews = 156 }) {
  const [reviews, setReviews] = useState([
    {
      id: 1,
      userName: "Sarah Johnson",
      rating: 5,
      date: "2024-01-15",
      title: "Excellent product!",
      content: "Really impressed with the quality and fast delivery. Exactly as described and works perfectly.",
      helpful: 12,
      verified: true,
      images: []
    },
    {
      id: 2,
      userName: "Mike Chen",
      rating: 4,
      date: "2024-01-10",
      title: "Good value for money",
      content: "Solid product overall. Minor issue with packaging but the item itself is great. Would recommend.",
      helpful: 8,
      verified: true,
      images: []
    },
    {
      id: 3,
      userName: "Emma Davis",
      rating: 5,
      date: "2024-01-05",
      title: "Love it!",
      content: "Perfect addition to my collection. High quality materials and excellent craftsmanship.",
      helpful: 15,
      verified: false,
      images: []
    },
    {
      id: 4,
      userName: "David Wilson",
      rating: 3,
      date: "2024-01-02",
      title: "Average experience",
      content: "It's okay but not amazing. Does what it's supposed to do but nothing special about it.",
      helpful: 3,
      verified: true,
      images: []
    }
  ]);

  const [sortBy, setSortBy] = useState('newest');
  const [filterRating, setFilterRating] = useState('all');
  const [showWriteReview, setShowWriteReview] = useState(false);
  const [newReview, setNewReview] = useState({
    rating: 5,
    title: '',
    content: ''
  });

  const ratingDistribution = {
    5: 78,
    4: 45,
    3: 18,
    2: 8,
    1: 7
  };

  const sortedReviews = [...reviews].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.date) - new Date(a.date);
      case 'oldest':
        return new Date(a.date) - new Date(b.date);
      case 'highest':
        return b.rating - a.rating;
      case 'lowest':
        return a.rating - b.rating;
      case 'helpful':
        return b.helpful - a.helpful;
      default:
        return 0;
    }
  });

  const filteredReviews = sortedReviews.filter(review => {
    if (filterRating === 'all') return true;
    return review.rating === parseInt(filterRating);
  });

  const renderStars = (rating, interactive = false, onRatingChange = null) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <FaStar
            key={star}
            className={`${
              star <= rating ? 'text-yellow-400' : 'text-gray-600'
            } ${interactive ? 'cursor-pointer hover:text-yellow-300' : ''}`}
            onClick={interactive && onRatingChange ? () => onRatingChange(star) : undefined}
          />
        ))}
      </div>
    );
  };

  const handleSubmitReview = (e) => {
    e.preventDefault();
    const review = {
      id: Date.now(),
      userName: "You",
      rating: newReview.rating,
      date: new Date().toISOString().split('T')[0],
      title: newReview.title,
      content: newReview.content,
      helpful: 0,
      verified: true,
      images: []
    };
    
    setReviews([review, ...reviews]);
    setNewReview({ rating: 5, title: '', content: '' });
    setShowWriteReview(false);
  };

  return (
    <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Customer Reviews</h2>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {renderStars(Math.floor(averageRating))}
              <span className="text-2xl font-bold text-white">{averageRating}</span>
              <span className="text-gray-400">({totalReviews} reviews)</span>
            </div>
          </div>
        </div>
        
        <button
          onClick={() => setShowWriteReview(true)}
          className="bg-pink-600 hover:bg-pink-700 px-6 py-3 rounded-lg font-semibold transition"
        >
          Write a Review
        </button>
      </div>

      {/* Rating Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-1">
          <h3 className="font-semibold text-white mb-4">Rating Breakdown</h3>
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((stars) => (
              <div key={stars} className="flex items-center gap-3">
                <span className="text-sm text-gray-400 w-8">{stars}★</span>
                <div className="flex-1 bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-yellow-400 h-2 rounded-full"
                    style={{ width: `${(ratingDistribution[stars] / totalReviews) * 100}%` }}
                  />
                </div>
                <span className="text-sm text-gray-400 w-8">{ratingDistribution[stars]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Filters and Sort */}
        <div className="lg:col-span-2">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="highest">Highest rating</option>
              <option value="lowest">Lowest rating</option>
              <option value="helpful">Most helpful</option>
            </select>

            <select
              value={filterRating}
              onChange={(e) => setFilterRating(e.target.value)}
              className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
            >
              <option value="all">All ratings</option>
              <option value="5">5 stars</option>
              <option value="4">4 stars</option>
              <option value="3">3 stars</option>
              <option value="2">2 stars</option>
              <option value="1">1 star</option>
            </select>
          </div>
        </div>
      </div>

      {/* Write Review Modal */}
      {showWriteReview && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-2xl p-6 w-full max-w-lg border border-white/10">
            <h3 className="text-xl font-bold text-white mb-6">Write a Review</h3>
            
            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div>
                <label className="block text-gray-400 mb-2">Rating</label>
                {renderStars(newReview.rating, true, (rating) => setNewReview({...newReview, rating}))}
              </div>

              <div>
                <label className="block text-gray-400 mb-2">Review Title</label>
                <input
                  type="text"
                  value={newReview.title}
                  onChange={(e) => setNewReview({...newReview, title: e.target.value})}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                  placeholder="Summarize your experience"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-2">Your Review</label>
                <textarea
                  value={newReview.content}
                  onChange={(e) => setNewReview({...newReview, content: e.target.value})}
                  rows={4}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                  placeholder="Share your thoughts about this product..."
                  required
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowWriteReview(false)}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 px-4 py-3 rounded-lg font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-pink-600 hover:bg-pink-700 px-4 py-3 rounded-lg font-semibold transition"
                >
                  Submit Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-6">
        {filteredReviews.length === 0 ? (
          <div className="text-center py-12">
            <FaStar className="text-4xl text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No reviews found for this filter.</p>
          </div>
        ) : (
          filteredReviews.map((review) => (
            <div key={review.id} className="bg-white/5 rounded-xl p-6 border border-white/10">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-pink-600 rounded-full flex items-center justify-center">
                    <FaUser className="text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-white">{review.userName}</h4>
                      {review.verified && (
                        <span className="bg-green-600/20 text-green-400 text-xs px-2 py-1 rounded-full">
                          Verified Purchase
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      {renderStars(review.rating)}
                      <span className="text-gray-400 text-sm">{review.date}</span>
                    </div>
                  </div>
                </div>

                <button className="text-gray-400 hover:text-white">
                  <FaFlag />
                </button>
              </div>

              <h5 className="font-semibold text-white mb-2">{review.title}</h5>
              <p className="text-gray-300 mb-4">{review.content}</p>

              <div className="flex items-center gap-4">
                <button className="flex items-center gap-2 text-gray-400 hover:text-green-400 transition">
                  <FaThumbsUp />
                  <span>Helpful ({review.helpful})</span>
                </button>
                <button className="flex items-center gap-2 text-gray-400 hover:text-red-400 transition">
                  <FaThumbsDown />
                  <span>Not helpful</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Load More */}
      {filteredReviews.length > 0 && (
        <div className="text-center mt-8">
          <button className="bg-white/10 hover:bg-white/20 px-6 py-3 rounded-lg font-semibold transition">
            Load More Reviews
          </button>
        </div>
      )}
    </div>
  );
}