
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Tilt from "react-parallax-tilt";
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { db } from "../firebase";
import { collection, getDocs, query, limit, orderBy } from "firebase/firestore";
import { FaStar, FaShoppingCart, FaArrowRight, FaTags, FaFire, FaGift, FaUsers, FaShieldAlt, FaTruck } from "react-icons/fa";

export default function Home() {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);

  const heroSlides = [
    {
      title: "Welcome to EliteCart",
      subtitle: "Discover premium products with unbeatable prices",
      image: "/hero-1.jpg",
      cta: "Shop Now",
      link: "/shop"
    },
    {
      title: "Latest Collection",
      subtitle: "Explore trending items handpicked for you",
      image: "/hero-2.jpg", 
      cta: "View Collection",
      link: "/shop"
    },
    {
      title: "Special Offers",
      subtitle: "Up to 50% off on selected categories",
      image: "/hero-3.jpg",
      cta: "Grab Deals",
      link: "/shop"
    }
  ];

  const categoryList = [
    { name: "Electronics", icon: "📱", color: "from-blue-500 to-blue-600" },
    { name: "Clothing", icon: "👕", color: "from-green-500 to-green-600" },
    { name: "Beauty", icon: "💄", color: "from-pink-500 to-pink-600" },
    { name: "Home", icon: "🏠", color: "from-yellow-500 to-yellow-600" },
    { name: "Books", icon: "📚", color: "from-purple-500 to-purple-600" },
    { name: "Sports", icon: "⚽", color: "from-red-500 to-red-600" }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      rating: 5,
      comment: "Amazing shopping experience! Fast delivery and quality products.",
      avatar: "https://ui-avatars.com/api/?name=Sarah+Johnson&background=random"
    },
    {
      name: "Mike Chen",
      rating: 5,
      comment: "Love the variety and customer service. Highly recommended!",
      avatar: "https://ui-avatars.com/api/?name=Mike+Chen&background=random"
    },
    {
      name: "Emily Davis",
      rating: 4,
      comment: "Great platform with competitive prices and quick checkout.",
      avatar: "https://ui-avatars.com/api/?name=Emily+Davis&background=random"
    }
  ];

  const features = [
    {
      icon: FaTruck,
      title: "Free Shipping",
      description: "Free delivery on orders above ₹500"
    },
    {
      icon: FaShieldAlt,
      title: "Secure Payment",
      description: "100% secure and encrypted transactions"
    },
    {
      icon: FaGift,
      title: "Easy Returns",
      description: "30-day hassle-free return policy"
    },
    {
      icon: FaUsers,
      title: "24/7 Support",
      description: "Round-the-clock customer assistance"
    }
  ];

  useEffect(() => {
    fetchFeaturedProducts();
    
    // Auto-rotate hero slides
    const slideInterval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);

    return () => clearInterval(slideInterval);
  }, []);

  const fetchFeaturedProducts = async () => {
    try {
      const q = query(collection(db, "products"), limit(8));
      const snapshot = await getDocs(q);
      const products = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        rating: Math.floor(Math.random() * 2) + 4, // Mock rating 4-5
        originalPrice: doc.data().price + Math.floor(Math.random() * 200) + 100 // Mock original price
      }));
      setFeaturedProducts(products);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white">
      
      {/* Hero Carousel */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent z-10"></div>
        
        {/* Background Slides */}
        <div className="absolute inset-0">
          {heroSlides.map((slide, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentSlide ? "opacity-100" : "opacity-0"
              }`}
              style={{
                backgroundImage: `linear-gradient(135deg, rgba(236, 72, 153, 0.3), rgba(59, 130, 246, 0.3)), url('https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')`,
                backgroundSize: "cover",
                backgroundPosition: "center"
              }}
            />
          ))}
        </div>

        {/* Hero Content */}
        <div className="relative z-20 text-center max-w-4xl mx-auto px-6">
          <motion.h1
            key={currentSlide}
            className="text-5xl md:text-7xl font-extrabold mb-6 bg-gradient-to-r from-pink-400 to-purple-400 text-transparent bg-clip-text"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            {heroSlides[currentSlide].title}
          </motion.h1>
          
          <motion.p
            key={`subtitle-${currentSlide}`}
            className="text-xl md:text-2xl text-gray-300 mb-8"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {heroSlides[currentSlide].subtitle}
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <Link
              to={heroSlides[currentSlide].link}
              className="bg-pink-600 hover:bg-pink-700 px-8 py-4 rounded-lg font-semibold text-lg transition flex items-center justify-center gap-2"
            >
              {heroSlides[currentSlide].cta}
              <FaArrowRight />
            </Link>
            
            {!user && (
              <Link
                to="/auth"
                className="bg-white/10 hover:bg-white/20 border border-white/30 px-8 py-4 rounded-lg font-semibold text-lg transition"
              >
                Join EliteCart
              </Link>
            )}
          </motion.div>
        </div>

        {/* Slide Indicators */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-2 z-20">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition ${
                index === currentSlide ? "bg-pink-500" : "bg-white/30"
              }`}
            />
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  className="text-center p-6 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition"
                  initial={{ y: 50, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Icon className="text-4xl text-pink-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-400">{feature.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 px-6 bg-white/5">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-12"
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-pink-400 mb-4">Shop by Category</h2>
            <p className="text-gray-400 text-lg">Explore our diverse range of product categories</p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {categoryList.map((category, index) => (
              <motion.div
                key={index}
                className="group cursor-pointer"
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05 }}
                onClick={() => window.location.href = `/shop?category=${category.name}`}
              >
                <div className={`bg-gradient-to-r ${category.color} p-6 rounded-xl text-center shadow-lg group-hover:shadow-xl transition`}>
                  <div className="text-4xl mb-3">{category.icon}</div>
                  <h3 className="font-semibold text-white">{category.name}</h3>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-12"
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center justify-center gap-2 mb-4">
              <FaFire className="text-orange-500 text-2xl" />
              <h2 className="text-4xl font-bold text-pink-400">Featured Products</h2>
            </div>
            <p className="text-gray-400 text-lg">Handpicked products just for you</p>
          </motion.div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4 animate-pulse">
                  <div className="bg-gray-600 h-48 rounded-lg mb-4"></div>
                  <div className="bg-gray-600 h-4 rounded mb-2"></div>
                  <div className="bg-gray-600 h-4 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {featuredProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  className="group bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition duration-300"
                  initial={{ y: 50, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -5 }}
                >
                  <div className="relative mb-4">
                    <img
                      src={product.imageUrl || "https://via.placeholder.com/300x300?text=Product"}
                      alt={product.name}
                      className="w-full h-48 object-cover rounded-lg group-hover:scale-105 transition duration-300"
                    />
                    {product.originalPrice > product.price && (
                      <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-semibold">
                        {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                      </div>
                    )}
                  </div>
                  
                  <h3 className="font-semibold text-white mb-2 group-hover:text-pink-400 transition">
                    {product.name}
                  </h3>
                  
                  <div className="flex items-center gap-1 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <FaStar
                        key={i}
                        className={`text-sm ${i < product.rating ? "text-yellow-400" : "text-gray-600"}`}
                      />
                    ))}
                    <span className="text-gray-400 text-sm ml-1">({product.rating})</span>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-pink-400 font-bold text-lg">₹{product.price}</span>
                    {product.originalPrice > product.price && (
                      <span className="text-gray-500 line-through text-sm">₹{product.originalPrice}</span>
                    )}
                  </div>
                  
                  <button
                    onClick={() => addToCart(product)}
                    className="w-full bg-pink-600 hover:bg-pink-700 text-white py-2 rounded-lg font-semibold transition flex items-center justify-center gap-2"
                  >
                    <FaShoppingCart />
                    Add to Cart
                  </button>
                </motion.div>
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link
              to="/shop"
              className="bg-pink-600 hover:bg-pink-700 px-8 py-3 rounded-lg font-semibold transition inline-flex items-center gap-2"
            >
              View All Products
              <FaArrowRight />
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-6 bg-white/5">
        <div className="max-w-4xl mx-auto">
          <motion.div
            className="text-center mb-12"
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-pink-400 mb-4">What Our Customers Say</h2>
            <p className="text-gray-400 text-lg">Join thousands of satisfied customers</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                className="bg-white/10 border border-white/20 rounded-xl p-6 text-center"
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                viewport={{ once: true }}
              >
                <img
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  className="w-16 h-16 rounded-full mx-auto mb-4"
                />
                
                <div className="flex justify-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <FaStar
                      key={i}
                      className={`${i < testimonial.rating ? "text-yellow-400" : "text-gray-600"}`}
                    />
                  ))}
                </div>
                
                <p className="text-gray-300 mb-4 italic">"{testimonial.comment}"</p>
                <h4 className="font-semibold text-pink-400">{testimonial.name}</h4>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-pink-400 mb-4">Stay Updated</h2>
            <p className="text-gray-400 text-lg mb-8">
              Subscribe to our newsletter for exclusive deals and latest updates
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:border-pink-500 focus:outline-none"
              />
              <button className="bg-pink-600 hover:bg-pink-700 px-6 py-3 rounded-lg font-semibold transition">
                Subscribe
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/10">
        <div className="max-w-6xl mx-auto text-center">
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-pink-400 mb-2">EliteCart</h3>
            <p className="text-gray-400">Your premium shopping destination</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-semibold mb-4">Shop</h4>
              <div className="space-y-2 text-gray-400">
                <Link to="/shop" className="block hover:text-pink-400 transition">All Products</Link>
                <Link to="/shop?category=Electronics" className="block hover:text-pink-400 transition">Electronics</Link>
                <Link to="/shop?category=Clothing" className="block hover:text-pink-400 transition">Clothing</Link>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Account</h4>
              <div className="space-y-2 text-gray-400">
                <Link to="/profile" className="block hover:text-pink-400 transition">My Profile</Link>
                <Link to="/cart" className="block hover:text-pink-400 transition">Shopping Cart</Link>
                <Link to="/auth" className="block hover:text-pink-400 transition">Sign In</Link>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <div className="space-y-2 text-gray-400">
                <a href="#" className="block hover:text-pink-400 transition">Help Center</a>
                <a href="#" className="block hover:text-pink-400 transition">Contact Us</a>
                <a href="#" className="block hover:text-pink-400 transition">Shipping Info</a>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Connect</h4>
              <div className="space-y-2 text-gray-400">
                <a href="#" className="block hover:text-pink-400 transition">Facebook</a>
                <a href="#" className="block hover:text-pink-400 transition">Twitter</a>
                <a href="#" className="block hover:text-pink-400 transition">Instagram</a>
              </div>
            </div>
          </div>
          
          <div className="pt-8 border-t border-white/10 text-gray-400">
            <p>&copy; {new Date().getFullYear()} EliteCart. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
