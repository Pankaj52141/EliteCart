import React, { useState, useEffect } from "react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase";
import { collection, addDoc, Timestamp, doc, getDoc } from "firebase/firestore";
import { FaCreditCard, FaMoneyBillWave, FaGoogle, FaShieldAlt, FaLock, FaTruck, FaGift, FaPercent } from "react-icons/fa";

export default function Checkout() {
  const { items, clearCart } = useCart();
  const { user } = useAuth();
  
  // Order States
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  
  // User Information
  const [userInfo, setUserInfo] = useState({
    email: "",
    phone: "",
    name: ""
  });
  
  // Shipping Information
  const [shippingInfo, setShippingInfo] = useState({
    address: "",
    city: "",
    state: "",
    pincode: "",
    isNewAddress: true
  });
  
  // Saved Addresses
  const [savedAddresses, setSavedAddresses] = useState([]);
  
  // Payment Information
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [cardInfo, setCardInfo] = useState({
    number: "",
    expiry: "",
    cvv: "",
    name: ""
  });
  
  // Delivery Options
  const [deliveryOption, setDeliveryOption] = useState("standard");
  
  // Discount & Coupon
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  
  // Guest Checkout
  const [isGuestCheckout, setIsGuestCheckout] = useState(!user);

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    try {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        setUserInfo({
          email: data.email || user.email,
          phone: data.phone || "",
          name: data.name || ""
        });
        setSavedAddresses(data.addresses || []);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const deliveryOptions = [
    {
      id: "standard",
      name: "Standard Delivery",
      description: "5-7 business days",
      price: 0,
      icon: FaTruck
    },
    {
      id: "express",
      name: "Express Delivery",
      description: "2-3 business days",
      price: 99,
      icon: FaTruck
    },
    {
      id: "overnight",
      name: "Overnight Delivery",
      description: "Next business day",
      price: 199,
      icon: FaTruck
    }
  ];

  const paymentMethods = [
    {
      id: "cod",
      name: "Cash on Delivery",
      description: "Pay when you receive your order",
      icon: FaMoneyBillWave,
      fee: 0
    },
    {
      id: "card",
      name: "Credit/Debit Card",
      description: "Secure payment with your card",
      icon: FaCreditCard,
      fee: 0
    },
    {
      id: "upi",
      name: "UPI Payment",
      description: "Pay using UPI apps",
      icon: FaGoogle,
      fee: 0
    }
  ];

  const calculateSubtotal = () => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const calculateDeliveryFee = () => {
    const option = deliveryOptions.find(opt => opt.id === deliveryOption);
    return option ? option.price : 0;
  };

  const calculateDiscount = () => {
    if (appliedCoupon) {
      const subtotal = calculateSubtotal();
      return appliedCoupon.type === "percentage" 
        ? (subtotal * appliedCoupon.value) / 100
        : appliedCoupon.value;
    }
    return 0;
  };

  const calculateTax = () => {
    const subtotal = calculateSubtotal();
    return (subtotal * 0.18); // 18% GST
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const delivery = calculateDeliveryFee();
    const discount = calculateDiscount();
    const tax = calculateTax();
    return subtotal + delivery + tax - discount;
  };

  const applyCoupon = () => {
    // Mock coupon validation
    const mockCoupons = {
      "SAVE10": { type: "percentage", value: 10, minOrder: 500 },
      "FLAT50": { type: "fixed", value: 50, minOrder: 200 },
      "WELCOME20": { type: "percentage", value: 20, minOrder: 1000 }
    };

    const coupon = mockCoupons[couponCode.toUpperCase()];
    if (coupon && calculateSubtotal() >= coupon.minOrder) {
      setAppliedCoupon({ ...coupon, code: couponCode.toUpperCase() });
      setError("");
    } else if (coupon) {
      setError(`Minimum order value ₹${coupon.minOrder} required for this coupon`);
    } else {
      setError("Invalid coupon code");
    }
  };

  const selectSavedAddress = (address) => {
    setShippingInfo({
      address: address.street,
      city: address.city,
      state: address.state,
      pincode: address.pincode,
      isNewAddress: false
    });
  };

  const validateForm = () => {
    if (isGuestCheckout) {
      if (!userInfo.email || !userInfo.phone || !userInfo.name) {
        setError("Please fill in all contact information");
        return false;
      }
    }

    if (!shippingInfo.address || !shippingInfo.city || !shippingInfo.state || !shippingInfo.pincode) {
      setError("Please fill in all shipping information");
      return false;
    }

    if (!/^[1-9][0-9]{5}$/.test(shippingInfo.pincode)) {
      setError("Please enter a valid 6-digit pincode");
      return false;
    }

    if (paymentMethod === "card") {
      if (!cardInfo.number || !cardInfo.expiry || !cardInfo.cvv || !cardInfo.name) {
        setError("Please fill in all card information");
        return false;
      }
    }

    return true;
  };

  const handlePlaceOrder = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setError("");

    try {
      const orderData = {
        userId: user?.uid || "guest",
        userInfo: isGuestCheckout ? userInfo : null,
        items,
        shippingInfo,
        paymentMethod,
        deliveryOption,
        subtotal: calculateSubtotal(),
        deliveryFee: calculateDeliveryFee(),
        tax: calculateTax(),
        discount: calculateDiscount(),
        total: calculateTotal(),
        appliedCoupon: appliedCoupon?.code || null,
        status: "Pending",
        createdAt: Timestamp.now(),
        // Legacy fields for compatibility
        address: `${shippingInfo.address}, ${shippingInfo.city}, ${shippingInfo.state}`,
        pincode: shippingInfo.pincode
      };

      await addDoc(collection(db, "orders"), orderData);
      setSuccess(true);
      clearCart();
    } catch (e) {
      setError("Failed to place order. Please try again. " + (e.message || ""));
    }
    setLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white flex items-center justify-center p-6">
        <div className="bg-green-700/20 border border-green-600/30 p-8 rounded-xl text-center max-w-md">
          <div className="text-6xl mb-4">🎉</div>
          <h3 className="text-3xl font-bold mb-4 text-green-400">Order Placed Successfully!</h3>
          <p className="text-lg mb-6">Thank you for your order. You will receive a confirmation email shortly.</p>
          <div className="space-y-3">
            <button
              onClick={() => window.location.href = "/profile"}
              className="w-full bg-pink-600 hover:bg-pink-700 px-6 py-3 rounded-lg font-semibold transition"
            >
              View Order History
            </button>
            <button
              onClick={() => window.location.href = "/shop"}
              className="w-full bg-white/10 hover:bg-white/20 px-6 py-3 rounded-lg font-semibold transition"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white flex items-center justify-center p-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">Your Cart is Empty</h2>
          <p className="text-gray-400 mb-6">Add some items to your cart before checkout</p>
          <button
            onClick={() => window.location.href = "/shop"}
            className="bg-pink-600 hover:bg-pink-700 px-6 py-3 rounded-lg font-semibold transition"
          >
            Go to Shop
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-pink-500 mb-8">Checkout</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Forms */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Guest Checkout Toggle */}
            {!user && (
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold">Guest Checkout</h3>
                  <button
                    onClick={() => window.location.href = "/auth"}
                    className="text-pink-400 hover:text-pink-300 underline"
                  >
                    Sign In Instead
                  </button>
                </div>
              </div>
            )}

            {/* Contact Information */}
            {(isGuestCheckout || !user) && (
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <h3 className="text-xl font-semibold mb-4">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={userInfo.name}
                    onChange={(e) => setUserInfo(prev => ({ ...prev, name: e.target.value }))}
                    className="px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:border-pink-500 focus:outline-none"
                  />
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={userInfo.email}
                    onChange={(e) => setUserInfo(prev => ({ ...prev, email: e.target.value }))}
                    className="px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:border-pink-500 focus:outline-none"
                  />
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    value={userInfo.phone}
                    onChange={(e) => setUserInfo(prev => ({ ...prev, phone: e.target.value }))}
                    className="px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:border-pink-500 focus:outline-none md:col-span-2"
                  />
                </div>
              </div>
            )}

            {/* Shipping Address */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h3 className="text-xl font-semibold mb-4">Shipping Address</h3>
              
              {/* Saved Addresses */}
              {savedAddresses.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-semibold mb-3">Saved Addresses</h4>
                  <div className="space-y-2">
                    {savedAddresses.map((address, index) => (
                      <button
                        key={index}
                        onClick={() => selectSavedAddress(address)}
                        className="w-full text-left p-3 bg-white/10 hover:bg-white/20 rounded-lg transition"
                      >
                        <div className="font-semibold capitalize">{address.type}</div>
                        <div className="text-gray-400 text-sm">{address.street}, {address.city}, {address.state} - {address.pincode}</div>
                      </button>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t border-white/20">
                    <h4 className="font-semibold mb-3">Or enter new address:</h4>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <textarea
                  placeholder="Street Address"
                  value={shippingInfo.address}
                  onChange={(e) => setShippingInfo(prev => ({ ...prev, address: e.target.value }))}
                  className="md:col-span-2 px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:border-pink-500 focus:outline-none resize-none"
                  rows={2}
                />
                <input
                  type="text"
                  placeholder="City"
                  value={shippingInfo.city}
                  onChange={(e) => setShippingInfo(prev => ({ ...prev, city: e.target.value }))}
                  className="px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:border-pink-500 focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="State"
                  value={shippingInfo.state}
                  onChange={(e) => setShippingInfo(prev => ({ ...prev, state: e.target.value }))}
                  className="px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:border-pink-500 focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="Pincode"
                  value={shippingInfo.pincode}
                  onChange={(e) => setShippingInfo(prev => ({ ...prev, pincode: e.target.value }))}
                  className="px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:border-pink-500 focus:outline-none"
                  maxLength={6}
                />
              </div>
            </div>

            {/* Delivery Options */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h3 className="text-xl font-semibold mb-4">Delivery Options</h3>
              <div className="space-y-3">
                {deliveryOptions.map(option => {
                  const Icon = option.icon;
                  return (
                    <label key={option.id} className="flex items-center p-4 bg-white/10 rounded-lg cursor-pointer hover:bg-white/20 transition">
                      <input
                        type="radio"
                        name="delivery"
                        value={option.id}
                        checked={deliveryOption === option.id}
                        onChange={(e) => setDeliveryOption(e.target.value)}
                        className="mr-4"
                      />
                      <Icon className="text-pink-400 mr-3" />
                      <div className="flex-1">
                        <div className="font-semibold">{option.name}</div>
                        <div className="text-gray-400 text-sm">{option.description}</div>
                      </div>
                      <div className="font-semibold">
                        {option.price === 0 ? "Free" : `₹${option.price}`}
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h3 className="text-xl font-semibold mb-4">Payment Method</h3>
              <div className="space-y-3 mb-6">
                {paymentMethods.map(method => {
                  const Icon = method.icon;
                  return (
                    <label key={method.id} className="flex items-center p-4 bg-white/10 rounded-lg cursor-pointer hover:bg-white/20 transition">
                      <input
                        type="radio"
                        name="payment"
                        value={method.id}
                        checked={paymentMethod === method.id}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="mr-4"
                      />
                      <Icon className="text-pink-400 mr-3" />
                      <div className="flex-1">
                        <div className="font-semibold">{method.name}</div>
                        <div className="text-gray-400 text-sm">{method.description}</div>
                      </div>
                      <FaShieldAlt className="text-green-400" />
                    </label>
                  );
                })}
              </div>

              {/* Card Details Form */}
              {paymentMethod === "card" && (
                <div className="space-y-4 p-4 bg-white/10 rounded-lg">
                  <div className="flex items-center gap-2 mb-4">
                    <FaLock className="text-green-400" />
                    <span className="text-sm text-gray-400">Your card information is secure and encrypted</span>
                  </div>
                  <input
                    type="text"
                    placeholder="Card Number"
                    value={cardInfo.number}
                    onChange={(e) => setCardInfo(prev => ({ ...prev, number: e.target.value }))}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:border-pink-500 focus:outline-none"
                    maxLength={19}
                  />
                  <input
                    type="text"
                    placeholder="Cardholder Name"
                    value={cardInfo.name}
                    onChange={(e) => setCardInfo(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:border-pink-500 focus:outline-none"
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="MM/YY"
                      value={cardInfo.expiry}
                      onChange={(e) => setCardInfo(prev => ({ ...prev, expiry: e.target.value }))}
                      className="px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:border-pink-500 focus:outline-none"
                      maxLength={5}
                    />
                    <input
                      type="text"
                      placeholder="CVV"
                      value={cardInfo.cvv}
                      onChange={(e) => setCardInfo(prev => ({ ...prev, cvv: e.target.value }))}
                      className="px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:border-pink-500 focus:outline-none"
                      maxLength={3}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="space-y-6">
            {/* Order Summary */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-6 sticky top-6">
              <h3 className="text-xl font-semibold mb-4">Order Summary</h3>
              
              {/* Items */}
              <div className="space-y-3 mb-6 max-h-60 overflow-y-auto">
                {items.map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <img
                      src={item.imageUrl || "/placeholder-product.jpg"}
                      alt={item.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-sm">{item.name}</div>
                      <div className="text-gray-400 text-xs">Qty: {item.quantity}</div>
                    </div>
                    <div className="font-semibold">₹{item.price * item.quantity}</div>
                  </div>
                ))}
              </div>

              {/* Coupon */}
              <div className="border-t border-white/20 pt-4 mb-4">
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="Enter coupon code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded focus:border-pink-500 focus:outline-none text-sm"
                  />
                  <button
                    onClick={applyCoupon}
                    className="bg-pink-600 hover:bg-pink-700 px-4 py-2 rounded font-semibold text-sm transition"
                  >
                    Apply
                  </button>
                </div>
                {appliedCoupon && (
                  <div className="flex items-center gap-2 text-green-400 text-sm">
                    <FaGift />
                    <span>Coupon "{appliedCoupon.code}" applied!</span>
                  </div>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-2 text-sm border-t border-white/20 pt-4">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{calculateSubtotal()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery</span>
                  <span>{calculateDeliveryFee() === 0 ? "Free" : `₹${calculateDeliveryFee()}`}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax (GST 18%)</span>
                  <span>₹{calculateTax().toFixed(2)}</span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-green-400">
                    <span>Discount</span>
                    <span>-₹{calculateDiscount().toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg border-t border-white/20 pt-2">
                  <span>Total</span>
                  <span className="text-pink-400">₹{calculateTotal().toFixed(2)}</span>
                </div>
              </div>

              {/* Place Order Button */}
              {error && <p className="text-red-400 text-sm mt-4">{error}</p>}
              <button
                onClick={handlePlaceOrder}
                disabled={loading}
                className="w-full mt-6 bg-pink-600 hover:bg-pink-700 text-white py-4 rounded-lg font-semibold transition disabled:opacity-50 text-lg"
              >
                {loading ? "Placing Order..." : `Place Order - ₹${calculateTotal().toFixed(2)}`}
              </button>

              {/* Security Badge */}
              <div className="mt-4 flex items-center justify-center gap-2 text-gray-400 text-xs">
                <FaShieldAlt className="text-green-400" />
                <span>Secure & encrypted checkout</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
