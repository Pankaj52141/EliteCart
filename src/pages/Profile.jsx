import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { db, storage } from "../firebase";
import { doc, getDoc, updateDoc, collection, query, where, getDocs } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { updatePassword, updateEmail } from "firebase/auth";

const Profile = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [orders, setOrders] = useState([]);
  
  // Profile Data
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    gender: "",
    photoURL: ""
  });

  // Address Data
  const [addresses, setAddresses] = useState([]);
  const [newAddress, setNewAddress] = useState({
    type: "home",
    street: "",
    city: "",
    state: "",
    pincode: "",
    isDefault: false
  });

  // Settings Data
  const [settings, setSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    orderUpdates: true,
    promotionalEmails: false
  });

  // Password Change
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  useEffect(() => {
    if (user) {
      fetchUserProfile();
      fetchUserOrders();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    try {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        setProfileData({
          name: data.name || "",
          email: data.email || user.email,
          phone: data.phone || "",
          dateOfBirth: data.dateOfBirth || "",
          gender: data.gender || "",
          photoURL: data.photoURL || ""
        });
        setAddresses(data.addresses || []);
        setSettings({
          emailNotifications: data.emailNotifications ?? true,
          smsNotifications: data.smsNotifications ?? false,
          orderUpdates: data.orderUpdates ?? true,
          promotionalEmails: data.promotionalEmails ?? false
        });
      }
    } catch (error) {
      setMessage("Error fetching profile data");
    }
  };

  const fetchUserOrders = async () => {
    try {
      const q = query(collection(db, "orders"), where("userId", "==", user.uid));
      const ordersSnapshot = await getDocs(q);
      const ordersList = ordersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setOrders(ordersList.sort((a, b) => b.createdAt?.toDate() - a.createdAt?.toDate()));
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  const handleProfileUpdate = async () => {
    setLoading(true);
    try {
      await updateDoc(doc(db, "users", user.uid), profileData);
      setMessage("Profile updated successfully!");
    } catch (error) {
      setMessage("Error updating profile");
    }
    setLoading(false);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setLoading(true);
      try {
        const storageRef = ref(storage, `profileImages/${user.uid}`);
        await uploadBytes(storageRef, file);
        const url = await getDownloadURL(storageRef);
        setProfileData(prev => ({ ...prev, photoURL: url }));
        await updateDoc(doc(db, "users", user.uid), { photoURL: url });
        setMessage("Profile picture updated!");
      } catch (error) {
        setMessage("Error uploading image");
      }
      setLoading(false);
    }
  };

  const handleAddAddress = async () => {
    if (!newAddress.street || !newAddress.city || !newAddress.pincode) {
      setMessage("Please fill all address fields");
      return;
    }
    
    setLoading(true);
    try {
      const updatedAddresses = [...addresses, { ...newAddress, id: Date.now() }];
      await updateDoc(doc(db, "users", user.uid), { addresses: updatedAddresses });
      setAddresses(updatedAddresses);
      setNewAddress({ type: "home", street: "", city: "", state: "", pincode: "", isDefault: false });
      setMessage("Address added successfully!");
    } catch (error) {
      setMessage("Error adding address");
    }
    setLoading(false);
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage("Passwords don't match");
      return;
    }
    if (passwordData.newPassword.length < 6) {
      setMessage("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      await updatePassword(user, passwordData.newPassword);
      setMessage("Password updated successfully!");
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error) {
      setMessage("Error updating password: " + error.message);
    }
    setLoading(false);
  };

  const handleSettingsUpdate = async () => {
    setLoading(true);
    try {
      await updateDoc(doc(db, "users", user.uid), settings);
      setMessage("Settings updated successfully!");
    } catch (error) {
      setMessage("Error updating settings");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-pink-500 mb-8">My Account</h1>
        
        {message && (
          <div className={`p-4 mb-6 rounded-lg ${message.includes('Error') ? 'bg-red-600/20 text-red-400' : 'bg-green-600/20 text-green-400'}`}>
            {message}
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 mb-8 bg-white/5 p-2 rounded-xl">
          {[
            { id: "profile", label: "👤 Profile", icon: "👤" },
            { id: "orders", label: "📦 Orders", icon: "📦" },
            { id: "addresses", label: "📍 Addresses", icon: "📍" },
            { id: "settings", label: "⚙️ Settings", icon: "⚙️" },
            { id: "security", label: "🔒 Security", icon: "🔒" }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg transition font-semibold ${
                activeTab === tab.id 
                  ? "bg-pink-600 text-white" 
                  : "bg-white/10 hover:bg-white/20"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Profile Tab */}
        {activeTab === "profile" && (
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <h2 className="text-2xl font-bold mb-6 text-pink-400">Profile Information</h2>
            
            {/* Profile Picture */}
            <div className="flex items-center gap-6 mb-6">
              <div className="relative">
                <img
                  src={profileData.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(profileData.name || user.email)}&background=random`}
                  alt="Profile"
                  className="w-24 h-24 rounded-full border-4 border-pink-400"
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <div className="absolute bottom-0 right-0 bg-pink-600 p-2 rounded-full cursor-pointer">
                  📷
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold">{profileData.name || "Add your name"}</h3>
                <p className="text-gray-400">{profileData.email}</p>
              </div>
            </div>

            {/* Profile Form */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">Full Name</label>
                <input
                  type="text"
                  value={profileData.name}
                  onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:border-pink-500 focus:outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Phone Number</label>
                <input
                  type="tel"
                  value={profileData.phone}
                  onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:border-pink-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Date of Birth</label>
                <input
                  type="date"
                  value={profileData.dateOfBirth}
                  onChange={(e) => setProfileData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:border-pink-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Gender</label>
                <select
                  value={profileData.gender}
                  onChange={(e) => setProfileData(prev => ({ ...prev, gender: e.target.value }))}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:border-pink-500 focus:outline-none"
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleProfileUpdate}
              disabled={loading}
              className="mt-6 bg-pink-600 hover:bg-pink-700 px-6 py-2 rounded-lg font-semibold transition disabled:opacity-50"
            >
              {loading ? "Updating..." : "Update Profile"}
            </button>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === "orders" && (
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <h2 className="text-2xl font-bold mb-6 text-pink-400">Order History</h2>
            
            {orders.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-400 mb-4">No orders found</p>
                <button
                  onClick={() => window.location.href = "/shop"}
                  className="bg-pink-600 hover:bg-pink-700 px-6 py-2 rounded-lg"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map(order => (
                  <div key={order.id} className="bg-white/10 p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-semibold">Order #{order.id.slice(-8)}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs ${
                        order.status === "Delivered" ? "bg-green-600" :
                        order.status === "Pending" ? "bg-yellow-600" : "bg-blue-600"
                      }`}>
                        {order.status}
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm">
                      {order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString() : "Recent"}
                    </p>
                    <p className="text-gray-400 text-sm">
                      Items: {order.items?.length || 0} | Total: ₹{order.items?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0}
                    </p>
                    <button 
                      onClick={() => window.location.href = `/order/${order.id}`}
                      className="mt-2 text-pink-400 hover:text-pink-300 text-sm"
                    >
                      View Details →
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Addresses Tab */}
        {activeTab === "addresses" && (
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <h2 className="text-2xl font-bold mb-6 text-pink-400">Saved Addresses</h2>
            
            {/* Add New Address */}
            <div className="mb-6 p-4 bg-white/10 rounded-lg">
              <h3 className="font-semibold mb-4">Add New Address</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <select
                  value={newAddress.type}
                  onChange={(e) => setNewAddress(prev => ({ ...prev, type: e.target.value }))}
                  className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:border-pink-500 focus:outline-none"
                >
                  <option value="home">Home</option>
                  <option value="work">Work</option>
                  <option value="other">Other</option>
                </select>
                
                <input
                  type="text"
                  placeholder="Street Address"
                  value={newAddress.street}
                  onChange={(e) => setNewAddress(prev => ({ ...prev, street: e.target.value }))}
                  className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:border-pink-500 focus:outline-none"
                />
                
                <input
                  type="text"
                  placeholder="City"
                  value={newAddress.city}
                  onChange={(e) => setNewAddress(prev => ({ ...prev, city: e.target.value }))}
                  className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:border-pink-500 focus:outline-none"
                />
                
                <input
                  type="text"
                  placeholder="State"
                  value={newAddress.state}
                  onChange={(e) => setNewAddress(prev => ({ ...prev, state: e.target.value }))}
                  className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:border-pink-500 focus:outline-none"
                />
                
                <input
                  type="text"
                  placeholder="Pincode"
                  value={newAddress.pincode}
                  onChange={(e) => setNewAddress(prev => ({ ...prev, pincode: e.target.value }))}
                  className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:border-pink-500 focus:outline-none"
                />
              </div>
              
              <button
                onClick={handleAddAddress}
                disabled={loading}
                className="mt-4 bg-pink-600 hover:bg-pink-700 px-4 py-2 rounded-lg font-semibold transition disabled:opacity-50"
              >
                {loading ? "Adding..." : "Add Address"}
              </button>
            </div>

            {/* Saved Addresses List */}
            <div className="space-y-4">
              {addresses.map((address, index) => (
                <div key={index} className="p-4 bg-white/10 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold capitalize">{address.type}</h4>
                      <p className="text-gray-400">{address.street}</p>
                      <p className="text-gray-400">{address.city}, {address.state} - {address.pincode}</p>
                    </div>
                    {address.isDefault && (
                      <span className="bg-green-600 px-2 py-1 rounded text-xs">Default</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === "settings" && (
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <h2 className="text-2xl font-bold mb-6 text-pink-400">Notification Settings</h2>
            
            <div className="space-y-4">
              {[
                { key: "emailNotifications", label: "Email Notifications", desc: "Receive general updates via email" },
                { key: "smsNotifications", label: "SMS Notifications", desc: "Receive SMS for important updates" },
                { key: "orderUpdates", label: "Order Updates", desc: "Get notified about order status changes" },
                { key: "promotionalEmails", label: "Promotional Emails", desc: "Receive offers and promotional content" }
              ].map(setting => (
                <div key={setting.key} className="flex items-center justify-between p-4 bg-white/10 rounded-lg">
                  <div>
                    <h4 className="font-semibold">{setting.label}</h4>
                    <p className="text-gray-400 text-sm">{setting.desc}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings[setting.key]}
                      onChange={(e) => setSettings(prev => ({ ...prev, [setting.key]: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 dark:peer-focus:ring-pink-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-pink-600"></div>
                  </label>
                </div>
              ))}
            </div>
            
            <button
              onClick={handleSettingsUpdate}
              disabled={loading}
              className="mt-6 bg-pink-600 hover:bg-pink-700 px-6 py-2 rounded-lg font-semibold transition disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Settings"}
            </button>
          </div>
        )}

        {/* Security Tab */}
        {activeTab === "security" && (
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <h2 className="text-2xl font-bold mb-6 text-pink-400">Security Settings</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Change Password</h3>
                <div className="space-y-4">
                  <input
                    type="password"
                    placeholder="Current Password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:border-pink-500 focus:outline-none"
                  />
                  <input
                    type="password"
                    placeholder="New Password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:border-pink-500 focus:outline-none"
                  />
                  <input
                    type="password"
                    placeholder="Confirm New Password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:border-pink-500 focus:outline-none"
                  />
                  <button
                    onClick={handlePasswordChange}
                    disabled={loading}
                    className="bg-pink-600 hover:bg-pink-700 px-6 py-2 rounded-lg font-semibold transition disabled:opacity-50"
                  >
                    {loading ? "Updating..." : "Update Password"}
                  </button>
                </div>
              </div>
              
              <div className="pt-6 border-t border-white/20">
                <h3 className="text-lg font-semibold mb-4">Account Security</h3>
                <div className="space-y-3 text-gray-400">
                  <p>✅ Email verified</p>
                  <p>⏰ Last login: {new Date().toLocaleDateString()}</p>
                  <p>🔒 Two-factor authentication: Not enabled</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
