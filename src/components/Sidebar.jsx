import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  LayoutDashboard,
  Trophy,
  Star,
  Sword,
  MessageCircle,
  Bot,
  X,
  User,
  LogOut,
  Sparkles,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import {
  setSidebarOpen,
  toggleSidebar,
  setSidebarCollapsed,
  toggleSidebarCollapsed,
  setActivePage,
  setAllFeaturesOpen,
  toggleAllFeatures,
} from "../store/slices/sidebarSlice";

const menuItems = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    path: "/dashboard",
  },
  {
    id: "tournaments",
    label: "Tournaments",
    icon: Trophy,
    path: "/tournaments",
  },
  {
    id: "gamification",
    label: "Gamification",
    icon: Star,
    path: "/gamification",
  },
  {
    id: "fantasy",
    label: "Fantasy",
    icon: Sword,
    path: "/fantasy",
  },
  {
    id: "community",
    label: "Community",
    icon: MessageCircle,
    path: "/community",
  },
  {
    id: "ai-features",
    label: "AI Features",
    icon: Bot,
    path: "/ai-features",
  },
];

export default function Sidebar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, userProfile, logout } = useAuth();
  
  // Get state from Redux
  const { sidebarOpen, sidebarCollapsed, activePage, allFeaturesOpen } = useSelector(
    (state) => state.sidebar
  );

  // Set sidebar open by default on desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        dispatch(setSidebarOpen(true));
        dispatch(setSidebarCollapsed(false));
      } else {
        dispatch(setSidebarOpen(false));
        dispatch(setSidebarCollapsed(false));
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [dispatch]);

  // Update active page based on location
  useEffect(() => {
    const currentPath = location.pathname;
    const matchingItem = menuItems.find((item) =>
      currentPath.startsWith(item.path)
    );
    if (matchingItem) {
      dispatch(setActivePage(matchingItem.id));
    } else if (currentPath === "/profile") {
      dispatch(setActivePage("profile"));
    } else if (currentPath === "/settings") {
      dispatch(setActivePage("settings"));
    }
  }, [location.pathname, dispatch]);

  const handleMenuClick = (item) => {
    if (item.path) {
      navigate(item.path);
      dispatch(setActivePage(item.id));
    }
    dispatch(setSidebarOpen(false));
  };

  const handleProfileClick = () => {
    navigate("/profile");
    dispatch(setSidebarOpen(false));
    dispatch(setActivePage("profile"));
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleAllFeaturesClick = () => {
    dispatch(toggleAllFeatures());
    if (!allFeaturesOpen) {
      navigate("/dashboard");
      dispatch(setActivePage("dashboard"));
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={() => dispatch(setSidebarOpen(false))}
        />
      )}

      {/* Sidebar */}
      <motion.div
        initial={false}
        animate={{
          x: sidebarOpen ? "0px" : "-280px",
        }}
        className={`lg:translate-x-0 lg:fixed lg:left-0 lg:top-0 lg:h-screen fixed inset-y-0 left-0 z-50 bg-gray-900/95 backdrop-blur-lg border-r border-gray-800 flex-shrink-0 transition-all duration-300 ${
          sidebarCollapsed ? "lg:w-20" : "lg:w-64"
        }`}
      >
        <div className="h-full flex flex-col max-h-screen">
          {/* Sidebar Header - Fixed */}
          <div className="p-6 border-b border-gray-800 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-800 flex items-center justify-center border border-gray-700">
                <img
                  src="/logo.png"
                  alt="VIN Tournament"
                  className="w-full h-full object-contain"
                />
              </div>
              {!sidebarCollapsed && (
                <div>
                  <h2 className="text-white font-bold text-lg">
                    VIN Tournament
                  </h2>
                  <p className="text-gray-400 text-sm">Pro Player</p>
                </div>
              )}
            </div>
            <div className="flex items-center justify-between mt-4">
              <button
                onClick={() => dispatch(setSidebarOpen(false))}
                className="lg:hidden text-gray-400 hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
              <button
                onClick={() => dispatch(toggleSidebarCollapsed())}
                className="hidden lg:block text-gray-400 hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Navigation Menu - Scrollable */}
          <div className="flex-1 p-4 overflow-y-auto min-h-0">
            <nav className="space-y-2">
              {menuItems.map((item) => {
                const isActive =
                  activePage === item.id ||
                  location.pathname.startsWith(item.path);
                return (
                  <button
                    key={item.id}
                    onClick={() => handleMenuClick(item)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? "bg-gradient-to-r from-cyan-500/20 to-pink-500/20 text-white border border-cyan-500/30"
                        : "text-gray-400 hover:text-white hover:bg-gray-800/50"
                    }`}
                    title={sidebarCollapsed ? item.label : ""}
                  >
                    <item.icon className="w-5 h-5 flex-shrink-0" />
                    {!sidebarCollapsed && (
                      <span className="font-medium">{item.label}</span>
                    )}
                  </button>
                );
              })}

              {/* Separator */}
              {!sidebarCollapsed && (
                <div className="border-t border-gray-700 my-4"></div>
              )}

              {/* All Features Button */}
              <button
                onClick={handleAllFeaturesClick}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                  allFeaturesOpen
                    ? "bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg"
                    : "bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:shadow-lg hover:scale-105"
                }`}
                title={sidebarCollapsed ? "All Features" : ""}
              >
                <Sparkles className="w-5 h-5 flex-shrink-0" />
                {!sidebarCollapsed && (
                  <span className="font-bold">All Features</span>
                )}
              </button>
            </nav>
          </div>

          {/* User Profile & Logout - Fixed at bottom */}
          <div className="p-4 border-t border-gray-800 flex-shrink-0">
            {!sidebarCollapsed && (
              <button
                onClick={handleProfileClick}
                className={`w-full flex items-center gap-3 mb-4 p-3 rounded-lg transition-colors ${
                  activePage === "profile" || location.pathname === "/profile"
                    ? "bg-gradient-to-r from-cyan-500/20 to-pink-500/20 border border-cyan-500/30"
                    : "bg-gray-800/50 hover:bg-gray-800"
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-400 to-pink-500 flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-sm">
                    {currentUser?.username?.charAt(0).toUpperCase() || "U"}
                  </span>
                </div>
                <div className="flex-1 text-left min-w-0">
                  <p className="text-white font-medium text-sm truncate">
                    {currentUser?.username || "User"}
                  </p>
                  <p className="text-gray-400 text-xs truncate">
                    {userProfile?.gaming_id || "Loading..."}
                  </p>
                </div>
              </button>
            )}

            {/* Profile Button for Collapsed Sidebar */}
            {sidebarCollapsed && (
              <button
                onClick={handleProfileClick}
                className={`w-full flex items-center justify-center px-4 py-3 rounded-lg transition-colors mb-2 ${
                  activePage === "profile" || location.pathname === "/profile"
                    ? "bg-gradient-to-r from-cyan-500/20 to-pink-500/20 text-white border border-cyan-500/30"
                    : "text-gray-400 hover:text-white hover:bg-gray-800/50"
                }`}
                title="Profile"
              >
                <User className="w-5 h-5 flex-shrink-0" />
              </button>
            )}

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
              title={sidebarCollapsed ? "Logout" : ""}
            >
              <LogOut className="w-5 h-5 flex-shrink-0" />
              {!sidebarCollapsed && <span className="font-medium">Logout</span>}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Mobile Menu Button */}
      {!sidebarOpen && (
        <button
          onClick={() => dispatch(setSidebarOpen(true))}
          className="lg:hidden fixed top-4 left-4 z-40 text-white p-2 rounded-lg bg-gray-900/50 backdrop-blur-lg border border-gray-800 hover:bg-gray-800 transition-colors"
        >
          <LayoutDashboard className="w-6 h-6" />
        </button>
      )}
    </>
  );
}

export { menuItems };

