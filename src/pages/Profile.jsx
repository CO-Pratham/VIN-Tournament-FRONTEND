import { useState, useEffect } from "react";
import { motion } from "framer-motion";
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
          <p className="text-gray-400">You need to be logged in to view your profile.</p>
        </div>
      </div>
    );
  }

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
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black pt-20 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-900/50 backdrop-blur-lg border border-gray-800 rounded-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-cyan-500/20 to-pink-500/20 p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="relative w-24 h-24 rounded-full overflow-hidden group">
                {userProfile?.avatar || avatarPreview ? (
                  <img 
                    src={avatarPreview || userProfile.avatar} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-r from-cyan-500 to-pink-500 flex items-center justify-center">
                    <User size={40} className="text-white" />
                  </div>
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
              <div className="text-center sm:text-left flex-1">
                <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                  {userProfile?.username || "Gaming Player"}
                </h1>
                <p className="text-gray-400 flex items-center justify-center sm:justify-start gap-2">
                  <Mail size={16} />
                  {userProfile?.email || currentUser.email}
                </p>
                <p className="text-cyan-400 flex items-center justify-center sm:justify-start gap-2 mt-1">
                  <User size={16} />
                  ID: {userProfile?.gaming_id || 'Loading...'}
                </p>
                <div className="flex items-center justify-center sm:justify-start gap-2 mt-2">
                  <Gamepad2 size={16} className="text-cyan-400" />
                  <span className="text-cyan-400">
                    {userProfile?.preferred_games?.[0] || "No favorite game set"}
                  </span>
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
          <div className="p-6 sm:p-8">
            <h2 className="text-xl font-bold text-white mb-6">Gaming Statistics</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
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
              className="border-t border-gray-800 p-6 sm:p-8"
            >
              <h3 className="text-lg font-semibold text-white mb-6">Edit Profile</h3>
              <div className="space-y-4">
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
              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleSave}
                  className="flex-1 bg-gradient-to-r from-cyan-500 to-pink-500 hover:from-cyan-400 hover:to-pink-400 text-white font-semibold py-3 rounded-lg transition-all flex items-center justify-center gap-2"
                >
                  <Save size={18} />
                  Save Changes
                </button>
                <button
                  onClick={handleCancel}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 rounded-lg transition-all flex items-center justify-center gap-2"
                >
                  <X size={18} />
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