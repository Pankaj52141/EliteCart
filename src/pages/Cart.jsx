import { useCart } from "../context/CartContext";
import { FaTrash, FaShoppingCart } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export default function Cart() {
  const { items, updateQuantity } = useCart();
  const navigate = useNavigate();

  const total = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white p-6 md:p-12">
      <h2 className="text-4xl font-bold mb-8 text-pink-500">Your Cart</h2>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center mt-20 text-gray-400">
          <FaShoppingCart className="text-6xl mb-4" />
          <p className="text-xl">Your cart is empty</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex flex-col md:flex-row items-center justify-between bg-white/5 border border-white/10 p-4 rounded-xl shadow-md"
            >
              <div className="flex items-center space-x-4 w-full md:w-1/2">
                <img
                  src={
                    item.image && item.image.startsWith("http")
                      ? item.image
                      : "https://via.placeholder.com/100x100?text=No+Image"
                  }
                  alt={item.name || "Product image"}
                  className="w-20 h-20 rounded-lg object-cover"
                  loading="lazy"
                />
                <div>
                  <h3 className="text-lg font-semibold">{item.name}</h3>
                  <p className="text-gray-400">₹{item.price}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 mt-4 md:mt-0">
                <button
                  onClick={() => updateQuantity(item.id, -1)}
                  className="bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded text-lg"
                >
                  -
                </button>
                <span className="text-white text-lg">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.id, 1)}
                  className="bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded text-lg"
                >
                  +
                </button>
                <button
                  onClick={() => updateQuantity(item.id, -item.quantity)}
                  className="ml-2 text-red-500 hover:text-red-700"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          ))}

          {/* Total & Checkout */}
          <div className="mt-8 bg-white/5 border border-white/10 p-6 rounded-xl text-right shadow-inner">
            <p className="text-xl font-bold text-gray-300">
              Total: <span className="text-pink-400">₹{total}</span>
            </p>
            <button
              onClick={() => navigate("/checkout")}
              className="mt-4 bg-pink-600 hover:bg-pink-700 text-white px-6 py-2 rounded-xl transition duration-300"
            >
              Proceed to Payment
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
