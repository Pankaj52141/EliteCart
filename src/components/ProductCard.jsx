// src/components/ProductCard.jsx
export default function ProductCard({ product, onAddToCart }) {
  const placeholder = "https://via.placeholder.com/300x200?text=No+Image";
  const validImage = product.image && product.image.startsWith("http") ? product.image : placeholder;
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-white shadow-xl hover:shadow-pink-500/20 transition duration-300 flex flex-col">
      <img
        src={validImage}
        alt={product.name || "Product image"}
        className="w-full h-48 object-cover rounded-lg mb-4"
        loading="lazy"
      />
      <h3 className="text-xl font-semibold">{product.name}</h3>
      <p className="text-pink-400 font-bold mb-4">₹{product.price}</p>
      <button
        onClick={() => onAddToCart(product)}
        className="mt-auto bg-pink-600 hover:bg-pink-700 py-2 px-4 rounded-xl transition"
      >
        Add to Cart
      </button>
    </div>
  );
}
