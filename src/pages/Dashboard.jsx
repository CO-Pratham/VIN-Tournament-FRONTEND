import React, { useState, useEffect } from "react";

import { motion, AnimatePresence } from "framer-motion";
import { useSelector, useDispatch } from "react-redux";
import {
  Bell,
  Home,
  Gamepad2,
  X,
  Sparkles,
  Star,
  Trophy,
  Sword,
  Users,
  Award,
  Zap,
  Crown,
  Shield,
  TrendingUp,
  Flame,
  Clock,
  Bot,
  MessageCircle,
  User,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  fetchNotifications,
  toggleNotifications,
  hideNotifications,
  markAsRead,
  markAllAsRead,
} from "../store/slices/notificationSlice";
import {
  setActivePage,
  setAllFeaturesOpen,
} from "../store/slices/sidebarSlice";
import WebSocketService from "../services/websocket";
import api from "../services/api";
import Sidebar from "../components/Sidebar";

// Import all the page components
import Tournaments from "./Tournaments";
import Leaderboard from "./Leaderboard";
import Gamification from "./Gamification";
import Fantasy from "./Fantasy";
import Community from "./Community";
import AIFeatures from "./AIFeatures";
import Profile from "./Profile";
import SettingsPage from "./Settings";

export default function Dashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Get sidebar state from Redux
  const { activePage, allFeaturesOpen, sidebarCollapsed } = useSelector(
    (state) => state.sidebar
  );

  // Get notifications state from Redux
  const {
    notifications,
    unreadCount,
    showNotifications,
    loading: notificationsLoading,
  } = useSelector((state) => state.notifications);

  // Get auth state
  const { currentUser, userProfile, logout, isAuthenticated } = useAuth();

  // Real data states
  const [dashboardStats, setDashboardStats] = useState({
    activeTournaments: 0,
    totalMembers: 0,
    fantasyTeams: 0,
    achievements: 50,
  });
  const [tournaments, setTournaments] = useState([]);
  const [myTeams, setMyTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  // Set sidebar open by default on desktop and keep it persistent
  useEffect(() => {
    // Set initial active page based on location or default to dashboard
    const path = window.location.pathname;
    if (path.includes("/tournaments")) dispatch(setActivePage("tournaments"));
    else if (path.includes("/gamification"))
      dispatch(setActivePage("gamification"));
    else if (path.includes("/fantasy")) dispatch(setActivePage("fantasy"));
    else if (path.includes("/community")) dispatch(setActivePage("community"));
    else if (path.includes("/ai-features"))
      dispatch(setActivePage("ai-features"));
    else if (path.includes("/profile")) dispatch(setActivePage("profile"));
    else if (path.includes("/settings")) dispatch(setActivePage("settings"));
    else dispatch(setActivePage("dashboard"));
  }, [dispatch]);

  // Initialize notifications and WebSocket
  useEffect(() => {
    if (isAuthenticated && currentUser) {
      // Fetch initial notifications
      dispatch(fetchNotifications());

      // Connect to WebSocket for real-time notifications
      const token = localStorage.getItem("access_token");
      if (token) {
        WebSocketService.connect(token);
      }
    }

    return () => {
      // Cleanup WebSocket on unmount
      WebSocketService.disconnect();
    };
  }, [isAuthenticated, currentUser, dispatch]);

  // Fetch real dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const [tournamentsRes, teamsRes, chatRoomsRes, badgesRes] =
          await Promise.all([
            api.getTournaments().catch(() => ({ results: [] })),
            api.getMyFantasyTeams().catch(() => ({ data: { teams: [] } })),
            api.getChatRooms().catch(() => ({ results: [] })),
            api.getBadges().catch(() => ({ results: [] })),
          ]);

        const tournamentsList = tournamentsRes.results || tournamentsRes || [];
        const teamsList =
          teamsRes.data?.teams || teamsRes.results || teamsRes || [];
        const chatRoomsList = chatRoomsRes.results || chatRoomsRes || [];
        const badgesList = badgesRes.results || badgesRes || [];

        setTournaments(tournamentsList);
        setMyTeams(teamsList);

        // Calculate actual stats
        const activeTournamentsCount = tournamentsList.filter(
          (t) => t.status === "active" || t.status === "upcoming"
        ).length;
        const totalMembersCount = chatRoomsList.reduce(
          (sum, room) => sum + (room.member_count || 0),
          0
        );
        const totalBadgesCount = badgesList.length || 0;

        setDashboardStats({
          activeTournaments: activeTournamentsCount,
          totalMembers: totalMembersCount || 0,
          fantasyTeams: teamsList.length,
          achievements: totalBadgesCount,
        });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [isAuthenticated]);

  const featuresData = [
    {
      id: "gamification",
      title: "Gamification",
      description: "Earn points, unlock achievements, and climb the ranks",
      icon: Star,
      color: "from-orange-400 to-red-500",
      iconColor: "text-orange-400",
      stats: `${dashboardStats.achievements} Achievements`,
      gradient: "bg-gradient-to-r from-orange-400 to-red-500",
    },
    {
      id: "tournaments",
      title: "Tournaments",
      description: "Compete in daily tournaments and win amazing prizes",
      icon: Trophy,
      color: "from-blue-400 to-cyan-500",
      iconColor: "text-blue-400",
      stats: `${dashboardStats.activeTournaments} Active Events`,
      gradient: "bg-gradient-to-r from-blue-400 to-cyan-500",
    },
    {
      id: "fantasy",
      title: "Fantasy League",
      description: "Build your dream team and compete with friends",
      icon: Sword,
      color: "from-pink-400 to-purple-500",
      iconColor: "text-pink-400",
      stats: `${dashboardStats.fantasyTeams} Teams Created`,
      gradient: "bg-gradient-to-r from-pink-400 to-purple-500",
    },
    {
      id: "ai-features",
      title: "AI Features",
      description: "Get personalized recommendations and predictions",
      icon: Bot,
      color: "from-green-400 to-emerald-500",
      iconColor: "text-green-400",
      stats: "95% Accuracy",
      gradient: "bg-gradient-to-r from-green-400 to-emerald-500",
    },
    {
      id: "community",
      title: "Community",
      description: "Connect with players worldwide and chat",
      icon: Users,
      color: "from-red-400 to-pink-500",
      iconColor: "text-red-400",
      stats: `${
        dashboardStats.totalMembers > 0
          ? dashboardStats.totalMembers.toLocaleString()
          : "0"
      } Members`,
      gradient: "bg-gradient-to-r from-red-400 to-pink-500",
    },
    {
      id: "leaderboard",
      title: "Leaderboard",
      description: "Track your rank globally and climb to the top",
      icon: Award,
      color: "from-yellow-400 to-orange-500",
      iconColor: "text-yellow-400",
      stats: "Global Rankings",
      gradient: "bg-gradient-to-r from-yellow-400 to-orange-500",
    },
  ];

  const handlePageChange = (pageId) => {
    if (pageId === "all-features") {
      dispatch(setAllFeaturesOpen(true));
    } else {
      dispatch(setActivePage(pageId));
    }
  };

  const handleFeatureClick = (featureId) => {
    dispatch(setActivePage(featureId));
    dispatch(setAllFeaturesOpen(false));
  };

  const markNotificationAsRead = (notificationId) => {
    dispatch(markAsRead(notificationId));
  };

  const handleNotificationClick = (notification) => {
    // Mark as read
    if (!notification.is_read) {
      dispatch(markAsRead(notification.id));
    }

    // Navigate based on notification type
    switch (notification.type) {
      case "tournament":
        navigate(`/tournament/${notification.data.tournament_id}`);
        break;
      case "fantasy":
        navigate(`/fantasy/team/${notification.data.team_id}`);
        break;
      case "community":
        navigate(`/community/channel/${notification.data.channel_id}`);
        break;
      case "gamification":
        navigate("/gamification");
        break;
      case "ai":
        navigate("/ai-features");
        break;
      default:
        break;
    }

    dispatch(hideNotifications());
  };

  const handleMarkAllAsRead = () => {
    dispatch(markAllAsRead());
  };

  const renderActivePage = () => {
    switch (activePage) {
      case "dashboard":
        return (
          <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6 md:space-y-8">
            {/* Hero Section */}
            <div className="relative overflow-hidden bg-gradient-to-r from-purple-900/50 via-blue-900/50 to-pink-900/50 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 border border-purple-500/20">
              <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 sm:gap-3 mb-2">
                      <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent break-words">
                        Welcome Back, {userProfile?.username || "Gamer"}!
                      </h1>
                      <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-400 animate-pulse flex-shrink-0" />
                    </div>
                    <p className="text-gray-300 text-sm sm:text-base md:text-lg mb-3 sm:mb-4">
                      Ready to dominate the battlefield? Let's make it
                      legendary!
                    </p>
                    <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
                      <div className="flex items-center gap-2 bg-green-500/20 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-green-500/30">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <span className="text-green-400 text-xs sm:text-sm font-medium">
                          All Systems Operational
                        </span>
                      </div>
                      <div className="flex items-center gap-2 bg-blue-500/20 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-blue-500/30">
                        <Zap className="w-3 h-3 sm:w-4 sm:h-4 text-blue-400" />
                        <span className="text-blue-400 text-xs sm:text-sm font-medium">
                          AI Powered
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="hidden md:block">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-2xl opacity-50 animate-pulse"></div>
                      <Crown className="w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 text-yellow-400 relative z-10" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div>
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-green-400" />
                  <span className="hidden sm:inline">Your Performance</span>
                  <span className="sm:hidden">Performance</span>
                </h2>
                <button className="text-blue-400 hover:text-blue-300 text-xs sm:text-sm font-medium flex items-center gap-1">
                  <span className="hidden sm:inline">View Details</span>
                  <span className="sm:hidden">Details</span>
                  <span>→</span>
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="group relative bg-gradient-to-br from-yellow-500/10 to-orange-500/10 backdrop-blur-sm p-3 sm:p-4 md:p-6 rounded-lg sm:rounded-xl border border-yellow-500/20 hover:border-yellow-500/40 transition-all duration-300 hover:scale-105 cursor-pointer"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-orange-500/5 rounded-lg sm:rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative">
                    <div className="flex items-center justify-between mb-2 sm:mb-3 md:mb-4">
                      <div className="p-2 sm:p-3 bg-yellow-500/20 rounded-lg group-hover:scale-110 transition-transform">
                        <Trophy className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-yellow-400" />
                      </div>
                      <Flame className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-orange-400 animate-pulse" />
                    </div>
                    <p className="text-gray-400 text-xs sm:text-sm mb-1 truncate">
                      Active Tournaments
                    </p>
                    <p className="text-white font-bold text-xl sm:text-2xl md:text-3xl mb-1">
                      {loading
                        ? "..."
                        : dashboardStats.activeTournaments > 0
                        ? dashboardStats.activeTournaments
                        : "0"}
                    </p>
                    <p className="text-green-400 text-xs flex items-center gap-1">
                      <span className="font-medium">Join</span>
                      <span className="text-gray-400 hidden sm:inline">
                        the action
                      </span>
                    </p>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="group relative bg-gradient-to-br from-blue-500/10 to-cyan-500/10 backdrop-blur-sm p-3 sm:p-4 md:p-6 rounded-lg sm:rounded-xl border border-blue-500/20 hover:border-blue-500/40 transition-all duration-300 hover:scale-105 cursor-pointer"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 rounded-lg sm:rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative">
                    <div className="flex items-center justify-between mb-2 sm:mb-3 md:mb-4">
                      <div className="p-2 sm:p-3 bg-blue-500/20 rounded-lg group-hover:scale-110 transition-transform">
                        <Users className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-blue-400" />
                      </div>
                      <Shield className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-cyan-400" />
                    </div>
                    <p className="text-gray-400 text-xs sm:text-sm mb-1 truncate">
                      <span className="hidden sm:inline">Community </span>
                      Members
                    </p>
                    <p className="text-white font-bold text-xl sm:text-2xl md:text-3xl mb-1">
                      {loading
                        ? "..."
                        : dashboardStats.totalMembers > 1000
                        ? `${Math.floor(dashboardStats.totalMembers / 1000)}K+`
                        : dashboardStats.totalMembers}
                    </p>
                    <p className="text-green-400 text-xs flex items-center gap-1">
                      <span className="font-medium">Growing</span>
                      <span className="text-gray-400 hidden sm:inline">
                        community
                      </span>
                    </p>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="group relative bg-gradient-to-br from-pink-500/10 to-purple-500/10 backdrop-blur-sm p-3 sm:p-4 md:p-6 rounded-lg sm:rounded-xl border border-pink-500/20 hover:border-pink-500/40 transition-all duration-300 hover:scale-105 cursor-pointer"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-purple-500/5 rounded-lg sm:rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative">
                    <div className="flex items-center justify-between mb-2 sm:mb-3 md:mb-4">
                      <div className="p-2 sm:p-3 bg-pink-500/20 rounded-lg group-hover:scale-110 transition-transform">
                        <Sword className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-pink-400" />
                      </div>
                      <Star className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-purple-400 animate-pulse" />
                    </div>
                    <p className="text-gray-400 text-xs sm:text-sm mb-1 truncate">
                      Fantasy Teams
                    </p>
                    <p className="text-white font-bold text-xl sm:text-2xl md:text-3xl mb-1">
                      {loading
                        ? "..."
                        : dashboardStats.fantasyTeams > 0
                        ? dashboardStats.fantasyTeams
                        : "0"}
                    </p>
                    <p className="text-green-400 text-xs flex items-center gap-1">
                      <span className="font-medium">Your</span>
                      <span className="text-gray-400 hidden sm:inline">
                        teams
                      </span>
                    </p>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="group relative bg-gradient-to-br from-purple-500/10 to-indigo-500/10 backdrop-blur-sm p-3 sm:p-4 md:p-6 rounded-lg sm:rounded-xl border border-purple-500/20 hover:border-purple-500/40 transition-all duration-300 hover:scale-105 cursor-pointer"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-indigo-500/5 rounded-lg sm:rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative">
                    <div className="flex items-center justify-between mb-2 sm:mb-3 md:mb-4">
                      <div className="p-2 sm:p-3 bg-purple-500/20 rounded-lg group-hover:scale-110 transition-transform">
                        <Award className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-purple-400" />
                      </div>
                      <Crown className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-yellow-400" />
                    </div>
                    <p className="text-gray-400 text-xs sm:text-sm mb-1 truncate">
                      Achievements
                    </p>
                    <p className="text-white font-bold text-xl sm:text-2xl md:text-3xl mb-1">
                      {loading ? "..." : dashboardStats.achievements}
                    </p>
                    <p className="text-green-400 text-xs flex items-center gap-1">
                      <span className="font-medium">Unlockable</span>
                      <span className="text-gray-400 hidden sm:inline">
                        badges
                      </span>
                    </p>
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Featured Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {/* Quick Actions */}
              <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800 p-4 sm:p-6">
                <h3 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4 flex items-center gap-2">
                  <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
                  Quick Actions
                </h3>
                <div className="space-y-3">
                  <button
                    onClick={() => handlePageChange("tournaments")}
                    className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 hover:from-blue-500/20 hover:to-cyan-500/20 rounded-lg border border-blue-500/20 hover:border-blue-500/40 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <Trophy className="w-5 h-5 text-blue-400" />
                      <span className="text-white font-medium">
                        Join Tournament
                      </span>
                    </div>
                    <span className="text-blue-400 group-hover:translate-x-1 transition-transform">
                      →
                    </span>
                  </button>
                  <button
                    onClick={() => handlePageChange("fantasy")}
                    className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-pink-500/10 to-purple-500/10 hover:from-pink-500/20 hover:to-purple-500/20 rounded-lg border border-pink-500/20 hover:border-pink-500/40 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <Sword className="w-5 h-5 text-pink-400" />
                      <span className="text-white font-medium">
                        Create Fantasy Team
                      </span>
                    </div>
                    <span className="text-pink-400 group-hover:translate-x-1 transition-transform">
                      →
                    </span>
                  </button>
                  <button
                    onClick={() => handlePageChange("community")}
                    className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 hover:from-green-500/20 hover:to-emerald-500/20 rounded-lg border border-green-500/20 hover:border-green-500/40 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <MessageCircle className="w-5 h-5 text-green-400" />
                      <span className="text-white font-medium">
                        Join Community Chat
                      </span>
                    </div>
                    <span className="text-green-400 group-hover:translate-x-1 transition-transform">
                      →
                    </span>
                  </button>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800 p-4 sm:p-6">
                <h3 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4 flex items-center gap-2">
                  <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
                  Recent Activity
                </h3>
                <div className="space-y-2 sm:space-y-3">
                  {notifications && notifications.length > 0 ? (
                    notifications.slice(0, 5).map((notification) => {
                      // Get icon and color based on notification type
                      let Icon, iconColor, bgColor;
                      switch (notification.type) {
                        case "tournament":
                          Icon = Trophy;
                          iconColor = "text-blue-400";
                          bgColor = "bg-blue-500/20";
                          break;
                        case "fantasy":
                          Icon = Sword;
                          iconColor = "text-purple-400";
                          bgColor = "bg-purple-500/20";
                          break;
                        case "social":
                        case "community":
                          Icon = MessageCircle;
                          iconColor = "text-green-400";
                          bgColor = "bg-green-500/20";
                          break;
                        case "gamification":
                          Icon = Award;
                          iconColor = "text-yellow-400";
                          bgColor = "bg-yellow-500/20";
                          break;
                        case "ai":
                          Icon = Bot;
                          iconColor = "text-cyan-400";
                          bgColor = "bg-cyan-500/20";
                          break;
                        case "system":
                          Icon = Shield;
                          iconColor = "text-indigo-400";
                          bgColor = "bg-indigo-500/20";
                          break;
                        default:
                          Icon = Bell;
                          iconColor = "text-gray-400";
                          bgColor = "bg-gray-500/20";
                      }

                      // Format time ago
                      const getTimeAgo = (dateString) => {
                        const date = new Date(dateString);
                        const now = new Date();
                        const diffInSeconds = Math.floor((now - date) / 1000);

                        if (diffInSeconds < 60) return "just now";
                        if (diffInSeconds < 3600)
                          return `${Math.floor(
                            diffInSeconds / 60
                          )} minutes ago`;
                        if (diffInSeconds < 86400)
                          return `${Math.floor(
                            diffInSeconds / 3600
                          )} hours ago`;
                        if (diffInSeconds < 604800)
                          return `${Math.floor(
                            diffInSeconds / 86400
                          )} days ago`;
                        return date.toLocaleDateString();
                      };

                      return (
                        <div
                          key={notification.id}
                          className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${
                            !notification.is_read
                              ? "bg-blue-500/10 border border-blue-500/20"
                              : "bg-gray-800/50"
                          }`}
                        >
                          <div className={`p-2 ${bgColor} rounded-lg`}>
                            <Icon className={`w-4 h-4 ${iconColor}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-white text-sm font-medium truncate">
                              {notification.title}
                            </p>
                            <p className="text-gray-400 text-xs mt-0.5 line-clamp-2">
                              {notification.message}
                            </p>
                            <p className="text-gray-500 text-xs mt-1">
                              {getTimeAgo(notification.created_at)}
                            </p>
                          </div>
                          {!notification.is_read && (
                            <div className="w-2 h-2 bg-blue-400 rounded-full flex-shrink-0 mt-1"></div>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-8">
                      <Clock className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                      <p className="text-gray-400 text-sm">
                        No recent activity
                      </p>
                      <p className="text-gray-500 text-xs mt-1">
                        Your notifications will appear here
                      </p>
                    </div>
                  )}
                </div>
                {notifications && notifications.length > 5 && (
                  <button
                    onClick={() => handlePageChange("settings")}
                    className="w-full mt-4 text-center text-cyan-400 hover:text-cyan-300 text-sm font-medium"
                  >
                    View all notifications →
                  </button>
                )}
              </div>
            </div>

            {/* Premium Banner */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative overflow-hidden bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 rounded-2xl p-8"
            >
              <div className="absolute inset-0 bg-black/20"></div>
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    <Crown className="w-8 h-8 text-yellow-300" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-2xl font-bold text-white">
                        Upgrade to Premium
                      </h3>
                      <span className="bg-yellow-400 text-black px-3 py-1 rounded-full text-xs font-bold animate-pulse">
                        NEW
                      </span>
                    </div>
                    <p className="text-gray-100 text-sm">
                      Unlock exclusive features & benefits
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-yellow-300 rounded-full"></div>
                    <span className="text-white text-sm">
                      Exclusive Tournaments
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-yellow-300 rounded-full"></div>
                    <span className="text-white text-sm">
                      AI-Powered Insights
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-yellow-300 rounded-full"></div>
                    <span className="text-white text-sm">Priority Support</span>
                  </div>
                </div>
                <button
                  onClick={() => navigate("/pricing")}
                  className="bg-white text-purple-600 px-8 py-3 rounded-xl font-bold hover:bg-gray-100 transition-all hover:scale-105 shadow-lg"
                >
                  Upgrade Now
                </button>
              </div>
            </motion.div>
          </div>
        );
      case "all-features":
        return (
          <div className="p-6">
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-white mb-2">Features</h1>
              <p className="text-gray-400 text-lg">
                Ultimate gaming experience awaits you
              </p>
              <div className="flex items-center gap-2 mt-4">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-green-400 text-sm font-medium">
                  AI Systems Online
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuresData.map((feature, index) => (
                <motion.div
                  key={feature.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gray-900/50 backdrop-blur-sm p-6 rounded-xl border border-gray-800 hover:border-gray-700 transition-all duration-300 group cursor-pointer"
                  onClick={() => {
                    dispatch(setActivePage(feature.id));
                    dispatch(setAllFeaturesOpen(false));
                    handleFeatureClick(feature.id);
                  }}
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div
                      className={`p-3 rounded-lg bg-gradient-to-r ${feature.color} group-hover:scale-110 transition-transform duration-300`}
                    >
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">
                        {feature.title}
                      </h3>
                      <p className="text-gray-400 text-sm">{feature.stats}</p>
                    </div>
                  </div>
                  <p className="text-gray-300 mb-4">{feature.description}</p>
                  <button
                    className={`w-full py-2 px-4 rounded-lg ${feature.gradient} text-white font-medium hover:opacity-90 transition-opacity`}
                  >
                    Explore {feature.title}
                  </button>
                </motion.div>
              ))}
            </div>

            {/* Premium Membership Section */}
            <div className="mt-12 bg-gradient-to-r from-purple-600 to-pink-600 p-8 rounded-2xl">
              <div className="flex items-center gap-3 mb-4">
                <Crown className="w-8 h-8 text-yellow-300" />
                <h3 className="text-2xl font-bold text-white">
                  Premium Membership
                </h3>
                <span className="bg-yellow-400 text-black px-3 py-1 rounded-full text-sm font-bold">
                  New
                </span>
              </div>
              <p className="text-gray-200 mb-6">
                Unlock all features & exclusive tournaments. Get AI insights &
                personalized recommendations. Join the elite gaming community
                today!
              </p>
              <button
                onClick={() => navigate("/pricing")}
                className="bg-white text-purple-600 px-6 py-3 rounded-lg font-bold hover:bg-gray-100 transition-colors"
              >
                Upgrade Now
              </button>
            </div>
          </div>
        );
      case "tournaments":
        return <Tournaments />;
      case "leaderboard":
        return <Leaderboard />;
      case "gamification":
        return <Gamification />;
      case "fantasy":
        return <Fantasy />;
      case "community":
        return <Community />;
      case "ai-features":
        return <AIFeatures />;
      case "profile":
        return <Profile />;
      case "settings":
        return <SettingsPage />;
      default:
        return (
          <div className="p-6">
            <h1 className="text-3xl font-bold text-white mb-6">
              Welcome to Your Dashboard
            </h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-gray-900 p-6 rounded-lg">
                <Trophy className="w-8 h-8 text-yellow-400 mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  Tournaments
                </h3>
                <p className="text-gray-400">
                  Join competitive tournaments and climb the leaderboard
                </p>
              </div>
              <div className="bg-gray-900 p-6 rounded-lg">
                <Sword className="w-8 h-8 text-blue-400 mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  Fantasy League
                </h3>
                <p className="text-gray-400">
                  Build your dream team and compete with friends
                </p>
              </div>
              <div className="bg-gray-900 p-6 rounded-lg">
                <Star className="w-8 h-8 text-purple-400 mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  Gamification
                </h3>
                <p className="text-gray-400">
                  Earn badges and unlock achievements
                </p>
              </div>
              <div className="bg-gray-900 p-6 rounded-lg">
                <MessageCircle className="w-8 h-8 text-green-400 mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  Community
                </h3>
                <p className="text-gray-400">
                  Connect with other players and share experiences
                </p>
              </div>
              <div className="bg-gray-900 p-6 rounded-lg">
                <Bot className="w-8 h-8 text-cyan-400 mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  AI Features
                </h3>
                <p className="text-gray-400">
                  Get AI-powered insights and analysis
                </p>
              </div>
              <div className="bg-gray-900 p-6 rounded-lg">
                <Trophy className="w-8 h-8 text-orange-400 mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  Leaderboard
                </h3>
                <p className="text-gray-400">
                  See how you rank against other players
                </p>
              </div>
            </div>
          </div>
        );
    }
  };

  const getPageTitle = () => {
    const pages = {
      dashboard: "Dashboard",
      tournaments: "Tournaments",
      gamification: "Gamification",
      fantasy: "Fantasy",
      community: "Community",
      "ai-features": "AI Features",
      profile: "Profile",
      settings: "Settings",
    };
    return pages[activePage] || "Dashboard";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      {/* Mobile Header */}
      <div className="lg:hidden bg-gray-900/50 backdrop-blur-lg border-b border-gray-800 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img
              src="/logo.png"
              alt="VIN Tournament"
              className="w-8 h-8 object-contain"
            />
            <h1 className="text-xl font-bold bg-gradient-to-r from-orange-400 via-yellow-400 to-orange-500 bg-clip-text text-transparent">
              VIN TOURNAMENT
            </h1>
          </div>

          <div className="flex items-center gap-2">
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => dispatch(toggleNotifications())}
                className="text-white p-2 rounded-lg hover:bg-gray-800 transition-colors relative"
              >
                <Bell className="w-6 h-6" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>
            </div>

            {/* User Menu */}
            <div className="relative">
              <button className="text-white p-2 rounded-lg hover:bg-gray-800 transition-colors">
                <User className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex min-h-screen">
        {/* Sidebar Component */}
        <Sidebar />

        {/* Main Content */}
        <div
          className={`flex-1 bg-gradient-to-br from-gray-900 via-purple-900 to-black transition-all duration-300 min-h-screen flex flex-col ${
            sidebarCollapsed ? "lg:ml-20" : "lg:ml-64"
          }`}
        >
          {/* Desktop Header */}
          <div className="hidden lg:block bg-gray-900/50 backdrop-blur-lg border-b border-gray-800 p-4 xl:p-6 flex-shrink-0">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="min-w-0 flex-1">
                <h1 className="text-xl xl:text-2xl font-bold text-white capitalize truncate">
                  {getPageTitle()}
                </h1>
                <p className="text-gray-400 text-sm xl:text-base truncate">
                  Welcome to your {getPageTitle().toLowerCase()},{" "}
                  {currentUser?.username || "User"}!
                </p>
              </div>

              <div className="flex items-center gap-4">
                {/* Notifications */}
                <div className="relative">
                  <button
                    onClick={() => dispatch(toggleNotifications())}
                    className="text-white p-3 rounded-lg hover:bg-gray-800 transition-colors relative"
                  >
                    <Bell className="w-6 h-6" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notifications Dropdown */}
                  <AnimatePresence>
                    {showNotifications && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{
                          type: "spring",
                          stiffness: 300,
                          damping: 25,
                        }}
                        className="absolute right-0 top-full mt-2 w-[calc(100vw-2rem)] sm:w-96 max-w-md bg-gray-900 border border-gray-800 rounded-lg shadow-lg z-10"
                      >
                        <div className="p-4 border-b border-gray-800 flex justify-between items-center">
                          <h3 className="text-white font-semibold">
                            Notifications
                          </h3>
                          {unreadCount > 0 && (
                            <button
                              onClick={handleMarkAllAsRead}
                              className="text-cyan-400 text-sm hover:text-cyan-300"
                            >
                              Mark all as read
                            </button>
                          )}
                        </div>
                        <div className="max-h-80 overflow-y-auto">
                          {notifications.length === 0 ? (
                            <div className="p-4 text-center text-gray-400">
                              No notifications yet
                            </div>
                          ) : (
                            notifications.map((notification) => (
                              <div
                                key={notification.id}
                                onClick={() =>
                                  handleNotificationClick(notification)
                                }
                                className={`p-4 hover:bg-gray-800 cursor-pointer border-b border-gray-800 last:border-b-0 transition-colors ${
                                  !notification.is_read ? "bg-gray-800/30" : ""
                                }`}
                              >
                                <div className="flex items-start gap-3">
                                  <div
                                    className={`w-2 h-2 rounded-full mt-2 ${
                                      !notification.is_read
                                        ? "bg-cyan-400"
                                        : "bg-gray-600"
                                    }`}
                                  />
                                  <div className="flex-1">
                                    <p className="text-white text-sm font-medium">
                                      {notification.title}
                                    </p>
                                    <p className="text-gray-300 text-sm mt-1">
                                      {notification.message}
                                    </p>
                                    <p className="text-gray-400 text-xs mt-2">
                                      {new Date(
                                        notification.created_at
                                      ).toLocaleString()}
                                    </p>
                                  </div>
                                  <div className="flex-shrink-0">
                                    {notification.type === "tournament" && (
                                      <Trophy className="w-4 h-4 text-yellow-400" />
                                    )}
                                    {notification.type === "fantasy" && (
                                      <Sword className="w-4 h-4 text-blue-400" />
                                    )}
                                    {notification.type === "community" && (
                                      <MessageCircle className="w-4 h-4 text-green-400" />
                                    )}
                                    {notification.type === "gamification" && (
                                      <Star className="w-4 h-4 text-purple-400" />
                                    )}
                                    {notification.type === "ai" && (
                                      <Bot className="w-4 h-4 text-cyan-400" />
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Quick Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigate("/")}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    <Home className="w-4 h-4" />
                    <span>Home</span>
                  </button>

                  <button
                    onClick={() => navigate("/games")}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    <Gamepad2 className="w-4 h-4" />
                    <span>Games</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Page Content - Scrollable */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-3 sm:p-4 md:p-6">{renderActivePage()}</div>
          </div>
        </div>
      </div>

      {/* All Features Dialog */}
      <AnimatePresence>
        {allFeaturesOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => dispatch(setAllFeaturesOpen(false))}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-900 rounded-2xl p-8 max-w-6xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h1 className="text-4xl font-bold text-white mb-2">
                    Features
                  </h1>
                  <p className="text-gray-400 text-lg">
                    Ultimate gaming experience awaits you
                  </p>
                  <div className="flex items-center gap-2 mt-4">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-green-400 text-sm font-medium">
                      AI Systems Online
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => dispatch(setAllFeaturesOpen(false))}
                  className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuresData.map((feature, index) => (
                  <motion.div
                    key={feature.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700 hover:border-gray-600 transition-all duration-300 group cursor-pointer"
                    onClick={() => handleFeatureClick(feature.id)}
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <div
                        className={`p-3 rounded-lg bg-gradient-to-r ${feature.color} group-hover:scale-110 transition-transform duration-300`}
                      >
                        <feature.icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">
                          {feature.title}
                        </h3>
                        <p className="text-gray-400 text-sm">{feature.stats}</p>
                      </div>
                    </div>
                    <p className="text-gray-300 mb-4">{feature.description}</p>
                    <button
                      className={`w-full py-2 px-4 rounded-lg ${feature.gradient} text-white font-medium hover:opacity-90 transition-opacity`}
                    >
                      Explore {feature.title}
                    </button>
                  </motion.div>
                ))}
              </div>

              {/* Premium Membership Section */}
              <div className="mt-12 bg-gradient-to-r from-purple-600 to-pink-600 p-8 rounded-2xl">
                <div className="flex items-center gap-3 mb-4">
                  <Crown className="w-8 h-8 text-yellow-300" />
                  <h3 className="text-2xl font-bold text-white">
                    Premium Membership
                  </h3>
                  <span className="bg-yellow-400 text-black px-3 py-1 rounded-full text-sm font-bold">
                    New
                  </span>
                </div>
                <p className="text-gray-200 mb-6">
                  Unlock all features & exclusive tournaments. Get AI insights &
                  personalized recommendations. Join the elite gaming community
                  today!
                </p>
                <button
                  onClick={() => navigate("/pricing")}
                  className="bg-white text-purple-600 px-6 py-3 rounded-lg font-bold hover:bg-gray-100 transition-colors"
                >
                  Upgrade Now
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
