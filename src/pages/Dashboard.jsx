
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
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-600 via-purple-700 to-blue-900 p-0 relative overflow-hidden">
      {/* Glowing gradient background with blur and depth */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-0 w-2/3 h-2/3 bg-pink-400 opacity-30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-purple-500 opacity-30 rounded-full blur-2xl animate-pulse" />
        <div className="absolute top-1/2 left-1/2 w-1/3 h-1/3 bg-blue-500 opacity-20 rounded-full blur-2xl animate-pulse" />
      </div>
      <div className="relative z-10 w-full max-w-xl mx-auto">
        {error && (
          <div className="text-red-500 bg-red-100/20 p-2 rounded mb-4">
            {error}
          </div>
        )}
        {/* Glassy, floating, glowing card */}
        <div className="bg-white/10 border-4 border-pink-400/40 rounded-3xl shadow-2xl p-10 md:p-14 mx-auto text-center space-y-8 flex flex-col items-center backdrop-blur-2xl animate-float">
          <img
            src={
              role === "admin"
                ? "/photo.jpg"
                : profileImage || user?.photoURL || "https://ui-avatars.com/api/?name=" + encodeURIComponent(user?.name || user?.displayName || "User") + "&background=random"
            }
            alt={user?.name || user?.displayName || "Profile"}
            className="w-28 h-28 rounded-full border-4 border-pink-400 shadow-xl neon-glow mx-auto"
            loading="lazy"
          />
          <button
            className="mt-4 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 px-6 py-2 rounded-full text-white font-bold shadow-lg neon-glow transition duration-300"
            onClick={() => document.getElementById('profile-image-input').click()}
            disabled={role === "admin"}
          >
            Change Image
          </button>
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
                  // Upload to Firebase
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
          <h2 className="text-5xl font-extrabold text-white drop-shadow-lg font-sans tracking-tight neon-glow">Welcome, {user?.name || user?.displayName || "User"} 👋</h2>
          <p className="text-pink-200 text-lg font-mono">
            UID: <span className="text-white font-bold">{user?.uid || "N/A"}</span>
          </p>
        </div>
      </div>
      {/* Floating animation keyframes and neon glow utility */}
      <style>{`
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-16px); }
        }
        .neon-glow {
          box-shadow: 0 0 16px 2px #ec4899, 0 0 32px 4px #a78bfa;
        }
      `}</style>
    </div>
  );
}
