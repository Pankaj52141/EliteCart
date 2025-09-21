
/**
 * Dashboard.jsx
 * User dashboard for EliteCart. Shows orders, recommendations, profile image upload.
 */
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { auth, db, storage } from "../firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, updateDoc, collection, query, where, getDocs, getDoc } from "firebase/firestore";

export default function Dashboard() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [role, setRole] = useState("user"); // default
  const [recommendations, setRecommendations] = useState([]);
  const [profileImage, setProfileImage] = useState("");
  const [error, setError] = useState("");

    const handleImageChange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setProfileImage(reader.result);
        };
        reader.readAsDataURL(file);
      }
    };

    const handleImageSave = async (e) => {
      e.preventDefault();
      if (!profileImage || !user?.uid) return;
      try {
        // Convert base64 to blob
        const res = await fetch(profileImage);
        const blob = await res.blob();
        const storageRef = ref(storage, `profileImages/${user.uid}`);
        await uploadBytes(storageRef, blob);
        const url = await getDownloadURL(storageRef);
        // Save URL to Firestore user doc
        const userDoc = doc(db, "users", user.uid);
        await updateDoc(userDoc, { photoURL: url });
        setProfileImage(url);
        alert("Profile image updated!");
      } catch (err) {
        alert("Failed to upload image");
      }
    };

  useEffect(() => {
    if (!user?.uid) return; // Only run if user is authenticated
    if (error) return; // Prevent repeated fetches if error exists

    const fetchOrders = async () => {
      try {
        const q = query(collection(db, "orders"), where("userId", "==", user.uid));
        const querySnapshot = await getDocs(q);
        const orderData = querySnapshot.docs.map(doc => doc.data());
        setOrders(orderData);
      } catch (err) {
        console.error("Error fetching orders:", err);
        setError("Failed to fetch orders. Please check your permissions or try again later.");
      }
    };

    const fetchUserRole = async () => {
      try {
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          const data = userDocSnap.data();
          setRole(data?.role || "user");
        } else {
          setRole("user"); // fallback if no document
          setError("User profile not found. Please complete signup.");
        }
      } catch (err) {
        console.error("Error fetching user role:", err);
        setError("Failed to fetch user role. Please check your permissions or try again later.");
      }
    };

    const fetchRecommendations = async () => {
      try {
        // For now static
        setRecommendations([
          { id: 1, name: "Noise Smartwatch", price: 4999 },
          { id: 2, name: "boAt Rockerz Headphones", price: 2499 },
          { id: 3, name: "iPhone 15 Case", price: 699 },
        ]);
      } catch (err) {
        console.error("Error fetching recommendations:", err);
        setError("Failed to fetch recommendations. Please check your permissions or try again later.");
      }
    };

    fetchOrders();
    fetchUserRole();
    fetchRecommendations();
  }, [user, error]);

  const navigate = useNavigate();
  
  const totalSpent = orders.reduce((total, order) => {
    return total + (order.items?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0);
  }, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-pink-500 mb-4 md:mb-0">Dashboard</h1>
          {role === "admin" && (
            <button
              onClick={() => navigate("/admin")}
              className="bg-pink-600 hover:bg-pink-700 px-6 py-2 rounded-lg font-semibold transition"
            >
              Admin Panel
            </button>
          )}
        </div>

        {error && (
          <div className="text-red-500 bg-red-100/20 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Profile Section */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-8">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="relative">
              <img
                src={
                  role === "admin"
                    ? "/photo.jpg"
                    : profileImage || user?.photoURL || "https://ui-avatars.com/api/?name=" + encodeURIComponent(user?.name || user?.displayName || "User") + "&background=random"
                }
                alt={user?.name || user?.displayName || "Profile"}
                className="w-24 h-24 rounded-full border-4 border-pink-400 shadow-xl"
                loading="lazy"
              />
              {role !== "admin" && (
                <button
                  className="absolute bottom-0 right-0 bg-pink-600 hover:bg-pink-700 p-2 rounded-full text-xs"
                  onClick={() => document.getElementById('profile-image-input').click()}
                >
                  📷
                </button>
              )}
            </div>
            <div className="text-center md:text-left">
              <h2 className="text-3xl font-bold text-white mb-2">
                Welcome, {user?.name || user?.displayName || "User"}!
              </h2>
              <p className="text-gray-400 mb-1">Email: {user?.email}</p>
              <p className="text-gray-400 mb-1">Role: <span className="text-pink-400 font-semibold">{role}</span></p>
              <p className="text-gray-400">Member since: {new Date(user?.metadata?.creationTime).toLocaleDateString()}</p>
            </div>
          </div>
          <input
            id="profile-image-input"
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            disabled={role === "admin"}
            onChange={async (e) => {
              if (role === "admin") return;
              const file = e.target.files[0];
              if (file) {
                const reader = new FileReader();
                reader.onloadend = async () => {
                  setProfileImage(reader.result);
                  if (user?.uid) {
                    try {
                      const res = await fetch(reader.result);
                      const blob = await res.blob();
                      const storageRef = ref(storage, `profileImages/${user.uid}`);
                      await uploadBytes(storageRef, blob);
                      const url = await getDownloadURL(storageRef);
                      const userDoc = doc(db, "users", user.uid);
                      await updateDoc(userDoc, { photoURL: url });
                      setProfileImage(url);
                      alert("Profile image updated!");
                    } catch (err) {
                      alert("Failed to upload image");
                    }
                  }
                };
                reader.readAsDataURL(file);
              }
            }}
          />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-r from-pink-600 to-purple-600 p-6 rounded-xl text-center">
            <h3 className="text-2xl font-bold mb-2">{orders.length}</h3>
            <p className="text-pink-100">Total Orders</p>
          </div>
          <div className="bg-gradient-to-r from-green-600 to-blue-600 p-6 rounded-xl text-center">
            <h3 className="text-2xl font-bold mb-2">₹{totalSpent.toLocaleString()}</h3>
            <p className="text-green-100">Total Spent</p>
          </div>
          <div className="bg-gradient-to-r from-yellow-600 to-red-600 p-6 rounded-xl text-center">
            <h3 className="text-2xl font-bold mb-2">{orders.filter(o => o.status === "Pending").length}</h3>
            <p className="text-yellow-100">Pending Orders</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-8">
          <h3 className="text-2xl font-bold text-pink-400 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={() => navigate("/shop")}
              className="bg-pink-600 hover:bg-pink-700 p-4 rounded-lg text-center transition"
            >
              🛍️<br />Shop Now
            </button>
            <button
              onClick={() => navigate("/cart")}
              className="bg-blue-600 hover:bg-blue-700 p-4 rounded-lg text-center transition"
            >
              🛒<br />View Cart
            </button>
            <button
              onClick={() => navigate("/profile")}
              className="bg-green-600 hover:bg-green-700 p-4 rounded-lg text-center transition"
            >
              👤<br />Edit Profile
            </button>
            <button
              onClick={() => auth.signOut()}
              className="bg-red-600 hover:bg-red-700 p-4 rounded-lg text-center transition"
            >
              🚪<br />Logout
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Orders */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <h3 className="text-2xl font-bold text-pink-400 mb-4">Recent Orders</h3>
            {orders.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-400 mb-4">No orders yet</p>
                <button
                  onClick={() => navigate("/shop")}
                  className="bg-pink-600 hover:bg-pink-700 px-6 py-2 rounded-lg transition"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              <div className="space-y-4 max-h-80 overflow-y-auto">
                {orders.slice(0, 5).map((order, index) => (
                  <div key={index} className="bg-white/10 p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold">Order #{index + 1}</span>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        order.status === "Pending" ? "bg-yellow-600" :
                        order.status === "Delivered" ? "bg-green-600" : "bg-blue-600"
                      }`}>
                        {order.status}
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm mb-2">{order.items?.length || 0} items</p>
                    <p className="text-gray-400 text-sm">
                      {order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString() : "Recent"}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recommendations */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <h3 className="text-2xl font-bold text-pink-400 mb-4">Recommended for You</h3>
            <div className="space-y-4">
              {recommendations.map((item) => (
                <div key={item.id} className="bg-white/10 p-4 rounded-lg flex justify-between items-center">
                  <div>
                    <h4 className="font-semibold">{item.name}</h4>
                    <p className="text-pink-400 font-bold">₹{item.price}</p>
                  </div>
                  <button
                    onClick={() => navigate("/shop")}
                    className="bg-pink-600 hover:bg-pink-700 px-4 py-2 rounded-lg text-sm transition"
                  >
                    View
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
