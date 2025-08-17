import { useAuth } from "../context/AuthContext";
import { Navigate, useNavigate } from "react-router-dom";
import { FaUsers, FaBoxOpen, FaClipboardList } from "react-icons/fa";

export default function Admin() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return <div className="text-white p-8">Loading...</div>;
  }

  if (!user || user.email !== "pankajjaiswal816117@gmail.com") {
    return <Navigate to="/" />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white p-8">
      <header className="mb-10">
        <h1 className="text-4xl font-extrabold text-pink-500">Admin Dashboard</h1>
        <p className="text-gray-400 mt-2">Welcome, Admin! You have full control over the system.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Products Section */}
        <div className="bg-white/5 rounded-2xl p-6 border border-white/10 shadow-xl hover:shadow-pink-500/20 transition">
          <div className="flex items-center space-x-4">
            <FaBoxOpen className="text-4xl text-pink-500" />
            <div>
              <h2 className="text-xl font-semibold">Manage Products</h2>
              <p className="text-gray-400 text-sm">Add, edit, or remove product listings.</p>
            </div>
          </div>
          <button
            className="mt-4 w-full bg-pink-600 hover:bg-pink-700 px-4 py-2 rounded-xl transition"
            onClick={() => navigate("/admin/products")}
          >
            Go to Products
          </button>
        </div>

        {/* Users Section */}
        <div className="bg-white/5 rounded-2xl p-6 border border-white/10 shadow-xl hover:shadow-blue-500/20 transition">
          <div className="flex items-center space-x-4">
            <FaUsers className="text-4xl text-blue-400" />
            <div>
              <h2 className="text-xl font-semibold">User Management</h2>
              <p className="text-gray-400 text-sm">View or modify user roles and data.</p>
            </div>
          </div>
          <button
            className="mt-4 w-full bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-xl transition"
            onClick={() => navigate("/admin/users")}
          >
            Manage Users
          </button>
        </div>

        {/* Orders Section */}
        <div className="bg-white/5 rounded-2xl p-6 border border-white/10 shadow-xl hover:shadow-green-500/20 transition">
          <div className="flex items-center space-x-4">
            <FaClipboardList className="text-4xl text-green-400" />
            <div>
              <h2 className="text-xl font-semibold">Orders & Reports</h2>
              <p className="text-gray-400 text-sm">Track orders and generate reports.</p>
            </div>
          </div>
          <button
            className="mt-4 w-full bg-green-600 hover:bg-green-700 px-4 py-2 rounded-xl transition"
            onClick={() => navigate("/admin/orders")}
          >
            View Orders
          </button>
        </div>
      </div>

      {/* Add more admin tools here */}
      <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white/5 rounded-2xl p-6 border border-white/10 shadow-xl hover:shadow-red-500/20 transition">
          <h2 className="text-xl font-semibold mb-2">Generate Sales Report</h2>
          <button
            className="w-full bg-red-500 hover:bg-red-600 px-4 py-2 rounded-xl transition"
            onClick={() => navigate("/admin/reports")}
          >
            Generate Report
          </button>
        </div>
      </div>
    </div>
  );
}
