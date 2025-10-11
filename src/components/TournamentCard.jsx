import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Users,
  Trophy,
  Clock,
  MapPin,
  Star,
  Eye,
  UserPlus,
  User,
  X,
  Trash2,
  Edit,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useDispatch, useSelector } from "react-redux";
import { joinTournament } from "../store/slices/tournamentSlice";
import toast from "react-hot-toast";

export default function TournamentCard({ tournament, onJoin, onDelete, showActions }) {
  const [isHovered, setIsHovered] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [registrationData, setRegistrationData] = useState({
    playerName: "",
    gameId: "",
    whatsappNo: "",
  });
  const { currentUser, userProfile } = useAuth();
  const dispatch = useDispatch();
  const { actionLoading } = useSelector(state => state.tournaments);

  // Initialize form with user data
  useEffect(() => {
    if (currentUser) {
      setRegistrationData({
        playerName: userProfile?.name || currentUser.displayName || "",
        gameId: userProfile?.gameId || "",
        whatsappNo: userProfile?.whatsappNo || "",
      });
    }
  }, [currentUser, userProfile]);

  const handleJoinClick = (e) => {
    e.stopPropagation();

    if (!currentUser) {
      toast.error("Please login to join tournaments");
      return;
    }

    // Navigate to tournament detail page
    window.location.href = `/tournament/${tournament.id}`;
  };

  const handleRegistrationSubmit = async (e) => {
    e.preventDefault();

    if (!registrationData.playerName.trim()) {
      toast.error("Please enter your name");
      return;
    }
    if (!registrationData.gameId.trim()) {
      toast.error("Please enter your game ID");
      return;
    }
    if (!registrationData.whatsappNo.trim()) {
      toast.error("Please enter your WhatsApp number");
      return;
    }

    const result = await dispatch(joinTournament(tournament.id));
    
    if (result.type.endsWith('fulfilled')) {
      setShowRegistrationForm(false);
      if (onJoin) onJoin(tournament.id);
    }
  };

  const handleLeaveTournament = async (e) => {
    e.stopPropagation();

    if (!currentUser) {
      toast.error("Please login first");
      return;
    }

    const result = await dispatch(leaveTournament(tournament.id));
    
    if (result.type.endsWith('fulfilled') && onJoin) {
      onJoin(tournament.id);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "upcoming":
        return "text-green-400 bg-green-400/20";
      case "live":
        return "text-red-400 bg-red-400/20";
      case "completed":
        return "text-gray-400 bg-gray-400/20";
      default:
        return "text-blue-400 bg-blue-400/20";
    }
  };

  const formatDate = (date) => {
    if (!date) return "TBD";

    try {
      if (date.seconds) {
        return new Date(date.seconds * 1000).toLocaleDateString();
      }
      return new Date(date).toLocaleDateString();
    } catch (error) {
      console.error("Error formatting date:", error);
      return "TBD";
    }
  };

  const isUserJoined = false; // Simplified for now

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01, y: -2 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl overflow-hidden shadow-2xl border border-gray-700/50 hover:border-gray-600/50 transition-colors duration-300"
    >
      {/* Tournament Image */}
      <div
        className="relative h-40 sm:h-48 overflow-hidden cursor-pointer"
        onClick={(e) => {
          e.stopPropagation();
          window.location.href = `/tournament/${tournament.id}`;
        }}
      >
        <motion.img
          src={
            tournament.banner_url ||
            `https://via.placeholder.com/400x200?text=${encodeURIComponent(
              tournament.title
            )}`
          }
          alt={tournament.title}
          className="w-full h-full object-cover"
          animate={{ scale: isHovered ? 1.02 : 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Status Badge */}
        <div
          className={`absolute top-2 sm:top-4 left-2 sm:left-4 px-2 sm:px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
            tournament.status
          )}`}
        >
          {tournament.status?.toUpperCase() || "UPCOMING"}
        </div>

        {/* Prize Pool */}
        <div className="absolute top-2 sm:top-4 right-2 sm:right-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-black px-2 sm:px-3 py-1 rounded-full text-xs font-bold">
          ₹{tournament.prize?.toLocaleString() || "0"}
        </div>

        {/* Hover Overlay */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 flex items-center justify-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="flex gap-2"
              >

                {!isUserJoined && !actionLoading && !showActions && (
                  <button
                    onClick={handleJoinClick}
                    className="bg-gradient-to-r from-cyan-500 to-pink-500 text-white p-2 rounded-full hover:from-cyan-400 hover:to-pink-400 transition-all"
                  >
                    <UserPlus size={20} />
                  </button>
                )}
                {showActions && (
                  <div className="flex gap-2">
                    <button className="bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 p-2 rounded-full transition-all">
                      <Eye size={20} />
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete?.(tournament.id);
                      }}
                      className="bg-red-600/20 hover:bg-red-600/30 text-red-400 p-2 rounded-full transition-all"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-6">
        <div
          className="flex items-start justify-between mb-3 cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            setShowDetails(true);
          }}
        >
          <h3 className="text-lg sm:text-xl font-bold text-white line-clamp-2 flex-1 pr-2">
            {tournament.title}
          </h3>
          <div className="flex items-center text-yellow-400 ml-2 flex-shrink-0">
            <Star size={14} className="sm:w-4 sm:h-4" fill="currentColor" />
            <span className="text-xs sm:text-sm ml-1">4.8</span>
          </div>
        </div>

        <div className="space-y-2 text-xs sm:text-sm text-gray-400">
          <div className="flex items-center gap-2">
            <MapPin size={14} className="sm:w-4 sm:h-4 flex-shrink-0" />
            <span className="truncate">
              {tournament.game} • {tournament.mode || tournament.format || 'Solo'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Calendar size={14} className="sm:w-4 sm:h-4 flex-shrink-0" />
            <span className="truncate">{formatDate(tournament.date)}</span>
          </div>

          <div className="flex items-center gap-2">
            <Users size={14} className="sm:w-4 sm:h-4 flex-shrink-0" />
            <span>{tournament.participants?.length || 0} participants</span>
          </div>

          <div className="flex items-center gap-2">
            <Clock size={14} className="sm:w-4 sm:h-4 flex-shrink-0" />
            <span>Registration open</span>
          </div>

          {tournament.creatorName && (
            <div className="flex items-center gap-2">
              <User size={14} className="sm:w-4 sm:h-4 flex-shrink-0" />
              <span className="truncate">
                Created by {tournament.creatorName}
              </span>
            </div>
          )}
        </div>

        {/* Action Button */}
        <div
          className="mt-4 pt-4 border-t border-gray-700"
          onClick={(e) => e.stopPropagation()}
        >
          {isUserJoined ? (
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2 text-green-400 font-semibold">
                <Trophy size={16} />
                Joined
              </div>
              {(tournament.status === "upcoming" || !tournament.status) && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleLeaveTournament}
                  disabled={actionLoading}
                  className="w-full bg-red-600 hover:bg-red-500 text-white font-semibold py-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {actionLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Processing...
                    </div>
                  ) : (
                    "Leave Tournament"
                  )}
                </motion.button>
              )}
            </div>
          ) : (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleJoinClick}
              disabled={actionLoading}
              className="w-full bg-gradient-to-r from-cyan-500 to-pink-500 hover:from-cyan-400 hover:to-pink-400 text-white font-semibold py-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {actionLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Processing...
                </div>
              ) : (
                "Join Tournament"
              )}
            </motion.button>
          )}
        </div>
      </div>




    </motion.div>
  );
}