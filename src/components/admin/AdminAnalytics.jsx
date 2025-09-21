import React, { useState, useEffect } from "react";
import { db } from "../../firebase";
import { collection, getDocs, query, where, orderBy, limit } from "firebase/firestore";
import { 
  FaUsers, 
  FaShoppingCart, 
  FaDollarSign, 
  FaBox, 
  FaArrowUp, 
  FaArrowDown,
  FaCalendarAlt,
  FaDownload,
  FaFilter
} from "react-icons/fa";
import { ChartSkeleton, DashboardCardSkeleton } from "../ui/LoadingSkeleton";

const AdminAnalytics = () => {
  const [analytics, setAnalytics] = useState({
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    recentOrders: [],
    topProducts: [],
    userGrowth: [],
    salesData: []
  });
  
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("7d"); // 7d, 30d, 90d, 1y
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError("");
    
    try {
      // Fetch all collections data
      const [usersSnap, ordersSnap, productsSnap] = await Promise.all([
        getDocs(collection(db, "users")),
        getDocs(collection(db, "orders")),
        getDocs(collection(db, "products"))
      ]);

      const users = usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const orders = ordersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const products = productsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Calculate metrics
      const totalRevenue = orders.reduce((sum, order) => {
        const orderTotal = order.total || 
          (order.items?.reduce((itemSum, item) => itemSum + (item.price * item.quantity), 0) || 0);
        return sum + orderTotal;
      }, 0);

      // Get recent orders
      const recentOrders = orders
        .sort((a, b) => (b.createdAt?.toDate?.() || new Date(0)) - (a.createdAt?.toDate?.() || new Date(0)))
        .slice(0, 10);

      // Calculate top products by sales
      const productSales = {};
      orders.forEach(order => {
        order.items?.forEach(item => {
          if (productSales[item.id]) {
            productSales[item.id].quantity += item.quantity;
            productSales[item.id].revenue += item.price * item.quantity;
          } else {
            productSales[item.id] = {
              ...item,
              quantity: item.quantity,
              revenue: item.price * item.quantity
            };
          }
        });
      });

      const topProducts = Object.values(productSales)
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

      // Generate mock time series data for charts
      const salesData = generateTimeSeriesData(timeRange, orders);
      const userGrowth = generateUserGrowthData(timeRange, users);

      setAnalytics({
        totalUsers: users.length,
        totalOrders: orders.length,
        totalRevenue,
        totalProducts: products.length,
        recentOrders,
        topProducts,
        userGrowth,
        salesData
      });

    } catch (error) {
      console.error("Error fetching analytics:", error);
      setError("Failed to load analytics data");
    }
    
    setLoading(false);
  };

  const generateTimeSeriesData = (range, orders) => {
    const days = range === "7d" ? 7 : range === "30d" ? 30 : range === "90d" ? 90 : 365;
    const data = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      const dayOrders = orders.filter(order => {
        const orderDate = order.createdAt?.toDate?.() || new Date();
        return orderDate.toDateString() === date.toDateString();
      });
      
      const revenue = dayOrders.reduce((sum, order) => {
        return sum + (order.total || order.items?.reduce((itemSum, item) => itemSum + (item.price * item.quantity), 0) || 0);
      }, 0);
      
      data.push({
        date: date.toLocaleDateString(),
        orders: dayOrders.length,
        revenue: revenue
      });
    }
    
    return data;
  };

  const generateUserGrowthData = (range, users) => {
    const days = range === "7d" ? 7 : range === "30d" ? 30 : range === "90d" ? 90 : 365;
    const data = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      const dayUsers = users.filter(user => {
        const userDate = user.createdAt?.toDate?.() || new Date();
        return userDate.toDateString() === date.toDateString();
      });
      
      data.push({
        date: date.toLocaleDateString(),
        newUsers: dayUsers.length,
        totalUsers: users.filter(user => {
          const userDate = user.createdAt?.toDate?.() || new Date();
          return userDate <= date;
        }).length
      });
    }
    
    return data;
  };

  const downloadReport = () => {
    const reportData = {
      generatedAt: new Date().toISOString(),
      timeRange,
      summary: {
        totalUsers: analytics.totalUsers,
        totalOrders: analytics.totalOrders,
        totalRevenue: analytics.totalRevenue,
        totalProducts: analytics.totalProducts
      },
      recentOrders: analytics.recentOrders,
      topProducts: analytics.topProducts,
      salesData: analytics.salesData
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(reportData, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `analytics-report-${timeRange}-${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const StatCard = ({ title, value, icon: Icon, trend, trendValue, color = "pink" }) => (
    <div className="bg-white/5 border border-white/10 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-gray-400 text-sm">{title}</p>
          <p className="text-2xl font-bold text-white">{value}</p>
        </div>
        <div className={`p-3 rounded-lg bg-${color}-600/20`}>
          <Icon className={`text-2xl text-${color}-400`} />
        </div>
      </div>
      
      {trend && (
        <div className="flex items-center gap-2">
          {trend === "up" ? (
            <FaArrowUp className="text-green-400" />
          ) : (
            <FaArrowDown className="text-red-400" />
          )}
          <span className={`text-sm ${trend === "up" ? "text-green-400" : "text-red-400"}`}>
            {trendValue}% from last period
          </span>
        </div>
      )}
    </div>
  );

  if (error) {
    return (
      <div className="bg-red-600/20 border border-red-600/30 rounded-lg p-6 text-center">
        <p className="text-red-400">{error}</p>
        <button 
          onClick={fetchAnalytics}
          className="mt-4 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-pink-400">Analytics Dashboard</h1>
          <p className="text-gray-400">Comprehensive business insights and metrics</p>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Time Range Filter */}
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:border-pink-500 focus:outline-none"
          >
            <option value="7d" className="bg-gray-800">Last 7 days</option>
            <option value="30d" className="bg-gray-800">Last 30 days</option>
            <option value="90d" className="bg-gray-800">Last 90 days</option>
            <option value="1y" className="bg-gray-800">Last year</option>
          </select>
          
          {/* Download Report */}
          <button
            onClick={downloadReport}
            disabled={loading}
            className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-lg font-semibold transition flex items-center gap-2 disabled:opacity-50"
          >
            <FaDownload />
            Export Report
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading ? (
          [...Array(4)].map((_, i) => <DashboardCardSkeleton key={i} />)
        ) : (
          <>
            <StatCard
              title="Total Users"
              value={analytics.totalUsers.toLocaleString()}
              icon={FaUsers}
              trend="up"
              trendValue="12"
              color="blue"
            />
            <StatCard
              title="Total Orders"
              value={analytics.totalOrders.toLocaleString()}
              icon={FaShoppingCart}
              trend="up"
              trendValue="8"
              color="green"
            />
            <StatCard
              title="Total Revenue"
              value={`₹${analytics.totalRevenue.toLocaleString()}`}
              icon={FaDollarSign}
              trend="up"
              trendValue="15"
              color="yellow"
            />
            <StatCard
              title="Total Products"
              value={analytics.totalProducts.toLocaleString()}
              icon={FaBox}
              trend="up"
              trendValue="5"
              color="purple"
            />
          </>
        )}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Sales Chart */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-pink-400">Sales Overview</h3>
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <FaCalendarAlt />
              <span>{timeRange}</span>
            </div>
          </div>
          
          {loading ? (
            <ChartSkeleton height="250px" />
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="bg-white/10 rounded-lg p-4">
                  <p className="text-2xl font-bold text-green-400">
                    ₹{analytics.salesData.reduce((sum, day) => sum + day.revenue, 0).toLocaleString()}
                  </p>
                  <p className="text-gray-400 text-sm">Total Revenue</p>
                </div>
                <div className="bg-white/10 rounded-lg p-4">
                  <p className="text-2xl font-bold text-blue-400">
                    {analytics.salesData.reduce((sum, day) => sum + day.orders, 0)}
                  </p>
                  <p className="text-gray-400 text-sm">Total Orders</p>
                </div>
              </div>
              
              {/* Simple text-based chart representation */}
              <div className="max-h-64 overflow-y-auto">
                {analytics.salesData.slice(-7).map((day, index) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b border-white/10 last:border-0">
                    <span className="text-gray-400 text-sm">{day.date}</span>
                    <div className="flex items-center gap-4">
                      <span className="text-blue-400">{day.orders} orders</span>
                      <span className="text-green-400">₹{day.revenue}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Growth Chart */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-pink-400">User Growth</h3>
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <FaUsers />
              <span>New Users</span>
            </div>
          </div>
          
          {loading ? (
            <ChartSkeleton height="250px" />
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="bg-white/10 rounded-lg p-4">
                  <p className="text-2xl font-bold text-blue-400">
                    {analytics.userGrowth.reduce((sum, day) => sum + day.newUsers, 0)}
                  </p>
                  <p className="text-gray-400 text-sm">New Users</p>
                </div>
                <div className="bg-white/10 rounded-lg p-4">
                  <p className="text-2xl font-bold text-pink-400">
                    {analytics.totalUsers}
                  </p>
                  <p className="text-gray-400 text-sm">Total Users</p>
                </div>
              </div>
              
              <div className="max-h-64 overflow-y-auto">
                {analytics.userGrowth.slice(-7).map((day, index) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b border-white/10 last:border-0">
                    <span className="text-gray-400 text-sm">{day.date}</span>
                    <div className="flex items-center gap-4">
                      <span className="text-blue-400">+{day.newUsers} new</span>
                      <span className="text-gray-300">{day.totalUsers} total</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Orders */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <h3 className="text-xl font-semibold text-pink-400 mb-6">Recent Orders</h3>
          
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-600 h-4 rounded mb-2"></div>
                  <div className="bg-gray-600 h-3 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4 max-h-80 overflow-y-auto">
              {analytics.recentOrders.map((order) => (
                <div key={order.id} className="bg-white/10 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold">#{order.id.slice(-8)}</span>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      order.status === "Delivered" ? "bg-green-600" :
                      order.status === "Pending" ? "bg-yellow-600" : "bg-blue-600"
                    }`}>
                      {order.status}
                    </span>
                  </div>
                  <div className="text-sm text-gray-400">
                    <p>Items: {order.items?.length || 0}</p>
                    <p>Total: ₹{order.total || order.items?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Products */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <h3 className="text-xl font-semibold text-pink-400 mb-6">Top Products</h3>
          
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-600 h-4 rounded mb-2"></div>
                  <div className="bg-gray-600 h-3 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4 max-h-80 overflow-y-auto">
              {analytics.topProducts.map((product, index) => (
                <div key={product.id || index} className="bg-white/10 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={product.imageUrl || "https://via.placeholder.com/50x50?text=Product"}
                      alt={product.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h4 className="font-semibold">{product.name}</h4>
                      <div className="text-sm text-gray-400">
                        <p>Sold: {product.quantity} units</p>
                        <p>Revenue: ₹{product.revenue}</p>
                      </div>
                    </div>
                    <div className="text-pink-400 font-bold">
                      #{index + 1}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;