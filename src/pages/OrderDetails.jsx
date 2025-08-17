import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";

export default function OrderDetails() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchOrder() {
      try {
        const docRef = doc(db, "orders", orderId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setOrder(docSnap.data());
        } else {
          setError("Order not found.");
        }
      } catch (e) {
        setError("Failed to fetch order.");
      }
      setLoading(false);
    }
    fetchOrder();
  }, [orderId]);

  if (loading) return <div className="text-center p-10 text-pink-500">Loading...</div>;
  if (error) return <div className="text-center p-10 text-red-500">{error}</div>;
  if (!order) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white p-6 flex flex-col items-center">
      <h2 className="text-3xl font-bold mb-6 text-pink-500">Order Details</h2>
      <div className="bg-white/5 border border-white/10 rounded-xl shadow-lg p-8 w-full max-w-xl">
        <p className="mb-2 text-lg font-semibold">Order ID: <span className="text-pink-400">{orderId}</span></p>
        <p className="mb-2">Status: <span className="text-yellow-400">{order.status}</span></p>
        <p className="mb-2">Payment Method: <span className="text-green-400">{order.paymentMethod}</span></p>
        <p className="mb-2">Address: <span className="text-gray-300">{order.address}</span></p>
        <p className="mb-2">Pincode: <span className="text-gray-300">{order.pincode}</span></p>
        <h3 className="mt-6 mb-2 text-lg font-bold">Items:</h3>
        <ul className="mb-4">
          {order.items && order.items.map((item, idx) => (
            <li key={idx} className="mb-2 flex justify-between">
              <span>{item.name}</span>
              <span>Qty: {item.quantity}</span>
              <span>₹{item.price}</span>
            </li>
          ))}
        </ul>
        <p className="text-xl font-bold text-pink-400">Total: ₹{order.items && order.items.reduce((acc, item) => acc + item.price * item.quantity, 0)}</p>
      </div>
    </div>
  );
}
