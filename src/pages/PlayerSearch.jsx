import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, User, Trophy, Users, Eye, Grid, List, Filter, Star, Target, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../contexts/AuthContext";

export default function PlayerSearch() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [showPlayerDetail, setShowPlayerDetail] = useState(false);
  const [viewType, setViewType] = useState('card'); // 'card' or 'full'
  const [filters, setFilters] = useState({
    game_type: '',
    position: '',
    team: ''
  });
  const [allPlayers, setAllPlayers] = useState([]);

  // Load all players on component mount
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      loadAllPlayers();
    }
  }, [isAuthenticated, authLoading]);

  const loadAllPlayers = async () => {
    try {
      const response = await api.getAllPlayers();
      setAllPlayers(response.results || response || []);
    } catch (error) {
      console.error("Error loading players:", error);
    }
  };

  const handleSearch = async (term, searchFilters = filters) => {
    if (!term.trim() && !Object.values(searchFilters).some(f => f.trim())) {
      setPlayers([]);
      return;
    }
    
    setLoading(true);
    try {
      const searchParams = {
        search: term,
        view_type: viewType,
        ...searchFilters
      };
      
      const response = await api.searchPlayers(searchParams);
      setPlayers(response.data?.players || response.results || response || []);
    } catch (error) {
      console.error("Search error:", error);
      setPlayers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (filterType, value) => {
    const newFilters = { ...filters, [filterType]: value };
    setFilters(newFilters);
    handleSearch(searchTerm, newFilters);
  };

  const clearFilters = () => {
    setFilters({ game_type: '', position: '', team: '' });
    setSearchTerm('');
    setPlayers([]);
  };

  const getPositionColor = (position) => {
    const colors = {
      'QB': 'text-blue-400 bg-blue-500/10 border-blue-500/30',
      'RB': 'text-green-400 bg-green-500/10 border-green-500/30',
      'WR': 'text-purple-400 bg-purple-500/10 border-purple-500/30',
      'TE': 'text-orange-400 bg-orange-500/10 border-orange-500/30',
      'K': 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
      'DEF': 'text-red-400 bg-red-500/10 border-red-500/30',
      'default': 'text-gray-400 bg-gray-500/10 border-gray-500/30'
    };
    return colors[position] || colors.default;
  };

  const getValueColor = (value) => {
    if (value >= 90) return 'text-green-400';
    if (value >= 80) return 'text-blue-400';
    if (value >= 70) return 'text-yellow-400';
    if (value >= 60) return 'text-orange-400';
    return 'text-red-400';
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black pt-20 pb-12 px-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto"></div>
          <p className="text-gray-400 mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black pt-20 pb-12 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-4 flex items-center justify-center gap-3">
            <Users className="w-10 h-10 text-cyan-400" />
            Fantasy Player Search
          </h1>
          <p className="text-gray-400 text-lg">Search and discover fantasy players with sequential IDs</p>
        </motion.div>

        {/* Search and Filter Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-900/50 backdrop-blur-lg border border-gray-800 rounded-xl p-6 mb-8"
        >
          {/* Search Bar */}
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by name, player ID, position, or team..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                handleSearch(e.target.value);
              }}
              className="w-full pl-12 pr-4 py-4 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:border-cyan-500 focus:outline-none text-lg"
            />
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Game Type</label>
              <select
                value={filters.game_type}
                onChange={(e) => handleFilterChange('game_type', e.target.value)}
                className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
              >
                <option value="">All Games</option>
                <option value="NFL">NFL</option>
                <option value="NBA">NBA</option>
                <option value="MLB">MLB</option>
                <option value="NHL">NHL</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Position</label>
              <select
                value={filters.position}
                onChange={(e) => handleFilterChange('position', e.target.value)}
                className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
              >
                <option value="">All Positions</option>
                <option value="QB">Quarterback</option>
                <option value="RB">Running Back</option>
                <option value="WR">Wide Receiver</option>
                <option value="TE">Tight End</option>
                <option value="K">Kicker</option>
                <option value="DEF">Defense</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Team</label>
              <input
                type="text"
                placeholder="Team name..."
                value={filters.team}
                onChange={(e) => handleFilterChange('team', e.target.value)}
                className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <div className="flex items-end gap-2">
              <button
                onClick={clearFilters}
                className="px-4 py-2 bg-gray-700/50 text-gray-300 rounded-lg hover:bg-gray-600/50 transition-colors"
              >
                Clear
              </button>
            </div>
          </div>

          {/* View Type Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-gray-400 text-sm">View:</span>
              <button
                onClick={() => setViewType('card')}
                className={`p-2 rounded-lg transition-colors ${
                  viewType === 'card' 
                    ? 'bg-cyan-500/20 text-cyan-400' 
                    : 'bg-gray-700/50 text-gray-400 hover:bg-gray-600/50'
                }`}
              >
                <Grid size={16} />
              </button>
              <button
                onClick={() => setViewType('full')}
                className={`p-2 rounded-lg transition-colors ${
                  viewType === 'full' 
                    ? 'bg-cyan-500/20 text-cyan-400' 
                    : 'bg-gray-700/50 text-gray-400 hover:bg-gray-600/50'
                }`}
              >
                <List size={16} />
              </button>
            </div>
            <div className="text-sm text-gray-400">
              {players.length > 0 && `Found ${players.length} players`}
            </div>
          </div>
        </motion.div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500 mx-auto"></div>
            <p className="text-gray-400 mt-2">Searching players...</p>
          </div>
        )}

        {/* Search Results */}
        {players.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={viewType === 'card' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}
          >
            {players.map((player, index) => (
              <motion.div
                key={player.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`bg-gray-900/50 backdrop-blur-lg border border-gray-800 rounded-xl hover:border-cyan-500/50 transition-all ${
                  viewType === 'card' ? 'p-6' : 'p-4'
                }`}
              >
                {viewType === 'card' ? (
                  // Card View
                  <div className="text-center">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-r from-cyan-400 to-pink-500 flex items-center justify-center text-2xl font-bold text-white mx-auto mb-4">
                      {player.name?.charAt(0).toUpperCase()}
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">{player.name}</h3>
                    <p className="text-cyan-400 text-sm mb-2">ID: {player.player_id}</p>
                    <div className="flex items-center justify-center gap-2 mb-3">
                      <span className={`px-2 py-1 text-xs rounded-full border ${getPositionColor(player.position)}`}>
                        {player.position || 'N/A'}
                      </span>
                      <span className="text-gray-400 text-sm">{player.team || 'Free Agent'}</span>
                    </div>
                    <div className="flex items-center justify-center gap-2 mb-4">
                      <Star className="w-4 h-4 text-yellow-400" />
                      <span className={`text-lg font-bold ${getValueColor(player.value)}`}>
                        {player.value}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedPlayer(player);
                          setShowPlayerDetail(true);
                        }}
                        className="flex-1 bg-cyan-500/20 text-cyan-400 px-3 py-2 rounded-lg text-sm hover:bg-cyan-500/30 transition-colors flex items-center justify-center gap-2"
                      >
                        <Eye size={14} />
                        Preview
                      </button>
                      <Link
                        to={`/player/${player.player_id}`}
                        className="flex-1 bg-gray-700/50 text-gray-300 px-3 py-2 rounded-lg text-sm hover:bg-gray-600/50 transition-colors text-center"
                      >
                        Full View
                      </Link>
                    </div>
                  </div>
                ) : (
                  // Full View
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-r from-cyan-400 to-pink-500 flex items-center justify-center text-xl font-bold text-white">
                        {player.name?.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="text-xl font-bold text-white">{player.name}</h3>
                          <span className={`px-2 py-1 text-xs rounded-full border ${getPositionColor(player.position)}`}>
                            {player.position || 'N/A'}
                          </span>
                          <span className="text-gray-400 text-sm">{player.team || 'Free Agent'}</span>
                        </div>
                        <p className="text-cyan-400 text-sm mb-1">ID: {player.player_id}</p>
                        <div className="flex gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-yellow-400" />
                            Value: <span className={getValueColor(player.value)}>{player.value}</span>
                          </span>
                          <span className="flex items-center gap-1">
                            <Target className="w-3 h-3 text-blue-400" />
                            {player.game_type}
                          </span>
                          <span className="flex items-center gap-1">
                            <Zap className="w-3 h-3 text-green-400" />
                            Active
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => {
                          setSelectedPlayer(player);
                          setShowPlayerDetail(true);
                        }}
                        className="bg-cyan-500/20 text-cyan-400 px-4 py-2 rounded-lg text-sm hover:bg-cyan-500/30 transition-colors flex items-center gap-2"
                      >
                        <Eye size={16} />
                        Preview
                      </button>
                      <Link
                        to={`/player/${player.player_id}`}
                        className="bg-gray-700/50 text-gray-300 px-4 py-2 rounded-lg text-sm hover:bg-gray-600/50 transition-colors text-center"
                      >
                        Full View
                      </Link>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* No Results */}
        {searchTerm && !loading && players.length === 0 && (
          <div className="text-center py-12">
            <User className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">No players found for "{searchTerm}"</p>
            <p className="text-gray-500 text-sm mt-2">Try adjusting your search terms or filters</p>
          </div>
        )}

        {/* Player Detail Modal */}
        {showPlayerDetail && selectedPlayer && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gray-900 border border-gray-800 rounded-xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto"
            >
              <div className="text-center mb-6">
                <div className="w-24 h-24 rounded-full bg-gradient-to-r from-cyan-400 to-pink-500 flex items-center justify-center text-3xl font-bold text-white mx-auto mb-4">
                  {selectedPlayer.name?.charAt(0).toUpperCase()}
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">{selectedPlayer.name}</h3>
                <p className="text-cyan-400 text-lg mb-4">ID: {selectedPlayer.player_id}</p>
                <div className="flex items-center justify-center gap-2 mb-4">
                  <span className={`px-3 py-1 text-sm rounded-full border ${getPositionColor(selectedPlayer.position)}`}>
                    {selectedPlayer.position || 'N/A'}
                  </span>
                  <span className="text-gray-400">{selectedPlayer.team || 'Free Agent'}</span>
                </div>
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Star className="w-5 h-5 text-yellow-400" />
                  <span className={`text-2xl font-bold ${getValueColor(selectedPlayer.value)}`}>
                    {selectedPlayer.value}
                  </span>
                </div>
              </div>
              
              <div className="space-y-4 mb-6">
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <h4 className="text-white font-semibold mb-2">Player Stats</h4>
                  <div className="text-sm text-gray-400">
                    {selectedPlayer.stats && Object.keys(selectedPlayer.stats).length > 0 ? (
                      Object.entries(selectedPlayer.stats).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="capitalize">{key.replace('_', ' ')}:</span>
                          <span className="text-white">{value}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500">No stats available</p>
                    )}
                  </div>
                </div>
                
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <h4 className="text-white font-semibold mb-2">Game Information</h4>
                  <div className="text-sm text-gray-400 space-y-1">
                    <div className="flex justify-between">
                      <span>Game Type:</span>
                      <span className="text-white">{selectedPlayer.game_type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Status:</span>
                      <span className="text-green-400">Active</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Link
                  to={`/player/${selectedPlayer.player_id}`}
                  className="flex-1 bg-cyan-500 text-white px-4 py-2 rounded-lg text-center hover:bg-cyan-600 transition-colors"
                >
                  View Full Profile
                </Link>
                <button
                  onClick={() => setShowPlayerDetail(false)}
                  className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}