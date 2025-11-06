import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  UserCircle,
  Menu,
  X,
  Trophy,
  Gamepad2,
  User,
  LogOut,
  Settings,
  Shield,
  Star,
  Sword,
  MessageCircle,
  Bot,
  Bell,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showFeaturesMenu, setShowFeaturesMenu] = useState(false);
  const location = useLocation();
  const { currentUser, userProfile, isAuthenticated } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      setShowUserMenu(false);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Different menu items based on authentication status
  const publicNavItems = [
    { name: "Home", path: "/", icon: Trophy },
    { name: "Games", path: "/games", icon: Gamepad2 },
    { name: "About", path: "/about", icon: User },
  ];

  const authenticatedNavItems = [
    { name: "Dashboard", path: "/dashboard", icon: Trophy },
    { name: "Games", path: "/games", icon: Gamepad2 },
  ];

  const featureItems = [
    { name: "Gamification", path: "/gamification", icon: Star },
    { name: "Fantasy", path: "/fantasy", icon: Sword },
    { name: "Community", path: "/community", icon: MessageCircle },
    { name: "AI Features", path: "/ai-features", icon: Bot },
    { name: "Notifications", path: "/notifications", icon: Bell },
  ];

  // Use different nav items based on authentication
  const navItems = isAuthenticated ? authenticatedNavItems : publicNavItems;

  return (
    <nav
      className={`sticky top-0 left-0 w-full z-50 transition-all duration-300 ${
        scrolled
          ? "bg-gradient-to-r from-black/95 via-gray-900/95 to-black/95 backdrop-blur-xl border-b border-cyan-500/30 shadow-lg shadow-cyan-500/10"
          : "bg-gradient-to-r from-black/80 via-gray-900/80 to-black/80 backdrop-blur-lg border-b border-gray-700/50"
      } px-6 py-4`}
    >
      <div className="flex justify-between items-center max-w-7xl mx-auto">
        {/* Logo */}
        <Link to={isAuthenticated ? "/dashboard" : "/"}>
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-3"
          >
            <img
              src="/logo.png"
              alt="VIN Tournament"
              className="w-8 h-8 sm:w-10 sm:h-10 object-contain"
            />
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold bg-gradient-to-r from-orange-400 via-yellow-400 to-orange-500 bg-clip-text text-transparent">
                VIN
              </h1>
              <p className="text-xs text-orange-400 -mt-1 font-medium">
                TOURNAMENT
              </p>
            </div>
          </motion.div>
        </Link>

        {/* Desktop Navigation */}
        {!isAuthenticated && (
          <div className="hidden md:flex gap-6 text-gray-300 font-medium">
            {navItems.map((item) => (
              <motion.div
                key={item.path}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="relative"
              >
                <Link
                  to={item.path}
                  className={`relative flex items-center gap-2 px-4 py-3 rounded-lg transition-all duration-300 ${
                    location.pathname === item.path
                      ? "text-cyan-400 bg-cyan-400/10 shadow-lg shadow-cyan-400/20"
                      : "hover:text-cyan-400 hover:bg-cyan-400/5 hover:shadow-md"
                  }`}
                >
                  <motion.div
                    animate={{
                      rotate: location.pathname === item.path ? 360 : 0,
                      scale: location.pathname === item.path ? 1.1 : 1,
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    <item.icon size={18} />
                  </motion.div>
                  {item.name}
                </Link>
                {location.pathname === item.path && (
                  <motion.div
                    initial={{ y: -20, opacity: 0, scaleX: 0 }}
                    animate={{ y: 0, opacity: 1, scaleX: 1 }}
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 20,
                      delay: 0.1,
                    }}
                    className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-gradient-to-r from-cyan-400 to-pink-400 rounded-full shadow-lg shadow-cyan-400/50"
                  />
                )}
              </motion.div>
            ))}
          </div>
        )}

        {/* Features Dropdown - Hidden when authenticated (moved to dashboard) */}
        {false && isAuthenticated && (
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowFeaturesMenu(!showFeaturesMenu)}
              className="flex items-center gap-2 px-4 py-3 rounded-lg transition-all duration-300 text-gray-300 hover:text-cyan-400 hover:bg-cyan-400/5 hover:shadow-md"
            >
              <Star size={18} />
              Features
            </motion.button>

            <AnimatePresence>
              {showFeaturesMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  className="absolute top-full left-0 mt-2 w-48 bg-gradient-to-br from-gray-900 to-black border border-cyan-500/30 rounded-xl shadow-2xl shadow-cyan-500/10 backdrop-blur-lg"
                >
                  {featureItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-gray-800 transition-colors text-gray-300 hover:text-cyan-400 first:rounded-t-xl last:rounded-b-xl"
                      onClick={() => setShowFeaturesMenu(false)}
                    >
                      <item.icon size={16} />
                      {item.name}
                    </Link>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* User Menu / Auth Buttons */}
        <div className="hidden md:flex items-center gap-4">
          {isAuthenticated ? (
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 via-blue-500 to-pink-500 hover:from-cyan-400 hover:via-blue-400 hover:to-pink-400 px-5 py-2.5 rounded-full text-white font-semibold transition-all duration-300 shadow-lg shadow-cyan-500/25 border border-cyan-400/30"
              >
                <UserCircle size={22} />
                {currentUser?.username || currentUser?.email || "User"}
              </motion.button>

              <AnimatePresence>
                {showUserMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    className="absolute right-0 mt-3 w-52 bg-gradient-to-br from-gray-900 to-black border border-cyan-500/30 rounded-xl shadow-2xl shadow-cyan-500/10 backdrop-blur-lg"
                  >
                    <Link
                      to="/profile"
                      className="flex items-center gap-2 px-4 py-2 hover:bg-gray-800 transition-colors"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <User size={16} />
                      Profile
                    </Link>

                    {(currentUser?.email === "prathamg0000@gmail.com" ||
                      userProfile?.role === "admin") && (
                      <Link
                        to="/admin"
                        className="flex items-center gap-2 px-4 py-2 hover:bg-gray-800 transition-colors border-t border-gray-700"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <Shield size={16} className="text-red-400" />
                        <span className="text-red-400 font-semibold">
                          Admin Dashboard
                        </span>
                      </Link>
                    )}
                    <Link
                      to="/settings"
                      className="flex items-center gap-2 px-4 py-2 hover:bg-gray-800 transition-colors"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <Settings size={16} />
                      Settings
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 px-4 py-2 hover:bg-gray-800 transition-colors w-full text-left text-red-400"
                    >
                      <LogOut size={16} />
                      Logout
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="flex gap-2">
              <Link to="/login">
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-5 py-2.5 text-cyan-400 border-2 border-cyan-400 rounded-full hover:bg-cyan-400 hover:text-black transition-all duration-300 font-semibold shadow-lg shadow-cyan-400/20"
                >
                  Login
                </motion.button>
              </Link>
              <Link to="/register">
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 via-blue-500 to-pink-500 text-white rounded-full hover:from-cyan-400 hover:via-blue-400 hover:to-pink-400 transition-all duration-300 font-semibold shadow-lg shadow-cyan-500/25 border border-cyan-400/30"
                >
                  Sign Up
                </motion.button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden text-cyan-400"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </motion.button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -20 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0, y: -20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="md:hidden bg-gradient-to-b from-black/95 to-gray-900/95 border-t border-cyan-500/30 mt-4 pt-4 backdrop-blur-lg"
          >
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 hover:bg-gray-800 transition-colors ${
                  location.pathname === item.path
                    ? "text-cyan-400 bg-gray-800/50"
                    : "text-gray-300"
                }`}
              >
                <item.icon size={18} />
                {item.name}
              </Link>
            ))}

            {/* Features Section in Mobile - Only for authenticated users */}
            {isAuthenticated && (
              <div className="border-t border-gray-700 mt-2 pt-2">
                <div className="px-4 py-2 text-cyan-400 font-semibold text-sm">
                  Features
                </div>
                {featureItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-800 transition-colors text-gray-300"
                  >
                    <item.icon size={18} />
                    {item.name}
                  </Link>
                ))}
              </div>
            )}

            {isAuthenticated ? (
              <>
                <Link
                  to="/profile"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-gray-800 transition-colors text-gray-300"
                >
                  <User size={18} />
                  Profile
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsOpen(false);
                  }}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-gray-800 transition-colors text-red-400 w-full text-left"
                >
                  <LogOut size={18} />
                  Logout
                </button>
              </>
            ) : (
              <div className="px-4 py-3 space-y-2">
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="block w-full text-center px-4 py-2 text-cyan-400 border border-cyan-400 rounded-full hover:bg-cyan-400 hover:text-black transition-all"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsOpen(false)}
                  className="block w-full text-center px-4 py-2 bg-gradient-to-r from-cyan-500 to-pink-500 text-white rounded-full hover:from-cyan-400 hover:to-pink-400 transition-all"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
