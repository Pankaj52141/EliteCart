import { Routes, Route } from "react-router-dom";
import Home from "@pages/Home";
import Auth from "@pages/Auth";
import Shop from "@pages/Shop";
import Cart from "@pages/Cart";
import Admin from "@pages/Admin";
import Products from "@pages/admin/Products";
import Users from "@pages/admin/Users";
import Orders from "@pages/admin/Orders";
import Reports from "@pages/admin/Reports";
import Dashboard from "@pages/Dashboard";
import Profile from "@pages/Profile";
import OrderDetails from "./pages/OrderDetails";
import Checkout from "@pages/Checkout";

import ProtectedRoute from "@components/ProtectedRoute";
import PublicRoute from "@components/PublicRoute";
import Layout from "@components/Layout";
import React from "react";
import { useAuth } from "./context/AuthContext";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  componentDidCatch(error, errorInfo) {
    // Log error to service if needed
  }
  render() {
    if (this.state.hasError) {
      return <div className="text-center text-red-500 p-10">Something went wrong. Please refresh.</div>;
    }
    return this.props.children;
  }
}

function App() {
  const { loading } = useAuth();
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen text-2xl text-pink-500">Loading...</div>;
  }
  return (
    <ErrorBoundary>
      <Routes>
        {/* Public route - No Navbar */}
        <Route
          path="/auth"
          element={
            <PublicRoute>
              <Auth />
            </PublicRoute>
          }
        />

        {/* All routes after login use Layout (Navbar + Outlet) */}
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/order/:orderId" element={<OrderDetails />} />
    <Route path="/admin" element={<Admin />} />
           <Route path="/checkout" element={<Checkout />} />
  <Route path="/admin/products" element={<Products />} />
    <Route path="/admin/users" element={<Users />} />
    <Route path="/admin/orders" element={<Orders />} />
    <Route path="/admin/reports" element={<Reports />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
        </Route>
      </Routes>
    </ErrorBoundary>
  );
}

export default App;
