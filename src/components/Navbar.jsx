
/**
 * Navbar.jsx
 * Premium responsive navigation bar for EliteCart. Includes search, logout, mobile menu.
 */
import { NavLink, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user } = useAuth();

  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/shop?search=${encodeURIComponent(search.trim())}`);
      setSearch("");
    }
  };
  const [menuOpen, setMenuOpen] = useState(false);
  // Prevent body scroll when menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);
  return (
    <nav className="w-full backdrop-blur-lg bg-gradient-to-r from-black/90 via-gray-900/80 to-pink-900/70 border-b border-pink-600/30 shadow-xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-2 sm:px-4 md:px-8 py-2 md:py-4">
        {/* Logo & Brand */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <span className="bg-pink-600/80 rounded-full p-2 shadow-lg">
            <svg width="32" height="32" fill="none" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2a6 6 0 0 1 6 6c0 2.5-1.5 4.5-3.5 5.5V20a2 2 0 0 1-4 0v-6.5C7.5 12.5 6 10.5 6 8a6 6 0 0 1 6-6Z"/></svg>
          </span>
          <span className="font-extrabold text-2xl text-pink-400 tracking-wide drop-shadow">EliteCart</span>
        </div>
        {/* Desktop Search */}
        <form onSubmit={handleSearch} className="hidden md:flex items-center gap-2 bg-white/10 rounded-full px-4 py-2 shadow-lg border border-pink-600/20 mx-4 flex-1">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search products..."
            className="px-4 py-2 rounded-full bg-transparent text-white focus:outline-none placeholder:text-pink-200 w-full"
          />
          <button type="submit" className="bg-pink-600 hover:bg-pink-700 px-4 py-2 rounded-full text-white font-bold shadow">Search</button>
        </form>
        {/* Mobile Menu Button */}
        <div className="md:hidden ml-auto">
          <button onClick={() => setMenuOpen(!menuOpen)} className="p-2 rounded-full bg-pink-400 shadow-lg text-white focus:outline-none flex items-center justify-center">
            {/* Menu (bars) icon - pink gradient, less white, more attractive */}
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <defs>
                <linearGradient id="menuBarGradient" x1="0" y1="0" x2="24" y2="0" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#ec4899" />
                  <stop offset="1" stopColor="#f472b6" />
                </linearGradient>
              </defs>
              <rect y="5" width="24" height="3.5" rx="2" fill="#FFF8E1" opacity="1" />
              <rect y="11" width="24" height="3.5" rx="2" fill="#FFF8E1" opacity="1" />
              <rect y="17" width="24" height="3.5" rx="2" fill="#FFF8E1" opacity="1" />
            </svg>
          </button>
        </div>
        {/* Navigation Links - Mobile overlay with proper scrolling and positioning */}
        <div className={`fixed md:static top-0 left-0 w-full h-screen md:h-auto md:w-auto bg-black/95 md:bg-transparent z-50 md:z-auto transition-all duration-300 ${menuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}>
          <div className="h-full md:h-auto flex flex-col md:flex-row items-center justify-start md:justify-start gap-3 md:gap-4 px-4 py-6 md:p-0 overflow-y-auto max-h-screen">
            {/* Close button for mobile */}
            <div className="w-full flex justify-end md:hidden mb-2">
              <button 
                onClick={() => setMenuOpen(false)}
                className="p-2 rounded-full bg-pink-600 text-white hover:bg-pink-700 transition"
              >
                ✕
              </button>
            </div>
            
            {/* Mobile Search - Visible only in mobile menu */}
            <div className="w-full md:hidden mb-3">
              <form onSubmit={(e) => { handleSearch(e); setMenuOpen(false); }} className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2 border border-pink-600/20">
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search..."
                  className="px-2 py-1 bg-transparent text-white focus:outline-none placeholder:text-pink-200 w-full text-sm"
                />
                <button type="submit" className="bg-pink-600 hover:bg-pink-700 px-3 py-1 rounded text-white font-bold text-sm">
                  Go
                </button>
              </form>
            </div>

            {/* Navigation Items - Compact for mobile */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2 md:gap-4 w-full md:w-auto max-w-sm md:max-w-none">
              {/* Home button: only visible when not logged in */}
              {!user && (
                <NavLink
                  to="/"
                  className="flex items-center gap-2 px-4 py-3 rounded-lg bg-white/10 hover:bg-pink-600/30 transition font-semibold text-white text-base md:text-base w-full md:w-auto md:bg-transparent md:py-2"
                  onClick={() => setMenuOpen(false)}
                >
                  🏠 Home
                </NavLink>
              )}

              {/* Dashboard button: only visible when logged in */}
              {user && (
                <NavLink
                  to="/dashboard"
                  className="flex items-center gap-2 px-4 py-3 rounded-lg bg-white/10 hover:bg-pink-600/30 transition font-semibold text-white text-base md:text-base w-full md:w-auto md:bg-transparent md:py-2"
                  onClick={() => setMenuOpen(false)}
                >
                  📊 Dashboard
                </NavLink>
              )}
              
              <NavLink 
                to="/shop" 
                className="flex items-center gap-2 px-4 py-3 rounded-lg bg-white/10 hover:bg-pink-600/30 transition font-semibold text-white text-base md:text-base w-full md:w-auto md:bg-transparent md:py-2" 
                onClick={() => setMenuOpen(false)}
              >
                🛍️ Shop
              </NavLink>
              
              <NavLink 
                to="/cart" 
                className="flex items-center gap-2 px-4 py-3 rounded-lg bg-white/10 hover:bg-pink-600/30 transition font-semibold text-white text-base md:text-base w-full md:w-auto md:bg-transparent md:py-2" 
                onClick={() => setMenuOpen(false)}
              >
                🛒 Cart
              </NavLink>
              
              {user && user.email === "pankajjaiswal816117@gmail.com" && (
                <NavLink
                  to="/admin"
                  className="flex items-center gap-2 px-4 py-3 rounded-lg bg-white/10 hover:bg-pink-600/30 transition font-semibold text-white text-base md:text-base w-full md:w-auto md:bg-transparent md:py-2"
                  onClick={() => setMenuOpen(false)}
                >
                  ⚙️ Admin
                </NavLink>
              )}
              
              {user ? (
                <button
                  onClick={async () => {
                    await signOut(auth);
                    setMenuOpen(false);
                    navigate("/");
                  }}
                  className="bg-gradient-to-r from-pink-600 to-red-600 hover:from-pink-700 hover:to-red-700 px-4 py-3 rounded-lg text-white font-bold text-base md:text-base w-full md:w-auto md:py-2"
                >
                  🚪 Logout
                </button>
              ) : (
                <Link 
                  to="/auth" 
                  className="flex items-center gap-2 px-4 py-3 rounded-lg bg-white/10 hover:bg-pink-600/30 transition font-semibold text-white text-base md:text-base w-full md:w-auto md:bg-transparent md:py-2" 
                  onClick={() => setMenuOpen(false)}
                >
                  👤 Login
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
