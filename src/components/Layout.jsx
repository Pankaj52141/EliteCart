// src/components/Layout.jsx
import Navbar from "./Navbar";
import { useAuth } from "../context/AuthContext";
import { Outlet, useLocation } from "react-router-dom";

export default function Layout() {
  const { user } = useAuth();
  const location = useLocation();

  // Show navbar for all users except on /auth
  const shouldShowNavbar = location.pathname !== "/auth";

  return (
    <div className="min-h-screen">
      {shouldShowNavbar && <Navbar />}
      <Outlet />
    </div>
  );
}
