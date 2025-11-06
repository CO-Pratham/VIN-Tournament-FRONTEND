import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Sidebar from "../components/Sidebar";
import {
  User,
  Mail,
  Trophy,
  Target,
  Calendar,
  Edit3,
  Save,
  X,
  Gamepad2,
  Award,
  TrendingUp,
  Shield,
  AlertCircle,
  Camera,
  Crown,
  Sword,
  CheckCircle,
} from "lucide-react";
import GameBadges from "../components/GameBadges";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import toast from "react-hot-toast";

export default function Profile() {
  const { currentUser, userProfile, loading, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    favoriteGame: "",
    avatar: null,
  });
  const [avatarPreview, setAvatarPreview] = useState(null);

  useEffect(() => {
    if (userProfile) {
      setFormData({
        name: userProfile.username || "",
        email: userProfile.email || "",
        favoriteGame: userProfile.preferred_games?.[0] || "",
      });
    }
  }, [userProfile]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, avatar: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    try {
      await updateProfile({
        name: formData.name,
        favoriteGame: formData.favoriteGame,
      });
      setIsEditing(false);
    } catch (error) {
      toast.error("Failed to update profile");
    }
  };

  const handleCancel = () => {
    if (userProfile) {
      setFormData({
        name: userProfile.name || "",
        email: userProfile.email || "",
        favoriteGame: userProfile.favoriteGame || "",
      });
    }
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Please Login</h2>
          <p className="text-gray-400">
            You need to be logged in to view your profile.
          </p>
        </div>
      </div>
    );
  }

  // Plan-driven animation/video and avatar styles
  const plan = userProfile?.subscription_plan || "free"; // legend | champion | warrior | free
  const planConfig = {
    legend: {
      label: "Ultimate Legend",
      bannerVideo: "/plan/legend-banner.webm",
      avatarVideo: "/plan/legend-avatar.webm",
      ringClass:
        "from-yellow-400 via-orange-500 to-pink-500 shadow-[0_0_40px_rgba(255,200,0,0.5)]",
      shimmer: true,
    },
    champion: {
      label: "Pro Champion",
      bannerVideo: "/plan/champion-banner.webm",
      avatarVideo: "/plan/champion-avatar.webm",
      ringClass:
        "from-purple-400 via-fuchsia-500 to-pink-500 shadow-[0_0_30px_rgba(200,100,255,0.4)]",
      shimmer: false,
    },
    warrior: {
      label: "Elite Warrior",
      bannerVideo: "/plan/warrior-banner.webm",
      avatarVideo: "/plan/warrior-avatar.webm",
      ringClass:
        "from-blue-400 via-cyan-500 to-emerald-400 shadow-[0_0_24px_rgba(0,200,255,0.35)]",
      shimmer: false,
    },
    free: {
      label: "Free Warrior",
      bannerVideo: null,
      ringClass: "from-gray-600 to-gray-700",
      shimmer: false,
    },
  }[plan];

  const stats = [
    {
      label: "Level",
      value: userProfile?.level || 1,
      icon: TrendingUp,
      color: "text-cyan-400",
    },
    {
      label: "Wins",
      value: userProfile?.wins || 0,
      icon: Trophy,
      color: "text-yellow-400",
    },
    {
      label: "Losses",
      value: userProfile?.losses || 0,
      icon: Target,
      color: "text-red-400",
    },
    {
      label: "Earnings",
      value: `₹${(userProfile?.totalEarnings || 0).toLocaleString()}`,
      icon: Award,
      color: "text-green-400",
    },
  ];

  return (
    <div className="pb-6 sm:pb-12 lg:pl-72">
      <Sidebar />
      <div className="max-w-4xl mx-auto px-2 sm:px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-900/50 backdrop-blur-lg border border-gray-800 rounded-xl sm:rounded-2xl overflow-hidden"
        >
          {/* Header with plan-driven banner */}
          <div className="relative p-4 sm:p-6 md:p-8 overflow-hidden">
            {/* Video banner for paid plans only */}
            {planConfig.bannerVideo ? (
              <div className="absolute inset-0 pointer-events-none select-none">
                <video
                  key={planConfig.bannerVideo}
                  className="w-full h-full object-cover opacity-70"
                  src={planConfig.bannerVideo}
                  autoPlay
                  muted
                  playsInline
                  loop
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/40" />
              </div>
            ) : (
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/15 to-pink-500/15" />
            )}

            {/* Content */}
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0">
                {/* Animated ring based on plan (no animation for free) */}
                <div
                  className={`absolute -inset-[3px] rounded-full p-[3px] ${
                    plan === "free"
                      ? "bg-gray-700"
                      : "bg-gradient-to-r " + planConfig.ringClass
                  }`}
                >
                  <div className="w-full h-full rounded-full bg-black/70" />
                </div>

                {/* Avatar */}
                <div className="relative w-full h-full rounded-full overflow-hidden">
                  {plan !== "free" && planConfig.avatarVideo ? (
                    <video
                      key={planConfig.avatarVideo}
                      className="w-full h-full object-cover"
                      src={planConfig.avatarVideo}
                      autoPlay
                      muted
                      playsInline
                      loop
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-r from-cyan-500 to-pink-500 flex items-center justify-center">
                      <User size={40} className="text-white" />
                    </div>
                  )}
                </div>

                {/* Shimmer overlay for Legend */}
                {planConfig.shimmer && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{
                      opacity: [0, 1, 0],
                      rotate: [0, 360],
                    }}
                    transition={{
                      duration: 6,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="pointer-events-none absolute -inset-2 rounded-full bg-[conic-gradient(from_0deg,rgba(255,255,255,0.15),transparent_40%)]"
                  />
                )}

                {isEditing && (
                  <label className="absolute inset-0 bg-black/50 flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera size={20} className="text-white" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
              <div className="text-center sm:text-left flex-1 min-w-0 w-full sm:w-auto">
                <div className="flex items-center justify-center sm:justify-start gap-2 mb-2 flex-wrap">
                  <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white truncate">
                    {userProfile?.username || "Gaming Player"}
                  </h1>
                  {userProfile?.is_verified && (
                    <div className="inline-flex items-center gap-1 bg-gradient-to-r from-green-500 to-emerald-500 px-2 sm:px-3 py-1 rounded-full shadow-lg flex-shrink-0">
                      <CheckCircle
                        size={14}
                        className="text-white sm:w-4 sm:h-4"
                      />
                      <span className="text-white font-bold text-xs">
                        Verified
                      </span>
                    </div>
                  )}
                </div>
                <p className="text-gray-400 text-sm sm:text-base flex items-center justify-center sm:justify-start gap-2 truncate">
                  <Mail size={14} className="sm:w-4 sm:h-4 flex-shrink-0" />
                  <span className="truncate">
                    {userProfile?.email || currentUser.email}
                  </span>
                </p>
                <p className="text-cyan-400 text-sm sm:text-base flex items-center justify-center sm:justify-start gap-2 mt-1 truncate">
                  <User size={14} className="sm:w-4 sm:h-4 flex-shrink-0" />
                  <span className="truncate">
                    ID: {userProfile?.gaming_id || "Loading..."}
                  </span>
                </p>
                <div className="flex items-center justify-center sm:justify-start gap-2 mt-2 flex-wrap">
                  <Gamepad2
                    size={14}
                    className="text-cyan-400 sm:w-4 sm:h-4 flex-shrink-0"
                  />
                  <span className="text-cyan-400 text-sm truncate">
                    {userProfile?.preferred_games?.[0] ||
                      "No favorite game set"}
                  </span>
                </div>
                {/* Subscription Plan Badge */}
                <div className="mt-3 flex items-center gap-2 sm:gap-3 flex-wrap justify-center sm:justify-start">
                  {userProfile?.subscription_plan === "legend" ? (
                    <div className="inline-flex items-center gap-1.5 sm:gap-2 bg-gradient-to-r from-yellow-500 to-orange-500 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full shadow-lg">
                      <Crown size={14} className="text-white sm:w-4 sm:h-4" />
                      <span className="text-white font-bold text-xs sm:text-sm">
                        Ultimate Legend
                      </span>
                    </div>
                  ) : userProfile?.subscription_plan === "champion" ? (
                    <div className="inline-flex items-center gap-1.5 sm:gap-2 bg-gradient-to-r from-purple-500 to-pink-500 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full shadow-lg">
                      <Trophy size={14} className="text-white sm:w-4 sm:h-4" />
                      <span className="text-white font-bold text-xs sm:text-sm">
                        Pro Champion
                      </span>
                    </div>
                  ) : userProfile?.subscription_plan === "warrior" ? (
                    <div className="inline-flex items-center gap-1.5 sm:gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full shadow-lg">
                      <Sword size={14} className="text-white sm:w-4 sm:h-4" />
                      <span className="text-white font-bold text-xs sm:text-sm">
                        Elite Warrior
                      </span>
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-1.5 sm:gap-2 bg-gray-700 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full">
                      <Shield
                        size={14}
                        className="text-gray-400 sm:w-4 sm:h-4"
                      />
                      <span className="text-gray-300 font-medium text-xs sm:text-sm">
                        Free Warrior
                      </span>
                    </div>
                  )}
                  <Link
                    to="/pricing"
                    className="inline-flex items-center gap-1.5 sm:gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full shadow-lg transition-all hover:scale-105"
                  >
                    <Crown size={14} className="text-white sm:w-4 sm:h-4" />
                    <span className="text-white font-bold text-xs sm:text-sm">
                      Upgrade Plan
                    </span>
                  </Link>
                </div>
              </div>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="bg-gray-800 hover:bg-gray-700 text-white p-3 rounded-lg transition-colors"
              >
                <Edit3 size={20} />
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="p-4 sm:p-6 md:p-8">
            <h2 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6">
              Gaming Statistics
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 text-center"
                >
                  <stat.icon className={`${stat.color} w-8 h-8 mx-auto mb-2`} />
                  <div className="text-2xl font-bold text-white mb-1">
                    {stat.value}
                  </div>
                  <div className="text-gray-400 text-sm">{stat.label}</div>
                </motion.div>
              ))}
            </div>

            {/* Gaming Badges */}
            <GameBadges badges={userProfile?.badges} user={userProfile} />
          </div>

          {/* Edit Form */}
          {isEditing && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="border-t border-gray-800 p-4 sm:p-6 md:p-8"
            >
              <h3 className="text-base sm:text-lg font-semibold text-white mb-4 sm:mb-6">
                Edit Profile
              </h3>
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Favorite Game
                  </label>
                  <input
                    type="text"
                    name="favoriteGame"
                    value={formData.favoriteGame}
                    onChange={handleInputChange}
                    placeholder="e.g., Valorant, CS:GO, PUBG"
                    className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-4 sm:mt-6">
                <button
                  onClick={handleSave}
                  className="flex-1 bg-gradient-to-r from-cyan-500 to-pink-500 hover:from-cyan-400 hover:to-pink-400 text-white font-semibold py-2.5 sm:py-3 rounded-lg transition-all flex items-center justify-center gap-2 text-sm sm:text-base"
                >
                  <Save size={16} className="sm:w-[18px] sm:h-[18px]" />
                  Save Changes
                </button>
                <button
                  onClick={handleCancel}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2.5 sm:py-3 rounded-lg transition-all flex items-center justify-center gap-2 text-sm sm:text-base"
                >
                  <X size={16} className="sm:w-[18px] sm:h-[18px]" />
                  Cancel
                </button>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
