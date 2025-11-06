import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Sword,
  Users,
  Trophy,
  DollarSign,
  Star,
  Crown,
  Shield,
  Target,
  Plus,
  Search,
} from "lucide-react";
import api from "../services/api";
import { useAuth } from "../contexts/AuthContext";

export default function Fantasy() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("my-teams");
  const [myTeams, setMyTeams] = useState([]);
  const [availableLeagues, setAvailableLeagues] = useState([]);
  const [availablePlayers, setAvailablePlayers] = useState([]);
  const [leaderboards, setLeaderboards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTournament, setSelectedTournament] = useState(null);
  const [showCreateTeamModal, setShowCreateTeamModal] = useState(false);
  const [newTeamData, setNewTeamData] = useState({
    team_name: "",
    league: "",
  });

  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      fetchFantasyData();
    } else if (!authLoading && !isAuthenticated) {
      setLoading(false);
      setError("Please log in to view fantasy data");
    }
  }, [isAuthenticated, authLoading]);

  const fetchFantasyData = async () => {
    try {
      setLoading(true);
      const [teamsRes, leaguesRes] = await Promise.all([
        api.getMyFantasyTeams(),
        api.getFantasyLeagues(),
      ]);

      setMyTeams(teamsRes.data?.teams || teamsRes.results || teamsRes || []);
      setAvailableLeagues(
        leaguesRes.data?.leagues || leaguesRes.results || leaguesRes || []
      );
    } catch (error) {
      console.error("Error fetching fantasy data:", error);
      setError("Failed to load fantasy data");
    } finally {
      setLoading(false);
    }
  };

  const fetchPlayersForTournament = async (tournamentId) => {
    try {
      const playersRes = await api.getFantasyPlayers(tournamentId);
      setAvailablePlayers(playersRes.results || playersRes);
    } catch (error) {
      console.error("Error fetching players:", error);
      setError("Failed to load players");
    }
  };

  const handleCreateTeam = async (teamData) => {
    try {
      if (!newTeamData.team_name || !newTeamData.league) {
        setError("Please provide team name and select a league");
        return;
      }

      const newTeam = await api.createFantasyTeam(newTeamData);
      setMyTeams([newTeam, ...myTeams]);
      setShowCreateTeamModal(false);
      setNewTeamData({ team_name: "", league: "" });
      setError(null);
    } catch (error) {
      console.error("Error creating team:", error);
      setError(error.message || "Failed to create team");
    }
  };

  const handleJoinLeague = async (leagueId) => {
    try {
      await api.joinFantasyLeague(leagueId);
      fetchFantasyData(); // Refresh data
    } catch (error) {
      console.error("Error joining league:", error);
      setError("Failed to join league");
    }
  };

  const getFormColor = (form) => {
    switch (form) {
      case "excellent":
        return "text-green-400 bg-green-400/20";
      case "good":
        return "text-blue-400 bg-blue-400/20";
      case "average":
        return "text-yellow-400 bg-yellow-400/20";
      default:
        return "text-gray-400 bg-gray-400/20";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Modern Hero Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden bg-gradient-to-r from-purple-900/30 via-pink-900/30 to-red-900/30 rounded-2xl p-8 border border-purple-500/20"
        >
          <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 bg-clip-text text-transparent mb-2">
                  ⚔️ Fantasy League
                </h1>
                <p className="text-gray-300 text-lg">
                  Build your dream team and dominate the league!
                </p>
              </div>
              <button
                onClick={() => setShowCreateTeamModal(true)}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 rounded-xl font-semibold text-white transition-all hover:scale-105 shadow-lg"
              >
                <Plus className="w-5 h-5" />
                Create Team
              </button>
            </div>
          </div>
        </motion.div>

        {/* Enhanced Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="group relative bg-gradient-to-br from-purple-900/20 to-pink-900/20 backdrop-blur-sm border border-purple-500/30 hover:border-purple-500/60 rounded-xl p-6 transition-all hover:scale-105"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-500/20 rounded-lg group-hover:scale-110 transition-transform">
                  <Users className="w-6 h-6 text-purple-400" />
                </div>
                <Sword className="w-5 h-5 text-pink-400 animate-pulse" />
              </div>
              <h3 className="text-gray-400 text-sm mb-1">Active Teams</h3>
              <p className="text-3xl font-bold text-white mb-1">
                {loading ? "..." : myTeams.length}
              </p>
              <p className="text-purple-400 text-xs">Competing now</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="group relative bg-gradient-to-br from-yellow-900/20 to-orange-900/20 backdrop-blur-sm border border-yellow-500/30 hover:border-yellow-500/60 rounded-xl p-6 transition-all hover:scale-105"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-yellow-500/20 rounded-lg group-hover:scale-110 transition-transform">
                  <Trophy className="w-6 h-6 text-yellow-400" />
                </div>
                <Crown className="w-5 h-5 text-yellow-400" />
              </div>
              <h3 className="text-gray-400 text-sm mb-1">Best Rank</h3>
              <p className="text-3xl font-bold text-white mb-1">-</p>
              <p className="text-yellow-400 text-xs">Highest achieved</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="group relative bg-gradient-to-br from-green-900/20 to-emerald-900/20 backdrop-blur-sm border border-green-500/30 hover:border-green-500/60 rounded-xl p-6 transition-all hover:scale-105"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-500/20 rounded-lg group-hover:scale-110 transition-transform">
                  <DollarSign className="w-6 h-6 text-green-400" />
                </div>
                <Target className="w-5 h-5 text-emerald-400" />
              </div>
              <h3 className="text-gray-400 text-sm mb-1">Avg Budget</h3>
              <p className="text-3xl font-bold text-white mb-1">1000</p>
              <p className="text-green-400 text-xs">Total available</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="group relative bg-gradient-to-br from-blue-900/20 to-cyan-900/20 backdrop-blur-sm border border-blue-500/30 hover:border-blue-500/60 rounded-xl p-6 transition-all hover:scale-105"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-500/20 rounded-lg group-hover:scale-110 transition-transform">
                  <Star className="w-6 h-6 text-blue-400" />
                </div>
                <Shield className="w-5 h-5 text-cyan-400 animate-pulse" />
              </div>
              <h3 className="text-gray-400 text-sm mb-1">Total Points</h3>
              <p className="text-3xl font-bold text-white mb-1">0</p>
              <p className="text-blue-400 text-xs">Across teams</p>
            </div>
          </motion.div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-gray-800/50 rounded-lg p-1 mb-8">
          {[
            { id: "my-teams", label: "My Teams", icon: Users },
            { id: "create-team", label: "Create Team", icon: Sword },
            { id: "player-market", label: "Player Market", icon: Target },
            { id: "leaderboard", label: "Leaderboard", icon: Trophy },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
                activeTab === tab.id
                  ? "bg-purple-500 text-white"
                  : "text-gray-400 hover:text-white hover:bg-gray-700"
              }`}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === "my-teams" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold">My Fantasy Teams</h3>
                <button
                  onClick={() => setShowCreateTeamModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 rounded-lg transition-colors"
                >
                  <Plus size={16} />
                  Create Team
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {authLoading || loading ? (
                  <div className="col-span-2 text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
                    <p className="text-gray-400 mt-4">
                      {authLoading
                        ? "Checking authentication..."
                        : "Loading your teams..."}
                    </p>
                  </div>
                ) : error ? (
                  <div className="col-span-2 text-center py-8">
                    <p className="text-red-400">{error}</p>
                    <button
                      onClick={fetchFantasyData}
                      className="mt-4 px-4 py-2 bg-purple-500 hover:bg-purple-600 rounded-lg transition-colors"
                    >
                      Retry
                    </button>
                  </div>
                ) : myTeams.length === 0 ? (
                  <div className="col-span-2 text-center py-8">
                    <Shield className="mx-auto text-gray-400 mb-4" size={48} />
                    <p className="text-gray-400 mb-4">
                      You haven't created any fantasy teams yet
                    </p>
                    <button
                      onClick={() => setShowCreateTeamModal(true)}
                      className="px-4 py-2 bg-purple-500 hover:bg-purple-600 rounded-lg transition-colors"
                    >
                      Create Your First Team
                    </button>
                  </div>
                ) : (
                  myTeams.map((team) => (
                    <div
                      key={team.id}
                      className="bg-gray-900/50 border border-gray-700 rounded-xl p-6"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold flex items-center gap-2">
                          <Shield className="text-purple-400" size={20} />
                          {team.team_name}
                        </h3>
                        <span className="text-sm bg-purple-500/20 text-purple-400 px-2 py-1 rounded">
                          Rank #{team.current_rank || "N/A"}
                        </span>
                      </div>

                      <p className="text-gray-400 mb-4">
                        {team.league?.name || "No League"}
                      </p>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-400">Points</p>
                          <p className="text-lg font-bold text-green-400">
                            {team.total_points || 0}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Budget Left</p>
                          <p className="text-lg font-bold">
                            {team.budget_remaining || 0}
                          </p>
                        </div>
                      </div>

                      <div className="mb-4">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Budget Used</span>
                          <span>
                            {1000 - (team.budget_remaining || 0)}/1000
                          </span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full"
                            style={{
                              width: `${
                                ((1000 - (team.budget_remaining || 0)) / 1000) *
                                100
                              }%`,
                            }}
                          ></div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button className="flex-1 px-4 py-2 bg-purple-500 hover:bg-purple-600 rounded-lg transition-colors">
                          Manage Team
                        </button>
                        <button className="px-4 py-2 border border-gray-600 hover:bg-gray-800 rounded-lg transition-colors">
                          View Stats
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === "player-market" && (
            <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Player Market</h2>
                <div className="flex gap-2">
                  <select
                    value={selectedTournament || ""}
                    onChange={(e) => {
                      setSelectedTournament(e.target.value);
                      if (e.target.value)
                        fetchPlayersForTournament(e.target.value);
                    }}
                    className="bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white"
                  >
                    <option value="">Select Tournament</option>
                    {availableLeagues.map((league) => (
                      <option key={league.id} value={league.tournament?.id}>
                        {league.tournament?.name || league.name}
                      </option>
                    ))}
                  </select>
                  <button className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors">
                    <Search size={16} />
                    Filter
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {authLoading || loading ? (
                  <div className="col-span-4 text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
                    <p className="text-gray-400 mt-4">
                      {authLoading
                        ? "Checking authentication..."
                        : "Loading players..."}
                    </p>
                  </div>
                ) : availablePlayers.length === 0 ? (
                  <div className="col-span-4 text-center py-8">
                    <Users className="mx-auto text-gray-400 mb-4" size={48} />
                    <p className="text-gray-400">
                      {selectedTournament
                        ? "No players available for this tournament"
                        : "Select a tournament to view players"}
                    </p>
                  </div>
                ) : (
                  availablePlayers.map((player) => (
                    <div
                      key={player.id}
                      className="bg-gray-800/50 border border-gray-600 rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-bold">{player.player_name}</h3>
                        <span
                          className={`text-xs px-2 py-1 rounded ${getFormColor(
                            player.form || "average"
                          )}`}
                        >
                          {player.form || "N/A"}
                        </span>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Position:</span>
                          <span>{player.position || "Player"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Price:</span>
                          <span className="text-green-400">
                            ${player.price || 0}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Points:</span>
                          <span className="text-blue-400">
                            {player.total_points || 0}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          // Add player to team logic
                          console.log("Adding player to team:", player);
                        }}
                        className="w-full mt-4 px-3 py-2 bg-green-500 hover:bg-green-600 rounded transition-colors text-sm"
                      >
                        Add to Team
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === "create-team" && (
            <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-6">
              <Crown className="mx-auto text-yellow-400 mb-4" size={48} />
              <h2 className="text-2xl font-bold mb-4 text-center">
                Create New Fantasy Team
              </h2>
              <p className="text-gray-400 mb-6 text-center">
                Build your dream team and compete for glory!
              </p>

              {error && (
                <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-lg text-red-400">
                  {error}
                </div>
              )}

              <div className="max-w-md mx-auto space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Team Name
                  </label>
                  <input
                    type="text"
                    value={newTeamData.team_name}
                    onChange={(e) =>
                      setNewTeamData({
                        ...newTeamData,
                        team_name: e.target.value,
                      })
                    }
                    placeholder="Enter your team name"
                    className="w-full bg-gray-800 border border-gray-600 rounded-lg p-3 text-white placeholder-gray-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Select League
                  </label>
                  <select
                    value={newTeamData.league}
                    onChange={(e) =>
                      setNewTeamData({ ...newTeamData, league: e.target.value })
                    }
                    className="w-full bg-gray-800 border border-gray-600 rounded-lg p-3 text-white"
                  >
                    <option value="">Choose a league...</option>
                    {availableLeagues.map((league) => (
                      <option key={league.id} value={league.id}>
                        {league.name} ({league.game_type})
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={handleCreateTeam}
                  disabled={!newTeamData.team_name || !newTeamData.league}
                  className="w-full px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg font-semibold hover:from-purple-400 hover:to-pink-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create Team
                </button>
              </div>
            </div>
          )}

          {activeTab === "leaderboard" && (
            <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-6">
              <h2 className="text-2xl font-bold mb-6">Fantasy Leaderboard</h2>
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((rank) => (
                  <div
                    key={rank}
                    className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                          rank === 1
                            ? "bg-yellow-500 text-black"
                            : rank === 2
                            ? "bg-gray-400 text-black"
                            : rank === 3
                            ? "bg-orange-500 text-black"
                            : "bg-gray-700 text-white"
                        }`}
                      >
                        {rank}
                      </span>
                      <div>
                        <p className="font-semibold">Manager_{rank}</p>
                        <p className="text-sm text-gray-400">Team Alpha</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-400">
                        {2500 - rank * 100} pts
                      </p>
                      <p className="text-sm text-gray-400">
                        Winter Championship
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Create Team Modal */}
      {showCreateTeamModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-900 border border-gray-700 rounded-xl p-6 max-w-md w-full"
          >
            <h2 className="text-2xl font-bold mb-4">Create New Fantasy Team</h2>

            {error && (
              <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-lg text-red-400">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Team Name
                </label>
                <input
                  type="text"
                  value={newTeamData.team_name}
                  onChange={(e) =>
                    setNewTeamData({
                      ...newTeamData,
                      team_name: e.target.value,
                    })
                  }
                  placeholder="Enter your team name"
                  className="w-full bg-gray-800 border border-gray-600 rounded-lg p-3 text-white placeholder-gray-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Select League
                </label>
                <select
                  value={newTeamData.league}
                  onChange={(e) =>
                    setNewTeamData({ ...newTeamData, league: e.target.value })
                  }
                  className="w-full bg-gray-800 border border-gray-600 rounded-lg p-3 text-white"
                >
                  <option value="">Choose a league...</option>
                  {availableLeagues.map((league) => (
                    <option key={league.id} value={league.id}>
                      {league.name} ({league.game_type})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setShowCreateTeamModal(false);
                    setNewTeamData({ team_name: "", league: "" });
                    setError(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-600 hover:bg-gray-800 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateTeam}
                  disabled={!newTeamData.team_name || !newTeamData.league}
                  className="flex-1 px-4 py-2 bg-purple-500 hover:bg-purple-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create Team
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
