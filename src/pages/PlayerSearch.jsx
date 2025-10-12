import { useState } from "react";
import { motion } from "framer-motion";
import { Search, User, Trophy, Users, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import { djangoService } from "../services/djangoService";
import ProfileCard from "../components/ProfileCard";

export default function PlayerSearch() {
  const [searchTerm, setSearchTerm] = useState("");
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showProfileCard, setShowProfileCard] = useState(false);

  const handleSearch = async (term) => {
    if (!term.trim()) {
      setPlayers([]);
      return;
    }
    
    setLoading(true);
    try {
      const results = await djangoService.request(`/api/users/search/?search=${term}`);
      setPlayers(results);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black pt-20 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-4 flex items-center justify-center gap-3">
            <Users className="w-10 h-10 text-cyan-400" />
            Find Players
          </h1>
          <p className="text-gray-400 text-lg">Search and view other players' profiles</p>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative mb-8"
        >
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search players by username or player ID..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              handleSearch(e.target.value);
            }}
            className="w-full pl-12 pr-4 py-4 bg-gray-900/50 border border-gray-800 rounded-xl text-white placeholder-gray-400 focus:border-cyan-500 focus:outline-none text-lg"
          />
        </motion.div>

        {/* Search Results */}
        {loading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500 mx-auto"></div>
            <p className="text-gray-400 mt-2">Searching players...</p>
          </div>
        )}

        {players.length > 0 && (
          <div className="space-y-4">
            {players.map((player, index) => {
              const getRoleColor = (role) => {
                const colors = {
                  admin: 'text-red-400 bg-red-500/10 border-red-500/30',
                  moderator: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
                  event_manager: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
                  vip: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
                  pro: 'text-green-400 bg-green-500/10 border-green-500/30',
                  player: 'text-gray-400 bg-gray-500/10 border-gray-500/30'
                };
                return colors[role] || colors.player;
              };

              return (
                <motion.div
                  key={player.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gray-900/50 backdrop-blur-lg border border-gray-800 rounded-xl p-6 hover:border-cyan-500/50 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-r from-cyan-400 to-pink-500 flex items-center justify-center text-xl font-bold text-white relative">
                        {player.username?.charAt(0).toUpperCase()}
                        {player.is_online && (
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-900"></div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="text-xl font-bold text-white">{player.username}</h3>
                          <span className={`px-2 py-1 text-xs rounded-full border ${getRoleColor(player.role)}`}>
                            {player.role?.replace('_', ' ').toUpperCase() || 'PLAYER'}
                          </span>
                        </div>
                        <p className="text-gray-400">ID: {player.player_id}</p>
                        <p className="text-cyan-400 text-sm">{player.preferred_games?.[0] || "Gaming Enthusiast"}</p>
                        <div className="flex gap-4 text-xs text-gray-500 mt-1">
                          <span>Tournaments: {player.tournaments_joined || 0}</span>
                          <span>Wins: {player.tournaments_won || 0}</span>
                          <span>Earnings: ₹{player.total_earnings || 0}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => {
                          setSelectedUser(player);
                          setShowProfileCard(true);
                        }}
                        className="bg-cyan-500/20 text-cyan-400 px-4 py-2 rounded-lg text-sm hover:bg-cyan-500/30 transition-colors flex items-center gap-2"
                      >
                        <Eye size={16} />
                        View Profile
                      </button>
                      <Link
                        to={`/player/${player.id}`}
                        className="bg-gray-700/50 text-gray-300 px-4 py-2 rounded-lg text-sm hover:bg-gray-600/50 transition-colors text-center"
                      >
                        Full Profile
                      </Link>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {searchTerm && !loading && players.length === 0 && (
          <div className="text-center py-12">
            <User className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">No players found for "{searchTerm}"</p>
          </div>
        )}

        {/* Profile Card Modal */}
        <ProfileCard
          user={selectedUser}
          isOpen={showProfileCard}
          onClose={() => setShowProfileCard(false)}
        />
      </div>
    </div>
  );
}