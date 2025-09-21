import { useAuth } from "../context/AuthContext";
import { Navigate, useNavigate } from "react-router-dom";
import { useState } from "react";
import { FaUsers, FaBoxOpen, FaClipboardList, FaChartLine, FaCog, FaFileAlt } from "react-icons/fa";
import AdminAnalytics from "../components/admin/AdminAnalytics";

export default function Admin() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-pink-500"></div>
      </div>
    );
  }

  if (!user || user.email !== "pankajjaiswal816117@gmail.com") {
    return <Navigate to="/" />;
  }

  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: FaChartLine },
    { id: "analytics", label: "Analytics", icon: FaFileAlt },
    { id: "products", label: "Products", icon: FaBoxOpen },
    { id: "users", label: "Users", icon: FaUsers },
    { id: "orders", label: "Orders", icon: FaClipboardList },
    { id: "settings", label: "Settings", icon: FaCog }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white">
      {/* Header */}
      <header className="bg-white/5 border-b border-white/10 p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-extrabold text-pink-500">Admin Dashboard</h1>
          <p className="text-gray-400 mt-2">Welcome, Admin! Manage your EliteCart platform</p>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white/5 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex space-x-8 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-4 border-b-2 font-medium text-sm whitespace-nowrap transition ${
                    activeTab === tab.id
                      ? "border-pink-500 text-pink-400"
                      : "border-transparent text-gray-400 hover:text-white hover:border-gray-300"
                  }`}
                >
                  <Icon />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Content Area */}
      <div className="max-w-7xl mx-auto p-6">
        {activeTab === "dashboard" && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Products Section */}
              <div className="bg-white/5 rounded-2xl p-6 border border-white/10 shadow-xl hover:shadow-pink-500/20 transition group">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="p-3 bg-pink-600/20 rounded-lg group-hover:bg-pink-600/30 transition">
                    <FaBoxOpen className="text-2xl text-pink-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold">Manage Products</h2>
                    <p className="text-gray-400 text-sm">Add, edit, or remove product listings</p>
                  </div>
                </div>
                <button
                  className="w-full bg-pink-600 hover:bg-pink-700 px-4 py-3 rounded-xl transition font-semibold"
                  onClick={() => navigate("/admin/products")}
                >
                  Go to Products
                </button>
              </div>

              {/* Users Section */}
              <div className="bg-white/5 rounded-2xl p-6 border border-white/10 shadow-xl hover:shadow-blue-500/20 transition group">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="p-3 bg-blue-600/20 rounded-lg group-hover:bg-blue-600/30 transition">
                    <FaUsers className="text-2xl text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold">User Management</h2>
                    <p className="text-gray-400 text-sm">View and manage user accounts</p>
                  </div>
                </div>
                <button
                  className="w-full bg-blue-600 hover:bg-blue-700 px-4 py-3 rounded-xl transition font-semibold"
                  onClick={() => navigate("/admin/users")}
                >
                  Manage Users
                </button>
              </div>

              {/* Orders Section */}
              <div className="bg-white/5 rounded-2xl p-6 border border-white/10 shadow-xl hover:shadow-green-500/20 transition group">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="p-3 bg-green-600/20 rounded-lg group-hover:bg-green-600/30 transition">
                    <FaClipboardList className="text-2xl text-green-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold">Orders & Reports</h2>
                    <p className="text-gray-400 text-sm">Track orders and sales data</p>
                  </div>
                </div>
                <button
                  className="w-full bg-green-600 hover:bg-green-700 px-4 py-3 rounded-xl transition font-semibold"
                  onClick={() => navigate("/admin/orders")}
                >
                  View Orders
                </button>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <h3 className="text-lg font-semibold mb-2 text-yellow-400">Quick Actions</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => setActiveTab("analytics")}
                    className="w-full text-left px-3 py-2 rounded hover:bg-white/10 transition text-gray-300 hover:text-white"
                  >
                    View Analytics
                  </button>
                  <button
                    onClick={() => navigate("/admin/reports")}
                    className="w-full text-left px-3 py-2 rounded hover:bg-white/10 transition text-gray-300 hover:text-white"
                  >
                    Generate Report
                  </button>
                  <button
                    onClick={() => navigate("/admin/products")}
                    className="w-full text-left px-3 py-2 rounded hover:bg-white/10 transition text-gray-300 hover:text-white"
                  >
                    Add New Product
                  </button>
                </div>
              </div>

              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <h3 className="text-lg font-semibold mb-2 text-purple-400">System Status</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Database</span>
                    <span className="text-green-400">●</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Payment Gateway</span>
                    <span className="text-green-400">●</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Email Service</span>
                    <span className="text-green-400">●</span>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <h3 className="text-lg font-semibold mb-2 text-orange-400">Recent Activity</h3>
                <div className="space-y-2 text-sm text-gray-400">
                  <p>• New order received</p>
                  <p>• User registration</p>
                  <p>• Product updated</p>
                  <p>• Payment processed</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "analytics" && <AdminAnalytics />}

        {activeTab === "products" && (
          <div className="text-center py-20">
            <FaBoxOpen className="text-6xl text-gray-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-4">Product Management</h2>
            <p className="text-gray-400 mb-8">This section is currently being enhanced</p>
            <button
              onClick={() => navigate("/admin/products")}
              className="bg-pink-600 hover:bg-pink-700 px-6 py-3 rounded-lg font-semibold transition"
            >
              Go to Products Page
            </button>
          </div>
        )}

        {activeTab === "users" && (
          <div className="text-center py-20">
            <FaUsers className="text-6xl text-gray-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-4">User Management</h2>
            <p className="text-gray-400 mb-8">This section is currently being enhanced</p>
            <button
              onClick={() => navigate("/admin/users")}
              className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-semibold transition"
            >
              Go to Users Page
            </button>
          </div>
        )}

        {activeTab === "orders" && (
          <div className="text-center py-20">
            <FaClipboardList className="text-6xl text-gray-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-4">Order Management</h2>
            <p className="text-gray-400 mb-8">This section is currently being enhanced</p>
            <button
              onClick={() => navigate("/admin/orders")}
              className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg font-semibold transition"
            >
              Go to Orders Page
            </button>
          </div>
        )}

        {activeTab === "settings" && (
          <div className="text-center py-20">
            <FaCog className="text-6xl text-gray-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-4">System Settings</h2>
            <p className="text-gray-400 mb-8">Configure system preferences and settings</p>
            <div className="space-y-4 max-w-md mx-auto">
              <button className="w-full bg-white/10 hover:bg-white/20 px-6 py-3 rounded-lg font-semibold transition">
                Site Configuration
              </button>
              <button className="w-full bg-white/10 hover:bg-white/20 px-6 py-3 rounded-lg font-semibold transition">
                Payment Settings
              </button>
              <button className="w-full bg-white/10 hover:bg-white/20 px-6 py-3 rounded-lg font-semibold transition">
                Email Templates
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
