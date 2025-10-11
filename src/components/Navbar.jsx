import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
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
  Mail,
  AlertTriangle,
  Shield,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";


export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const location = useLocation();
  const { currentUser, userProfile } = useAuth();

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

  const navItems = [
    { name: "Home", path: "/", icon: Trophy },
    { name: "Games", path: "/games", icon: Gamepad2 },
    { name: "Tournaments", path: "/tournaments", icon: Trophy },
    { name: "Leaderboard", path: "/leaderboard", icon: Trophy },
    { name: "Players", path: "/players", icon: User },
  ];



  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        scrolled
          ? "bg-black/90 backdrop-blur-xl border-b border-gray-800/50"
          : "bg-black/70 backdrop-blur-lg border-b border-gray-800"
      } px-6 py-3`}
    >
      <div className="flex justify-between items-center max-w-7xl mx-auto">
        {/* Logo */}
        <Link to="/">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center"
          >
            <img
              src="/logo.svg"
              alt="VIN Tournament"
              className="w-8 h-8 sm:w-10 sm:h-10"
            />
          </motion.div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex gap-8 text-gray-300 font-medium">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`relative flex items-center gap-2 hover:text-cyan-400 transition-colors ${
                location.pathname === item.path ? "text-cyan-400" : ""
              }`}
            >
              <item.icon size={18} />
              {item.name}
              {location.pathname === item.path && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute -bottom-2 left-0 right-0 h-0.5 bg-cyan-400"
                />
              )}
            </Link>
          ))}

        </div>

        {/* User Menu / Auth Buttons */}
        <div className="hidden md:flex items-center gap-4">
          {currentUser ? (
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-pink-500 hover:from-cyan-400 hover:to-pink-400 px-4 py-2 rounded-full text-white font-semibold transition-all"
              >
                <UserCircle size={22} />
                {currentUser?.username || currentUser?.email || "User"}
              </motion.button>

              <AnimatePresence>
                {showUserMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 w-48 bg-gray-900 border border-gray-700 rounded-lg shadow-xl"
                  >
                    <Link
                      to="/profile"
                      className="flex items-center gap-2 px-4 py-2 hover:bg-gray-800 transition-colors"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <User size={16} />
                      Profile
                    </Link>
                    <Link
                      to="/email-verify"
                      className="flex items-center gap-2 px-4 py-2 hover:bg-gray-800 transition-colors"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <Mail size={16} />
                      Email Verification
                    </Link>
                    {userProfile?.role === "admin" && (
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
                  whileHover={{ scale: 1.05 }}
                  className="px-4 py-2 text-cyan-400 border border-cyan-400 rounded-full hover:bg-cyan-400 hover:text-black transition-all"
                >
                  Login
                </motion.button>
              </Link>
              <Link to="/register">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-pink-500 text-white rounded-full hover:from-cyan-400 hover:to-pink-400 transition-all"
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
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-black/95 border-t border-gray-800 mt-3 pt-4"
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


            {currentUser ? (
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
    </motion.nav>
  );
}
