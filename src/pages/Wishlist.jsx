import React, { useState } from 'react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { FaHeart, FaShoppingCart, FaTrash, FaShare, FaFilter, FaSortAmountDown } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

export default function Wishlist() {
  const { wishlistItems, removeFromWishlist, moveToCart, moveAllToCart, clearWishlist } = useWishlist();
  const { addToCart } = useCart();
  const [sortBy, setSortBy] = useState('newest');
  const [filterBy, setFilterBy] = useState('all');
  const [showShareModal, setShowShareModal] = useState(false);

  const categories = [...new Set(wishlistItems.map(item => item.category))];

  const filteredItems = wishlistItems.filter(item => {
    if (filterBy === 'all') return true;
    return item.category === filterBy;
  });

  const sortedItems = [...filteredItems].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.addedAt) - new Date(a.addedAt);
      case 'oldest':
        return new Date(a.addedAt) - new Date(b.addedAt);
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'name':
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
  });

  const handleMoveToCart = (productId) => {
    moveToCart(productId, addToCart);
  };

  const handleMoveAllToCart = () => {
    moveAllToCart(addToCart);
  };

  const shareWishlist = () => {
    const wishlistUrl = `${window.location.origin}/wishlist/shared`;
    navigator.clipboard.writeText(wishlistUrl);
    setShowShareModal(false);
    // You could also integrate with social media APIs here
  };

  if (wishlistItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white pt-20">
        <div className="max-w-4xl mx-auto p-6">
          <div className="text-center py-20">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-24 h-24 bg-pink-600/20 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <FaHeart className="text-4xl text-pink-500" />
            </motion.div>
            
            <h1 className="text-3xl font-bold mb-4">Your Wishlist is Empty</h1>
            <p className="text-gray-400 mb-8 text-lg">
              Discover amazing products and add them to your wishlist to keep track of your favorites!
            </p>
            
            <motion.a
              href="/shop"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-block bg-pink-600 hover:bg-pink-700 px-8 py-4 rounded-xl font-semibold transition text-lg"
            >
              Start Shopping
            </motion.a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white pt-20">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">My Wishlist</h1>
            <p className="text-gray-400 text-lg">
              You have {wishlistItems.length} item{wishlistItems.length !== 1 ? 's' : ''} in your wishlist
            </p>
          </div>
          
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => setShowShareModal(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition"
            >
              <FaShare />
              Share Wishlist
            </button>
            
            <button
              onClick={handleMoveAllToCart}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg transition"
            >
              <FaShoppingCart />
              Add All to Cart
            </button>
            
            <button
              onClick={clearWishlist}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition"
            >
              <FaTrash />
              Clear Wishlist
            </button>
          </div>
        </div>

        {/* Filters and Sort */}
        <div className="bg-white/5 rounded-xl p-6 border border-white/10 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex items-center gap-2">
              <FaFilter className="text-gray-400" />
              <select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value)}
                className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <FaSortAmountDown className="text-gray-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="name">Name A-Z</option>
              </select>
            </div>
          </div>
        </div>

        {/* Wishlist Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence>
            {sortedItems.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white/5 rounded-2xl overflow-hidden border border-white/10 hover:border-pink-500/50 transition-all duration-300 group"
              >
                <div className="relative">
                  <img
                    src={item.image || '/api/placeholder/300/200'}
                    alt={item.name}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  
                  <button
                    onClick={() => removeFromWishlist(item.id)}
                    className="absolute top-4 right-4 w-10 h-10 bg-red-600/80 hover:bg-red-600 rounded-full flex items-center justify-center transition backdrop-blur-sm"
                  >
                    <FaHeart className="text-white" />
                  </button>

                  <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm px-3 py-1 rounded-full">
                    <span className="text-xs text-gray-200">Added {item.dateAdded}</span>
                  </div>
                </div>

                <div className="p-6">
                  <div className="mb-4">
                    <h3 className="font-semibold text-white mb-2 line-clamp-2 group-hover:text-pink-400 transition">
                      {item.name}
                    </h3>
                    <p className="text-gray-400 text-sm mb-2">{item.category}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-pink-400">₹{item.price}</span>
                      {item.originalPrice && (
                        <span className="text-gray-500 line-through">₹{item.originalPrice}</span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <button
                      onClick={() => handleMoveToCart(item.id)}
                      className="w-full bg-pink-600 hover:bg-pink-700 px-4 py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2"
                    >
                      <FaShoppingCart />
                      Add to Cart
                    </button>
                    
                    <button
                      onClick={() => removeFromWishlist(item.id)}
                      className="w-full bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg font-semibold transition"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Share Modal */}
        {showShareModal && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gray-900 rounded-2xl p-6 w-full max-w-md border border-white/10"
            >
              <h3 className="text-xl font-bold text-white mb-6">Share Your Wishlist</h3>
              
              <div className="space-y-4">
                <button
                  onClick={shareWishlist}
                  className="w-full bg-blue-600 hover:bg-blue-700 px-4 py-3 rounded-lg font-semibold transition"
                >
                  Copy Link
                </button>
                
                <div className="grid grid-cols-2 gap-4">
                  <button className="bg-[#1877f2] hover:bg-[#166fe5] px-4 py-3 rounded-lg font-semibold transition">
                    Facebook
                  </button>
                  <button className="bg-[#1da1f2] hover:bg-[#1a91da] px-4 py-3 rounded-lg font-semibold transition">
                    Twitter
                  </button>
                </div>
                
                <button
                  onClick={() => setShowShareModal(false)}
                  className="w-full bg-gray-700 hover:bg-gray-600 px-4 py-3 rounded-lg font-semibold transition"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-12 bg-white/5 rounded-xl p-6 border border-white/10">
          <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={handleMoveAllToCart}
              className="bg-green-600/20 hover:bg-green-600/30 border border-green-500/30 p-4 rounded-lg transition text-left"
            >
              <FaShoppingCart className="text-green-400 text-xl mb-2" />
              <h3 className="font-semibold text-white mb-1">Add All to Cart</h3>
              <p className="text-gray-400 text-sm">Move all wishlist items to your cart</p>
            </button>
            
            <button
              onClick={() => setShowShareModal(true)}
              className="bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 p-4 rounded-lg transition text-left"
            >
              <FaShare className="text-blue-400 text-xl mb-2" />
              <h3 className="font-semibold text-white mb-1">Share Wishlist</h3>
              <p className="text-gray-400 text-sm">Share your wishlist with friends</p>
            </button>
            
            <a
              href="/shop"
              className="bg-pink-600/20 hover:bg-pink-600/30 border border-pink-500/30 p-4 rounded-lg transition text-left block"
            >
              <FaHeart className="text-pink-400 text-xl mb-2" />
              <h3 className="font-semibold text-white mb-1">Continue Shopping</h3>
              <p className="text-gray-400 text-sm">Discover more products to love</p>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}