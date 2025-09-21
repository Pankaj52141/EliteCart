import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { FaTrash, FaShoppingCart, FaHeart, FaEye, FaGift, FaPercent, FaArrowLeft, FaClock, FaShieldAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, getDocs, addDoc, Timestamp, query, where, orderBy, limit } from "firebase/firestore";

export default function Cart() {
  const { items, updateQuantity, addToCart, removeFromCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // States
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [savedForLater, setSavedForLater] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      fetchRecentlyViewed();
      fetchRecommendations();
      loadSavedForLater();
    }
  }, [user]);

  const fetchRecentlyViewed = async () => {
    try {
      const q = query(
        collection(db, "viewHistory"),
        where("userId", "==", user.uid),
        orderBy("viewedAt", "desc"),
        limit(4)
      );
      const snapshot = await getDocs(q);
      const viewed = snapshot.docs.map(doc => doc.data().product);
      setRecentlyViewed(viewed);
    } catch (error) {
      console.error("Error fetching recently viewed:", error);
    }
  };

  const fetchRecommendations = async () => {
    try {
      // Mock recommendations based on cart items
      const categories = [...new Set(items.map(item => item.category))];
      if (categories.length > 0) {
        const q = query(collection(db, "products"), limit(4));
        const snapshot = await getDocs(q);
        const products = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          rating: Math.floor(Math.random() * 2) + 4 // Mock rating 4-5
        }));
        setRecommendedProducts(products.filter(p => !items.find(item => item.id === p.id)));
      }
    } catch (error) {
      console.error("Error fetching recommendations:", error);
    }
  };

  const loadSavedForLater = () => {
    const saved = JSON.parse(localStorage.getItem(`savedForLater_${user?.uid}`) || "[]");
    setSavedForLater(saved);
  };

  const saveForLater = (item) => {
    const saved = [...savedForLater, item];
    setSavedForLater(saved);
    localStorage.setItem(`savedForLater_${user?.uid}`, JSON.stringify(saved));
    removeFromCart(item.id);
  };

  const moveToCart = (item) => {
    addToCart(item);
    const filtered = savedForLater.filter(saved => saved.id !== item.id);
    setSavedForLater(filtered);
    localStorage.setItem(`savedForLater_${user?.uid}`, JSON.stringify(filtered));
  };

  const applyCoupon = () => {
    const mockCoupons = {
      "SAVE10": { type: "percentage", value: 10, minOrder: 500 },
      "FLAT50": { type: "fixed", value: 50, minOrder: 200 },
      "WELCOME20": { type: "percentage", value: 20, minOrder: 1000 },
      "FIRST15": { type: "percentage", value: 15, minOrder: 300 }
    };

    const coupon = mockCoupons[couponCode.toUpperCase()];
    const subtotal = getSubtotal();
    
    if (coupon && subtotal >= coupon.minOrder) {
      setAppliedCoupon({ ...coupon, code: couponCode.toUpperCase() });
      setError("");
    } else if (coupon) {
      setError(`Minimum order value ₹${coupon.minOrder} required for this coupon`);
    } else {
      setError("Invalid coupon code");
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    setError("");
  };

  const getSubtotal = () => {
    return items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  };

  const getDiscount = () => {
    if (!appliedCoupon) return 0;
    const subtotal = getSubtotal();
    return appliedCoupon.type === "percentage" 
      ? (subtotal * appliedCoupon.value) / 100
      : appliedCoupon.value;
  };

  const getTotal = () => {
    return getSubtotal() - getDiscount();
  };

  const trackViewProduct = async (product) => {
    if (user) {
      try {
        await addDoc(collection(db, "viewHistory"), {
          userId: user.uid,
          product,
          viewedAt: Timestamp.now()
        });
      } catch (error) {
        console.error("Error tracking view:", error);
      }
    }
  };

  const subtotal = getSubtotal();
  const discount = getDiscount();
  const total = getTotal();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-white/10 rounded-lg transition"
          >
            <FaArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-4xl font-bold text-pink-500">Shopping Cart</h1>
            <p className="text-gray-400">{items.length} item{items.length !== 1 ? 's' : ''} in your cart</p>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-20">
            <FaShoppingCart className="text-6xl text-gray-600 mx-auto mb-6" />
            <h2 className="text-2xl font-semibold mb-4">Your cart is empty</h2>
            <p className="text-gray-400 mb-8">Looks like you haven't added any items to your cart yet</p>
            <button
              onClick={() => navigate("/shop")}
              className="bg-pink-600 hover:bg-pink-700 px-8 py-3 rounded-lg font-semibold transition"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="bg-white/5 border border-white/10 rounded-xl p-6 transition hover:bg-white/10"
                >
                  <div className="flex flex-col md:flex-row gap-4">
                    <img
                      src={item.imageUrl || item.image || "https://via.placeholder.com/150x150?text=No+Image"}
                      alt={item.name}
                      className="w-full md:w-32 h-32 object-cover rounded-lg"
                    />
                    
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-xl font-semibold text-white">{item.name}</h3>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-red-400 hover:text-red-300 p-2"
                          title="Remove from cart"
                        >
                          <FaTrash />
                        </button>
                      </div>
                      
                      <p className="text-gray-400 text-sm mb-3">{item.description}</p>
                      <p className="text-gray-400 mb-4">Category: {item.category}</p>
                      
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-3 bg-white/10 rounded-lg px-3 py-2">
                            <button
                              onClick={() => updateQuantity(item.id, -1)}
                              className="text-gray-300 hover:text-white font-bold text-lg"
                              disabled={item.quantity <= 1}
                            >
                              -
                            </button>
                            <span className="text-white font-semibold min-w-[2rem] text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, 1)}
                              className="text-gray-300 hover:text-white font-bold text-lg"
                            >
                              +
                            </button>
                          </div>
                          
                          {user && (
                            <button
                              onClick={() => saveForLater(item)}
                              className="flex items-center gap-2 text-gray-400 hover:text-pink-400 transition"
                            >
                              <FaClock />
                              <span className="text-sm">Save for Later</span>
                            </button>
                          )}
                        </div>
                        
                        <div className="text-right">
                          <p className="text-2xl font-bold text-pink-400">₹{item.price * item.quantity}</p>
                          <p className="text-gray-400 text-sm">₹{item.price} each</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Saved for Later */}
              {savedForLater.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-2xl font-bold text-pink-400 mb-4">Saved for Later ({savedForLater.length})</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {savedForLater.map((item) => (
                      <div key={item.id} className="bg-white/5 border border-white/10 rounded-lg p-4">
                        <div className="flex gap-3">
                          <img
                            src={item.imageUrl || item.image || "https://via.placeholder.com/80x80?text=No+Image"}
                            alt={item.name}
                            className="w-20 h-20 object-cover rounded"
                          />
                          <div className="flex-1">
                            <h4 className="font-semibold mb-1">{item.name}</h4>
                            <p className="text-pink-400 font-bold">₹{item.price}</p>
                            <div className="flex gap-2 mt-2">
                              <button
                                onClick={() => moveToCart(item)}
                                className="bg-pink-600 hover:bg-pink-700 px-3 py-1 rounded text-sm transition"
                              >
                                Move to Cart
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Order Summary */}
            <div className="space-y-6">
              <div className="bg-white/5 border border-white/10 rounded-xl p-6 sticky top-6">
                <h3 className="text-2xl font-bold text-pink-400 mb-6">Order Summary</h3>
                
                {/* Coupon Section */}
                <div className="mb-6 p-4 bg-white/10 rounded-lg">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <FaPercent className="text-pink-400" />
                    Apply Coupon
                  </h4>
                  {!appliedCoupon ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Enter coupon code"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded focus:border-pink-500 focus:outline-none"
                      />
                      <button
                        onClick={applyCoupon}
                        className="bg-pink-600 hover:bg-pink-700 px-4 py-2 rounded font-semibold transition"
                      >
                        Apply
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between bg-green-600/20 border border-green-600/30 rounded p-3">
                      <div className="flex items-center gap-2">
                        <FaGift className="text-green-400" />
                        <span className="text-green-400 font-semibold">{appliedCoupon.code}</span>
                      </div>
                      <button
                        onClick={removeCoupon}
                        className="text-red-400 hover:text-red-300"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  )}
                  {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
                </div>

                {/* Price Breakdown */}
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span>Subtotal ({items.length} item{items.length !== 1 ? 's' : ''})</span>
                    <span>₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span className="text-green-400">Free</span>
                  </div>
                  {appliedCoupon && (
                    <div className="flex justify-between text-green-400">
                      <span>Discount ({appliedCoupon.code})</span>
                      <span>-₹{discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="border-t border-white/20 pt-3 flex justify-between text-xl font-bold">
                    <span>Total</span>
                    <span className="text-pink-400">₹{total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Security Badge */}
                <div className="flex items-center gap-2 text-gray-400 text-sm mb-4">
                  <FaShieldAlt className="text-green-400" />
                  <span>Secure checkout guaranteed</span>
                </div>

                {/* Checkout Button */}
                <button
                  onClick={() => navigate("/checkout")}
                  className="w-full bg-pink-600 hover:bg-pink-700 text-white py-4 rounded-lg font-semibold transition text-lg mb-4"
                >
                  Proceed to Checkout
                </button>

                <button
                  onClick={() => navigate("/shop")}
                  className="w-full bg-white/10 hover:bg-white/20 text-white py-3 rounded-lg font-semibold transition"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Recently Viewed & Recommendations */}
        {(recentlyViewed.length > 0 || recommendedProducts.length > 0) && (
          <div className="mt-12 space-y-8">
            {/* Recently Viewed */}
            {recentlyViewed.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-6">
                  <FaEye className="text-pink-400" />
                  <h3 className="text-2xl font-bold">Recently Viewed</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                  {recentlyViewed.map((product, index) => (
                    <div key={index} className="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition">
                      <img
                        src={product.imageUrl || "https://via.placeholder.com/200x200?text=No+Image"}
                        alt={product.name}
                        className="w-full h-32 object-cover rounded mb-3"
                      />
                      <h4 className="font-semibold mb-2 text-sm">{product.name}</h4>
                      <p className="text-pink-400 font-bold mb-3">₹{product.price}</p>
                      <button
                        onClick={() => {
                          addToCart(product);
                          trackViewProduct(product);
                        }}
                        className="w-full bg-pink-600 hover:bg-pink-700 px-3 py-2 rounded text-sm transition"
                      >
                        Add to Cart
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommended Products */}
            {recommendedProducts.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-6">
                  <FaHeart className="text-pink-400" />
                  <h3 className="text-2xl font-bold">You Might Also Like</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                  {recommendedProducts.map((product) => (
                    <div key={product.id} className="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition">
                      <img
                        src={product.imageUrl || "https://via.placeholder.com/200x200?text=No+Image"}
                        alt={product.name}
                        className="w-full h-32 object-cover rounded mb-3"
                      />
                      <h4 className="font-semibold mb-2 text-sm">{product.name}</h4>
                      <div className="flex items-center gap-1 mb-2">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className={`text-xs ${i < product.rating ? "text-yellow-400" : "text-gray-600"}`}>
                            ★
                          </span>
                        ))}
                        <span className="text-gray-400 text-xs ml-1">({product.rating})</span>
                      </div>
                      <p className="text-pink-400 font-bold mb-3">₹{product.price}</p>
                      <button
                        onClick={() => addToCart(product)}
                        className="w-full bg-pink-600 hover:bg-pink-700 px-3 py-2 rounded text-sm transition"
                      >
                        Add to Cart
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
