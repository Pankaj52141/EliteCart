

import { useAuth } from "../context/AuthContext";
import { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, getDocs, addDoc, Timestamp } from "firebase/firestore";
import ProductCard from "../components/ProductCard";
import { FaShoppingCart, FaSearch, FaFilter, FaStar, FaTh, FaList, FaTimes } from "react-icons/fa";
import { useCart } from "../context/CartContext";

const categories = [
  "All",
  "Clothing",
  "Footwear", 
  "Electronics",
  "Food",
  "Decoration",
  "Accessories",
  "Beauty",
  "Home",
  "Books",
  "Toys"
];

const sortOptions = [
  { value: "name-asc", label: "Name (A-Z)" },
  { value: "name-desc", label: "Name (Z-A)" },
  { value: "price-asc", label: "Price (Low to High)" },
  { value: "price-desc", label: "Price (High to Low)" },
  { value: "rating-desc", label: "Highest Rated" },
  { value: "newest", label: "Newest First" }
];

export default function Shop() {
  const { items: cart, addToCart } = useCart();
  const { user } = useAuth();
  
  // Filter & Search States
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [selectedRating, setSelectedRating] = useState(0);
  const [sortBy, setSortBy] = useState("name-asc");
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState("grid"); // grid or list
  
  // Data States
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null); // For quick view modal

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      try {
        const snap = await getDocs(collection(db, "products"));
        const productsData = snap.docs.map(doc => ({ 
          id: doc.id, 
          ...doc.data(),
          rating: doc.data().rating || Math.floor(Math.random() * 2) + 4, // Mock ratings 4-5
          reviews: doc.data().reviews || Math.floor(Math.random() * 100) + 10 // Mock review count
        }));
        setProducts(productsData);
      } catch (err) {
        console.error("Error fetching products:", err);
      }
      setLoading(false);
    }
    fetchProducts();
  }, []);

  const handleCategoryChange = async (cat) => {
    setSelectedCategory(cat);
    if (user?.uid && cat !== "All") {
      try {
        await addDoc(collection(db, "searchHistory"), {
          userId: user.uid,
          query: cat,
          timestamp: Timestamp.now(),
        });
      } catch (e) {
        console.error("Error saving search:", e);
      }
    }
  };

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (user?.uid && query.trim()) {
      try {
        await addDoc(collection(db, "searchHistory"), {
          userId: user.uid,
          query: query.trim(),
          timestamp: Timestamp.now(),
        });
      } catch (e) {
        console.error("Error saving search:", e);
      }
    }
  };

  const clearFilters = () => {
    setSelectedCategory("All");
    setSearchQuery("");
    setPriceRange({ min: "", max: "" });
    setSelectedRating(0);
    setSortBy("name-asc");
  };

  // Apply all filters and sorting
  const getFilteredAndSortedProducts = () => {
    let filtered = products;

    // Category filter
    if (selectedCategory !== "All") {
      filtered = filtered.filter(p =>
        p.category?.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.name?.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query) ||
        p.category?.toLowerCase().includes(query)
      );
    }

    // Price range filter
    if (priceRange.min || priceRange.max) {
      filtered = filtered.filter(p => {
        const price = parseFloat(p.price);
        const min = priceRange.min ? parseFloat(priceRange.min) : 0;
        const max = priceRange.max ? parseFloat(priceRange.max) : Infinity;
        return price >= min && price <= max;
      });
    }

    // Rating filter
    if (selectedRating > 0) {
      filtered = filtered.filter(p => p.rating >= selectedRating);
    }

    // Sorting
    switch (sortBy) {
      case "name-desc":
        filtered.sort((a, b) => (b.name || "").localeCompare(a.name || ""));
        break;
      case "price-asc":
        filtered.sort((a, b) => parseFloat(a.price || 0) - parseFloat(b.price || 0));
        break;
      case "price-desc":
        filtered.sort((a, b) => parseFloat(b.price || 0) - parseFloat(a.price || 0));
        break;
      case "rating-desc":
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case "newest":
        filtered.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        break;
      default: // name-asc
        filtered.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    }

    return filtered;
  };

  const filteredProducts = getFilteredAndSortedProducts();

  // Quick View Modal Component
  const QuickViewModal = ({ product, onClose }) => {
    if (!product) return null;

    return (
      <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
        <div className="bg-gray-900 border border-white/20 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-bold text-pink-400">{product.name}</h3>
              <button onClick={onClose} className="text-gray-400 hover:text-white">
                <FaTimes size={20} />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <img
                  src={product.imageUrl || "/placeholder-product.jpg"}
                  alt={product.name}
                  className="w-full h-64 object-cover rounded-lg"
                />
              </div>
              
              <div>
                <p className="text-gray-300 mb-4">{product.description}</p>
                <div className="space-y-2 mb-4">
                  <p className="text-2xl font-bold text-pink-400">₹{product.price}</p>
                  <div className="flex items-center gap-2">
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <FaStar key={i} className={i < product.rating ? "text-yellow-400" : "text-gray-600"} />
                      ))}
                    </div>
                    <span className="text-gray-400">({product.reviews} reviews)</span>
                  </div>
                  <p className="text-gray-400">Category: {product.category}</p>
                </div>
                
                <button
                  onClick={() => {
                    addToCart(product);
                    onClose();
                  }}
                  className="w-full bg-pink-600 hover:bg-pink-700 text-white py-3 rounded-lg font-semibold transition"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white px-6 py-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h2 className="text-4xl font-extrabold text-pink-500">Shop Products</h2>
        <div className="flex items-center gap-4">
          {/* Cart Icon */}
          <div className="flex items-center gap-2 text-white relative">
            <FaShoppingCart className="text-2xl" />
            {cart.length > 0 && (
              <span className="bg-pink-600 text-xs px-2 py-0.5 rounded-full absolute -top-2 -right-2">
                {cart.length}
              </span>
            )}
          </div>
          
          {/* View Mode Toggle */}
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded ${viewMode === "grid" ? "bg-pink-600" : "bg-white/10"}`}
            >
              <FaTh />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded ${viewMode === "list" ? "bg-pink-600" : "bg-white/10"}`}
            >
              <FaList />
            </button>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:border-pink-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Filters Section */}
      <div className="mb-8">
        {/* Filter Toggle for Mobile */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="md:hidden flex items-center gap-2 bg-white/10 px-4 py-2 rounded-lg"
          >
            <FaFilter />
            Filters
          </button>
          
          {/* Results Count */}
          <div className="text-gray-400">
            {filteredProducts.length} products found
          </div>
        </div>

        {/* Filters Container */}
        <div className={`${showFilters ? 'block' : 'hidden md:block'} space-y-6`}>
          {/* Category Pills */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Categories</h3>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => handleCategoryChange(cat)}
                  className={`px-4 py-2 rounded-full border transition duration-300 ${
                    selectedCategory === cat
                      ? "bg-pink-600 border-pink-600"
                      : "border-gray-600 hover:border-white"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Price Range</h3>
            <div className="flex gap-4 items-center">
              <input
                type="number"
                placeholder="Min"
                value={priceRange.min}
                onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                className="w-24 px-3 py-2 bg-white/10 border border-white/20 rounded-lg focus:border-pink-500 focus:outline-none"
              />
              <span className="text-gray-400">to</span>
              <input
                type="number"
                placeholder="Max"
                value={priceRange.max}
                onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                className="w-24 px-3 py-2 bg-white/10 border border-white/20 rounded-lg focus:border-pink-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Rating Filter */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Minimum Rating</h3>
            <div className="flex gap-2">
              {[0, 1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  onClick={() => setSelectedRating(rating)}
                  className={`flex items-center gap-1 px-3 py-2 rounded-lg border transition ${
                    selectedRating === rating
                      ? "bg-pink-600 border-pink-600"
                      : "border-gray-600 hover:border-white"
                  }`}
                >
                  <FaStar className="text-yellow-400" />
                  <span>{rating === 0 ? "All" : `${rating}+`}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Sort Options */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Sort By</h3>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:border-pink-500 focus:outline-none"
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value} className="bg-gray-800">
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Clear Filters */}
          <button
            onClick={clearFilters}
            className="text-pink-400 hover:text-pink-300 underline"
          >
            Clear All Filters
          </button>
        </div>
      </div>

      {/* Product Grid/List */}
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-pink-500 border-solid"></div>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400 text-xl mb-4">No products found</p>
          <p className="text-gray-500 mb-6">Try adjusting your filters or search terms</p>
          <button
            onClick={clearFilters}
            className="bg-pink-600 hover:bg-pink-700 px-6 py-2 rounded-lg"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className={
          viewMode === "grid" 
            ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
            : "space-y-4"
        }>
          {filteredProducts.map((product) => (
            <div key={product.id} className={viewMode === "list" ? "flex gap-4 bg-white/5 p-4 rounded-lg" : ""}>
              {viewMode === "list" ? (
                <>
                  <img
                    src={product.imageUrl || "/placeholder-product.jpg"}
                    alt={product.name}
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-pink-400 mb-2">{product.name}</h3>
                    <p className="text-gray-400 text-sm mb-2 line-clamp-2">{product.description}</p>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <FaStar key={i} className={i < product.rating ? "text-yellow-400" : "text-gray-600"} size={12} />
                        ))}
                      </div>
                      <span className="text-gray-400 text-sm">({product.reviews})</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-pink-400">₹{product.price}</span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setSelectedProduct(product)}
                          className="bg-white/10 hover:bg-white/20 px-3 py-1 rounded text-sm"
                        >
                          Quick View
                        </button>
                        <button
                          onClick={() => addToCart(product)}
                          className="bg-pink-600 hover:bg-pink-700 px-4 py-1 rounded text-sm"
                        >
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="relative">
                  <ProductCard
                    product={product}
                    onAddToCart={addToCart}
                  />
                  <button
                    onClick={() => setSelectedProduct(product)}
                    className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition"
                    title="Quick View"
                  >
                    👁️
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Quick View Modal */}
      <QuickViewModal 
        product={selectedProduct} 
        onClose={() => setSelectedProduct(null)} 
      />
    </div>
  );
}
