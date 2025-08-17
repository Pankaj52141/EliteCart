

import { useAuth } from "../context/AuthContext";
import { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, getDocs, addDoc, Timestamp } from "firebase/firestore";
import ProductCard from "../components/ProductCard";
import { FaShoppingCart } from "react-icons/fa";


/**
 * Shop.jsx
 * Public shop page for EliteCart. Fetches products from Firestore, supports category filter.
 */
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

export default function Shop() {
  const { items: cart, addToCart } = useCart();
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      try {
        const snap = await getDocs(collection(db, "products"));
        setProducts(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (err) {
        // Optionally handle error
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
        // Optionally handle error
      }
    }
  };

  const filteredProducts =
    selectedCategory === "All"
      ? products
      : products.filter((p) =>
          p.category &&
          p.category.trim().toLowerCase() === selectedCategory.trim().toLowerCase()
        );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white px-6 py-10">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-4xl font-extrabold text-pink-500">Shop Products</h2>
        <div className="flex items-center gap-2 text-white relative">
          <FaShoppingCart className="text-2xl" />
          <span className="bg-pink-600 text-xs px-2 py-0.5 rounded-full absolute -top-2 -right-2">
            {cart.length}
          </span>
        </div>
      </div>

      {/* Category Filters */}
      <div className="flex flex-wrap gap-4 mb-8">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => handleCategoryChange(cat)}
            className={`px-4 py-1 rounded-full border transition duration-300 ${
              selectedCategory === cat
                ? "bg-pink-600 border-pink-600"
                : "border-gray-600 hover:border-white"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Product Grid */}
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-pink-500 border-solid"></div>
        </div>
      ) : filteredProducts.length === 0 ? (
        <p className="text-gray-400 text-center">No products in this category.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={addToCart}
            />
          ))}
        </div>
      )}
    </div>
  );
}
