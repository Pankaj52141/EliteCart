// src/pages/Profile.jsx
import React from "react";
import { useAuth } from "../context/AuthContext";

const Profile = () => {
  const { currentUser, logout } = useAuth();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 px-4">
      <div className="bg-white shadow-lg rounded-lg p-6 max-w-md w-full text-center">
        <h2 className="text-2xl font-bold mb-4">Profile</h2>
        <p className="text-gray-700 mb-2"><strong>Email:</strong> {currentUser?.email}</p>
        <button
          onClick={logout}
          className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Profile;
