import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Filter,
  Search,
  Trophy,
  Calendar,
  Users,
  Target,
  Award,
  TrendingUp,
  Clock,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchTournaments,
  leaveTournament,
} from "../store/slices/tournamentSlice";
import { fetchUserTournaments } from "../store/slices/userSlice";
import TournamentCard from "../components/TournamentCard";
import toast from "react-hot-toast";

export default function Tournaments() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterGame, setFilterGame] = useState("all");
  const [activeTab, setActiveTab] = useState("all"); // "all", "organized", "joined"
  const [tournamentHistory, setTournamentHistory] = useState({
    created: 0,
    joined: 0,
    wins: 0,
    losses: 0,
  });
  const { currentUser } = useAuth();
  const dispatch = useDispatch();
  const { tournaments, loading, actionLoading } = useSelector(
    (state) => state.tournaments
  );
  const { userTournaments } = useSelector((state) => state.users);

  useEffect(() => {
    dispatch(fetchTournaments());
    if (currentUser) {
      dispatch(fetchUserTournaments(currentUser.id));
    }
  }, [dispatch, currentUser]);

  useEffect(() => {
    if (currentUser && tournaments && tournaments.length > 0) {
      fetchTournamentHistory();
    }
  }, [currentUser, tournaments]);

  const fetchTournamentHistory = async () => {
    if (!currentUser?.id || !Array.isArray(tournaments)) return;

    const created = tournaments.filter(
      (t) =>
        t.created_by?.id === currentUser.id || t.created_by === currentUser.id
    ).length;

    setTournamentHistory({
      created,
      joined: 0,
      wins: 0,
      losses: 0,
    });
  };

  const handleJoinTournament = (tournamentId) => {
    dispatch(fetchTournaments());
    if (currentUser) {
      dispatch(fetchUserTournaments(currentUser.id));
      fetchTournamentHistory();
    }
  };

  const handleLeaveTournament = async (tournamentId) => {
    if (!confirm("Are you sure you want to leave this tournament?")) return;
    dispatch(leaveTournament(tournamentId));
    if (currentUser) {
      dispatch(fetchUserTournaments(currentUser.id));
    }
  };

  const getDisplayTournaments = () => {
    switch (activeTab) {
      case "organized":
        return userTournaments.organized || [];
      case "joined":
        return userTournaments.joined || [];
      default:
        return tournaments || [];
    }
  };

  const displayTournaments = getDisplayTournaments();

  const filteredTournaments = Array.isArray(displayTournaments)
    ? displayTournaments.filter((tournament) => {
        if (!tournament || !tournament.title || !tournament.game) return false;

        const matchesSearch =
          tournament.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          tournament.game.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus =
          filterStatus === "all" || tournament.status === filterStatus;
        const matchesGame =
          filterGame === "all" || tournament.game === filterGame;

        return matchesSearch && matchesStatus && matchesGame;
      })
    : [];

  const uniqueGames = Array.isArray(tournaments)
    ? [...new Set(tournaments.map((t) => t.game))]
    : [];

  const stats = [
    {
      label: "Total Tournaments",
      value: Array.isArray(tournaments) ? tournaments.length : 0,
      icon: Trophy,
      color: "text-yellow-400",
    },
    {
      label: "Active Tournaments",
      value: Array.isArray(tournaments)
        ? tournaments.filter(
            (t) => t.status === "upcoming" || t.status === "live"
          ).length
        : 0,
      icon: Calendar,
      color: "text-green-400",
    },
    {
      label: "Total Participants",
      value: Array.isArray(tournaments)
        ? tournaments.reduce((sum, t) => sum + (t.participants?.length || 0), 0)
        : 0,
      icon: Users,
      color: "text-cyan-400",
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
          <span className="ml-3 text-gray-400">Loading tournaments...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Modern Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden bg-gradient-to-r from-cyan-900/30 via-blue-900/30 to-purple-900/30 rounded-2xl p-8 border border-cyan-500/20"
        >
          <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
                  🏆 Gaming Tournaments
                </h1>
                <p className="text-gray-300 text-lg">
                  Join competitive tournaments and showcase your skills
                </p>
              </div>
              {currentUser && (
                <Link
                  to="/create-tournament"
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 rounded-xl font-semibold text-white transition-all hover:scale-105 shadow-lg"
                >
                  <Plus className="w-5 h-5" />
                  Create Tournament
                </Link>
              )}
            </div>
          </div>
        </motion.div>

        {/* Enhanced Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group relative bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-sm border border-gray-700/50 hover:border-cyan-500/50 rounded-xl p-6 transition-all hover:scale-105"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-gray-800/80 rounded-lg group-hover:bg-cyan-500/20 transition-colors">
                    <stat.icon className={`${stat.color} w-6 h-6`} />
                  </div>
                  <TrendingUp className="w-5 h-5 text-green-400" />
                </div>
                <div className="text-3xl font-bold text-white mb-1">
                  {stat.value}
                </div>
                <div className="text-gray-400 text-sm">{stat.label}</div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Tournament History - Only show for logged in users */}
        {currentUser && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/30 rounded-xl p-6"
          >
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-cyan-400" />
              Your Tournament History
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gray-900/50 rounded-lg p-4 text-center">
                <Trophy className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">
                  {tournamentHistory.created}
                </div>
                <div className="text-sm text-gray-400">Created</div>
              </div>
              <div className="bg-gray-900/50 rounded-lg p-4 text-center">
                <Users className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">
                  {tournamentHistory.joined}
                </div>
                <div className="text-sm text-gray-400">Joined</div>
              </div>
              <div className="bg-gray-900/50 rounded-lg p-4 text-center">
                <Award className="w-6 h-6 text-green-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">
                  {tournamentHistory.wins}
                </div>
                <div className="text-sm text-gray-400">Wins</div>
              </div>
              <div className="bg-gray-900/50 rounded-lg p-4 text-center">
                <Target className="w-6 h-6 text-red-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">
                  {tournamentHistory.losses}
                </div>
                <div className="text-sm text-gray-400">Losses</div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Tabs - All, Organized, Joined Tournaments */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex gap-2 sm:gap-4 border-b border-gray-800 overflow-x-auto">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-4 sm:px-6 py-3 font-semibold transition-all relative whitespace-nowrap ${
                activeTab === "all"
                  ? "text-cyan-400"
                  : "text-gray-400 hover:text-gray-300"
              }`}
            >
              All Tournaments
              {activeTab === "all" && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-500 to-pink-500"
                />
              )}
            </button>
            {currentUser && (
              <>
                <button
                  onClick={() => setActiveTab("organized")}
                  className={`px-4 sm:px-6 py-3 font-semibold transition-all relative whitespace-nowrap ${
                    activeTab === "organized"
                      ? "text-cyan-400"
                      : "text-gray-400 hover:text-gray-300"
                  }`}
                >
                  My Organized ({userTournaments.organized?.length || 0})
                  {activeTab === "organized" && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-500 to-pink-500"
                    />
                  )}
                </button>
                <button
                  onClick={() => setActiveTab("joined")}
                  className={`px-4 sm:px-6 py-3 font-semibold transition-all relative whitespace-nowrap ${
                    activeTab === "joined"
                      ? "text-cyan-400"
                      : "text-gray-400 hover:text-gray-300"
                  }`}
                >
                  Joined ({userTournaments.joined?.length || 0})
                  {activeTab === "joined" && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-500 to-pink-500"
                    />
                  )}
                </button>
              </>
            )}
          </div>
        </motion.div>

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-900/50 backdrop-blur-lg border border-gray-800 rounded-xl p-6"
        >
          <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
            {/* Search - Full width on mobile */}
            <div className="relative flex-1 lg:max-w-md">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Search tournaments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 sm:py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all text-sm sm:text-base"
              />
            </div>

            {/* Filters - Responsive */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full lg:w-auto">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 sm:px-4 py-2.5 sm:py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all text-sm sm:text-base"
              >
                <option key="all-status" value="all">
                  All Status
                </option>
                <option key="upcoming" value="upcoming">
                  Upcoming
                </option>
                <option key="live" value="live">
                  Live
                </option>
                <option key="completed" value="completed">
                  Completed
                </option>
              </select>

              <select
                value={filterGame}
                onChange={(e) => setFilterGame(e.target.value)}
                className="px-3 sm:px-4 py-2.5 sm:py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all text-sm sm:text-base"
              >
                <option key="all-games" value="all">
                  All Games
                </option>
                {uniqueGames.map((game) => (
                  <option key={game} value={game}>
                    {game}
                  </option>
                ))}
              </select>
            </div>

            {/* Create Tournament Button - Responsive */}
            {currentUser && (
              <Link
                to="/create-tournament"
                className="w-full sm:w-auto lg:w-auto"
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-pink-500 hover:from-cyan-400 hover:to-pink-400 text-white font-semibold px-4 sm:px-6 py-2.5 sm:py-2 rounded-lg transition-all text-sm sm:text-base"
                >
                  <Plus size={18} className="sm:w-5 sm:h-5" />
                  <span className="hidden xs:inline">Create Tournament</span>
                  <span className="xs:hidden">Create</span>
                </motion.button>
              </Link>
            )}
          </div>
        </motion.div>

        {/* Tournaments Grid */}
        <AnimatePresence>
          {filteredTournaments.length > 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8"
            >
              {filteredTournaments.map((tournament, index) => (
                <motion.div
                  key={tournament.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <TournamentCard
                    tournament={tournament}
                    onJoin={handleJoinTournament}
                    onLeave={
                      activeTab === "joined" ? handleLeaveTournament : null
                    }
                    showActions={activeTab === "organized"}
                  />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <Trophy className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-400 mb-2">
                No tournaments found
              </h3>
              <p className="text-gray-500 mb-6">
                {searchTerm || filterStatus !== "all" || filterGame !== "all"
                  ? "Try adjusting your search or filters"
                  : "Be the first to create a tournament!"}
              </p>
              {currentUser && (
                <Link to="/create-tournament">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-gradient-to-r from-cyan-500 to-pink-500 hover:from-cyan-400 hover:to-pink-400 text-white font-semibold px-6 py-3 rounded-lg transition-all"
                  >
                    Create Your First Tournament
                  </motion.button>
                </Link>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
