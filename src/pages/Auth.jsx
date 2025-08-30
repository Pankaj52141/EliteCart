
/**
 * Auth.jsx
 * Handles user login and signup for EliteCart.
 * Stores user name in Firestore on signup.
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { doc, setDoc } from "firebase/firestore";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";

export default function Auth() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [loadingOtp, setLoadingOtp] = useState(false);
  const [loadingVerify, setLoadingVerify] = useState(false);

  const handleSendOtp = async () => {
    setError("");
    setLoadingOtp(true);
    try {
      // Check if email is already registered in Firebase Auth
      const checkRes = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${process.env.REACT_APP_FIREBASE_API_KEY || process.env.VITE_FIREBASE_API_KEY || "AIzaSyAlzUeYPdKFlTDwkWO5Xt_9foN3BwmbpK0"}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: "dummy", returnSecureToken: true }),
      });
      const checkData = await checkRes.json();
      if (checkData.error && checkData.error.message !== "EMAIL_NOT_FOUND") {
        setError("Email is already registered. Please log in.");
        setLoadingOtp(false);
        return;
      }
      if (!checkData.error) {
        setError("Email is already registered. Please log in.");
        setLoadingOtp(false);
        return;
      }
      // If not registered, send OTP
      const res = await fetch("/api/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.success) {
        setOtpSent(true);
        setError("");
      } else {
        setError(data.error || "Failed to send OTP.");
      }
    } catch (err) {
      setError("Failed to send OTP.");
    }
    setLoadingOtp(false);
  };

  const handleVerifyOtp = async () => {
    setError("");
    setLoadingVerify(true);
    try {
      const res = await fetch("/api/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();
      if (!data.error) {
        setOtpVerified(true);
        setError("");
      } else {
        setError(data.error || "OTP verification failed.");
      }
    } catch (err) {
      setError("OTP verification failed.");
    }
    setLoadingVerify(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        alert("Logged in successfully");
      } else {
        if (!name.trim()) {
          setError("Please enter your name.");
          return;
        }
        if (!otpVerified) {
          setError("Please verify your email with OTP before signing up.");
          return;
        }
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, "users", userCredential.user.uid), {
          uid: userCredential.user.uid,
          email,
          name,
        });
        alert("Account created successfully");
      }
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.message);
    }
  };


  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-black/90 via-gray-900/80 to-pink-900/70 text-white relative overflow-hidden">
      {/* Glassmorphism card */}
      <div className="relative bg-white/10 backdrop-blur-lg border border-pink-600/30 p-10 rounded-3xl shadow-2xl w-full max-w-md space-y-8">
        {/* Gradient glow */}
        <div className="absolute -inset-0.5 blur-2xl opacity-20 bg-gradient-to-r from-pink-600/40 via-gray-900/20 to-pink-900/30 rounded-3xl pointer-events-none"></div>
        <h2 className="text-3xl font-extrabold text-center text-pink-400 font-sans tracking-tight drop-shadow mb-2">
          {isLogin ? "Login to EliteCart" : "Create your EliteCart Account"}
        </h2>
        <p className="text-center text-pink-200 font-medium mb-4">
          {isLogin ? "Welcome back! Sign in to continue shopping." : "Sign up to unlock premium features."}
        </p>
        {error && <p className="text-red-500 text-sm text-center bg-red-100/10 rounded p-2 mb-2">{error}</p>}
        <form className="space-y-4" onSubmit={handleSubmit}>
          {!isLogin && (
            <>
              <input
                type="text"
                placeholder="Name"
                className="w-full px-4 py-2 rounded-full bg-white/10 border border-pink-600/30 text-white focus:outline-none focus:ring-2 focus:ring-pink-500 font-sans"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Email"
                  className="w-full px-4 py-2 rounded-full bg-white/10 border border-pink-600/30 text-white focus:outline-none focus:ring-2 focus:ring-pink-500 font-sans"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setOtpSent(false);
                    setOtpVerified(false);
                    setOtp("");
                  }}
                  required
                  disabled={otpSent}
                />
                <button
                  type="button"
                  className="bg-pink-500 hover:bg-pink-700 text-white px-4 py-2 rounded-full font-bold shadow-lg transition"
                  onClick={handleSendOtp}
                  disabled={loadingOtp || !email || otpSent}
                >
                  {loadingOtp ? "Sending..." : otpSent ? "OTP Sent" : "Send OTP"}
                </button>
              </div>
              {otpSent && !otpVerified && (
                <div className="flex gap-2 mt-2">
                  <input
                    type="text"
                    placeholder="Enter OTP"
                    className="w-full px-4 py-2 rounded-full bg-white/10 border border-pink-600/30 text-white focus:outline-none focus:ring-2 focus:ring-pink-500 font-sans"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="bg-pink-500 hover:bg-pink-700 text-white px-4 py-2 rounded-full font-bold shadow-lg transition"
                    onClick={handleVerifyOtp}
                    disabled={loadingVerify || !otp}
                  >
                    {loadingVerify ? "Verifying..." : "Verify OTP"}
                  </button>
                </div>
              )}
              {otpVerified && (
                <p className="text-green-400 text-sm text-center">Email verified! You can now sign up.</p>
              )}
            </>
          )}
          {isLogin && (
            <input
              type="email"
              placeholder="Email"
              className="w-full px-4 py-2 rounded-full bg-white/10 border border-pink-600/30 text-white focus:outline-none focus:ring-2 focus:ring-pink-500 font-sans"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          )}
          <input
            type="password"
            placeholder="Password"
            className="w-full px-4 py-2 rounded-full bg-white/10 border border-pink-600/30 text-white focus:outline-none focus:ring-2 focus:ring-pink-500 font-sans"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="submit"
            className={`w-full bg-pink-600 hover:bg-pink-700 text-white py-2 rounded-full font-bold shadow-lg transition ${!isLogin && !otpVerified ? "opacity-50 cursor-not-allowed" : ""}`}
            disabled={!isLogin && !otpVerified}
          >
            {isLogin ? "Login" : "Sign Up"}
          </button>
        </form>
        <p className="text-sm text-center mt-2">
          {isLogin ? "Don't have an account?" : "Already have an account?"} {" "}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-pink-400 hover:underline font-bold"
          >
            {isLogin ? "Sign Up" : "Login"}
          </button>
        </p>
      </div>
    </div>
  );
}
