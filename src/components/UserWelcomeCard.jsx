import { signOut } from "firebase/auth";
import { auth } from "../firebase";

export default function UserWelcomeCard({ user }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl shadow-lg p-6 md:p-10 backdrop-blur-lg max-w-4xl mx-auto text-center space-y-3">
      <img
        src={user?.photoURL && user.photoURL.startsWith("http") ? user.photoURL : "https://via.placeholder.com/100x100?text=No+Image"}
        alt={user?.displayName || "Profile"}
        className="w-20 h-20 rounded-full border border-white/20 mx-auto"
        loading="lazy"
      />
      <h2 className="text-3xl font-bold">Welcome, {user?.displayName || "User"} 👋</h2>
      <p className="text-gray-300 text-sm">
        UID: <span className="text-white">{user?.uid || "N/A"}</span>
      </p>
      <button
        onClick={() => {
          if (window.confirm("Are you sure you want to logout?")) signOut(auth);
        }}
        className="bg-red-600 hover:bg-red-700 mt-4 px-6 py-2 rounded-lg transition shadow-md"
      >
        Logout
      </button>
    </div>
  );
}
