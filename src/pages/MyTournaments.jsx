import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Trophy, Plus, Users, Calendar, Edit, Trash2, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserTournaments } from "../store/slices/userSlice";
import { leaveTournament } from "../store/slices/tournamentSlice";
import toast from "react-hot-toast";

export default function MyTournaments() {
  const { currentUser } = useAuth();
  const dispatch = useDispatch();
  const { userTournaments, loading } = useSelector(state => state.users);
  const [activeTab, setActiveTab] = useState("organized");

  useEffect(() => {
    if (currentUser) {
      dispatch(fetchUserTournaments(currentUser.id));
    }
  }, [dispatch, currentUser]);

  const tournaments = activeTab === "organized" ? userTournaments.organized : userTournaments.joined;

  const handleLeaveTournament = async (tournamentId) => {
    if (!confirm("Are you sure you want to leave this tournament?")) return;
    dispatch(leaveTournament(tournamentId));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'upcoming': return 'text-blue-400 bg-blue-400/10';
      case 'live': return 'text-green-400 bg-green-400/10';
      case 'completed': return 'text-gray-400 bg-gray-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black pt-20 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Please Login</h2>
          <Link to="/login" className="text-cyan-400 hover:text-cyan-300">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black pt-20 pb-12 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Trophy className="w-8 h-8 text-cyan-400" />
            My Tournaments
          </h1>
          <Link
            to="/create-tournament"
            className="bg-gradient-to-r from-cyan-500 to-pink-500 text-white px-6 py-3 rounded-lg font-bold hover:from-cyan-600 hover:to-pink-600 transition-all flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Create Tournament
          </Link>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setActiveTab("organized")}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === "organized"
                ? "bg-cyan-500 text-white"
                : "bg-gray-800/50 text-gray-400 hover:text-white"
            }`}
          >
            Organized by Me
          </button>
          <button
            onClick={() => setActiveTab("joined")}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === "joined"
                ? "bg-cyan-500 text-white"
                : "bg-gray-800/50 text-gray-400 hover:text-white"
            }`}
          >
            Joined Tournaments
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="text-white text-xl">Loading tournaments...</div>
          </div>
        ) : tournaments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tournaments.map((tournament, index) => (
              <motion.div
                key={tournament.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-900/50 backdrop-blur-lg border border-gray-800 rounded-xl overflow-hidden hover:border-cyan-500/50 transition-all"
              >
                <div className="relative h-48">
                  <img
                    src={tournament.banner_url || `https://via.placeholder.com/400x200?text=${encodeURIComponent(tournament.title)}`}
                    alt={tournament.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                  <div className="absolute top-4 left-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(tournament.status)}`}>
                      {tournament.status?.charAt(0).toUpperCase() + tournament.status?.slice(1)}
                    </span>
                  </div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-xl font-bold text-white mb-1">{tournament.title}</h3>
                    <p className="text-gray-300 text-sm">{tournament.game}</p>
                  </div>
                </div>

                <div className="p-6">
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Participants</span>
                      <span className="text-white">{tournament.current_participants}/{tournament.max_participants}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Prize Pool</span>
                      <span className="text-yellow-400 font-medium">₹{tournament.prize_pool}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Start Date</span>
                      <span className="text-white">{new Date(tournament.start_date).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Link
                      to={`/tournament/${tournament.id}`}
                      className="flex-1 bg-gray-800/50 hover:bg-gray-700/50 text-white py-2 px-3 rounded-lg text-center transition-colors flex items-center justify-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </Link>
                    
                    {activeTab === "organized" && (
                      <>
                        <button className="bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 py-2 px-3 rounded-lg transition-colors">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleLeaveTournament(tournament.id)}
                          className="bg-red-600/20 hover:bg-red-600/30 text-red-400 py-2 px-3 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Trophy className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">
              {activeTab === "organized" ? "No tournaments organized yet" : "No tournaments joined yet"}
            </h3>
            <p className="text-gray-400 mb-6">
              {activeTab === "organized" 
                ? "Create your first tournament to get started" 
                : "Join some tournaments to see them here"
              }
            </p>
            {activeTab === "organized" && (
              <Link
                to="/create-tournament"
                className="bg-gradient-to-r from-cyan-500 to-pink-500 text-white px-6 py-3 rounded-lg font-bold hover:from-cyan-600 hover:to-pink-600 transition-all inline-flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Create Tournament
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}