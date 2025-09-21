import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const WishlistContext = createContext();

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

export const WishlistProvider = ({ children }) => {
  const { user } = useAuth();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load wishlist from localStorage on component mount
  useEffect(() => {
    if (user) {
      const savedWishlist = localStorage.getItem(`wishlist_${user.uid}`);
      if (savedWishlist) {
        setWishlistItems(JSON.parse(savedWishlist));
      }
    } else {
      setWishlistItems([]);
    }
  }, [user]);

  // Save wishlist to localStorage whenever it changes
  useEffect(() => {
    if (user && wishlistItems.length >= 0) {
      localStorage.setItem(`wishlist_${user.uid}`, JSON.stringify(wishlistItems));
    }
  }, [wishlistItems, user]);

  const addToWishlist = (product) => {
    if (!user) {
      alert('Please log in to add items to your wishlist');
      return;
    }

    const isAlreadyInWishlist = wishlistItems.some(item => item.id === product.id);
    if (isAlreadyInWishlist) {
      return;
    }

    const wishlistItem = {
      ...product,
      addedAt: new Date().toISOString(),
      dateAdded: new Date().toLocaleDateString()
    };

    setWishlistItems(prev => [wishlistItem, ...prev]);
  };

  const removeFromWishlist = (productId) => {
    setWishlistItems(prev => prev.filter(item => item.id !== productId));
  };

  const isInWishlist = (productId) => {
    return wishlistItems.some(item => item.id === productId);
  };

  const clearWishlist = () => {
    setWishlistItems([]);
  };

  const moveToCart = (productId, addToCart) => {
    const item = wishlistItems.find(item => item.id === productId);
    if (item) {
      addToCart(item);
      removeFromWishlist(productId);
    }
  };

  const moveAllToCart = (addToCart) => {
    wishlistItems.forEach(item => {
      addToCart(item);
    });
    clearWishlist();
  };

  const getWishlistCount = () => {
    return wishlistItems.length;
  };

  const value = {
    wishlistItems,
    loading,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    clearWishlist,
    moveToCart,
    moveAllToCart,
    getWishlistCount
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};