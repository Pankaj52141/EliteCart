import React, { useEffect, useState } from "react";
import { db } from "../../firebase";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [editId, setEditId] = useState(null);
  const [editStatus, setEditStatus] = useState("");

  useEffect(() => {
    async function fetchOrders() {
      setLoading(true);
      try {
        const snap = await getDocs(collection(db, "orders"));
        setOrders(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (err) {
        setError("Failed to fetch orders. Check permissions or try again later.");
      }
      setLoading(false);
    }
    fetchOrders();
  }, []);

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "orders", id));
      setOrders(orders.filter(o => o.id !== id));
    } catch (err) {
      setError("Failed to delete order.");
    }
  };

  const handleEditStatus = (order) => {
    setEditId(order.id);
    setEditStatus(order.status || "");
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    try {
      await updateDoc(doc(db, "orders", editId), { status: editStatus });
      setOrders(orders.map(o => o.id === editId ? { ...o, status: editStatus } : o));
      setEditId(null);
      setEditStatus("");
    } catch (err) {
      setError("Failed to update order status.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white p-8">
      <h1 className="text-3xl font-bold mb-6 text-green-400">Order Management</h1>
      <p className="mb-4 text-gray-400">Here you can view, edit, delete, or search orders.</p>
      <input
        type="text"
        placeholder="Search by Order ID, User ID, or Status..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="w-full max-w-md mb-6 px-4 py-2 rounded bg-white/10 text-white border border-white/20"
      />
      {error && <div className="text-red-500 bg-red-100 p-2 rounded mb-4">{error}</div>}
      {loading ? (
        <div className="text-center text-gray-400">Loading...</div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {orders.filter(order =>
            order.id.toLowerCase().includes(search.toLowerCase()) ||
            (order.userId && order.userId.toLowerCase().includes(search.toLowerCase())) ||
            (order.status && order.status.toLowerCase().includes(search.toLowerCase()))
          ).length === 0 ? (
            <div className="text-gray-300">No orders found.</div>
          ) : (
            orders.filter(order =>
              order.id.toLowerCase().includes(search.toLowerCase()) ||
              (order.userId && order.userId.toLowerCase().includes(search.toLowerCase())) ||
              (order.status && order.status.toLowerCase().includes(search.toLowerCase()))
            ).map(order => (
              <div key={order.id} className="bg-white/10 rounded-xl p-6 shadow-xl">
                <h2 className="text-lg font-bold text-green-300 mb-2">Order ID: {order.id}</h2>
                <p className="text-gray-200">User: {order.userId}</p>
                <p className="text-gray-200">Total: ₹{order.total || 0}</p>
                <p className="text-gray-400">Status: {order.status || "N/A"}</p>
                {editId === order.id ? (
                  <form onSubmit={handleUpdateStatus} className="mt-2 space-y-2">
                    <select
                      value={editStatus}
                      onChange={e => setEditStatus(e.target.value)}
                      className="w-full px-4 py-2 rounded bg-white/10 text-white border border-white/20"
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                    <button type="submit" className="w-full bg-green-600 hover:bg-green-700 px-4 py-2 rounded-xl text-white font-bold">Update Status</button>
                    <button type="button" onClick={() => { setEditId(null); setEditStatus(""); }} className="w-full mt-2 bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded-xl text-white font-bold">Cancel</button>
                  </form>
                ) : (
                  <button
                    className="mt-2 w-full bg-yellow-600 hover:bg-yellow-700 px-4 py-2 rounded-xl text-white font-bold"
                    onClick={() => handleEditStatus(order)}
                  >
                    Edit Status
                  </button>
                )}
                <details className="mt-2">
                  <summary className="cursor-pointer text-blue-400">View Details</summary>
                  <div className="mt-2 text-sm text-gray-300">
                    <pre>{JSON.stringify(order, null, 2)}</pre>
                  </div>
                </details>
                <button
                  className="mt-4 w-full bg-red-600 hover:bg-red-700 px-4 py-2 rounded-xl text-white font-bold"
                  onClick={() => handleDelete(order.id)}
                >
                  Delete Order
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
