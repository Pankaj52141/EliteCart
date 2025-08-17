import React from "react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase";
import { collection, addDoc, Timestamp } from "firebase/firestore";

export default function Checkout() {
  const { items, clearCart } = useCart();
  const { user } = useAuth();
  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const [error, setError] = React.useState("");
  const [address, setAddress] = React.useState("");
  const [pincode, setPincode] = React.useState("");

  const handlePlaceOrder = async () => {
    setLoading(true);
    setError("");
    if (!address.trim() || !pincode.trim()) {
      setError("Please enter both your address and pincode.");
      setLoading(false);
      return;
    }
    if (!/^[1-9][0-9]{5}$/.test(pincode.trim())) {
      setError("Please enter a valid 6-digit pincode.");
      setLoading(false);
      return;
    }
    try {
      await addDoc(collection(db, "orders"), {
        userId: user?.uid || "guest",
        items,
        address,
        pincode,
        status: "Pending",
        paymentMethod: "COD",
        createdAt: Timestamp.now(),
      });
      setSuccess(true);
      clearCart();
    } catch (e) {
      setError("Failed to place order. Please try again. " + (e.message || ""));
    }
    setLoading(false);
  };
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white p-6">
      <h2 className="text-4xl font-bold mb-8 text-pink-500">Checkout</h2>
      {success ? (
        <div className="bg-green-700/80 p-8 rounded-xl shadow-md text-center">
          <h3 className="text-2xl font-bold mb-4">Order Placed!</h3>
          <p className="text-lg">Your order has been received. You will pay after delivery.</p>
        </div>
      ) : (
        <div className="bg-white/5 border border-white/10 p-6 rounded-xl shadow-md w-full max-w-md flex flex-col items-center">
          <p className="text-gray-400 mb-6">Order summary and payment options will go here.</p>
          <input
            type="text"
            className="w-full mb-2 px-4 py-2 rounded bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-pink-600"
            placeholder="Enter your 6-digit pincode..."
            value={pincode}
            onChange={e => setPincode(e.target.value)}
            required
            maxLength={6}
            pattern="[0-9]{6}"
          />
          <textarea
            className="w-full mb-4 px-4 py-2 rounded bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-pink-600"
            rows={3}
            placeholder="Enter your delivery address..."
            value={address}
            onChange={e => setAddress(e.target.value)}
            required
          />
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <button
            onClick={handlePlaceOrder}
            disabled={loading || items.length === 0}
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-2 rounded-xl transition duration-300 text-lg font-semibold disabled:opacity-50"
          >
            {loading ? "Placing Order..." : "Place Order (Cash on Delivery)"}
          </button>
        </div>
      )}
    </div>
  );
}
