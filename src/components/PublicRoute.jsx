import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function PublicRoute({ children }) {
  const { currentUser, loading } = useAuth();

  if (loading) return <div className="text-center mt-10">Loading...</div>;

  return currentUser ? <Navigate to="/dashboard" replace /> : children;
}
