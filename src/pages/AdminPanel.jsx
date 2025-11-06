import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Users, Eye, Check, X, Lock, AlertCircle, Crown, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import ProfileCard from '../components/ProfileCard';
import RoleManager from '../components/RoleManager';
import toast from 'react-hot-toast';

export default function AdminPanel() {
  const { currentUser, userProfile, refreshUserProfile } = useAuth();
  const navigate = useNavigate();
  const [tournaments, setTournaments] = useState([]);
  const [selectedTournament, setSelectedTournament] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showProfileCard, setShowProfileCard] = useState(false);
  const [activeTab, setActiveTab] = useState('tournaments');

  // Auth guard - allow admin role or specific email
  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
  }, [currentUser, navigate]);

  // Check if user has admin access
  const hasAdminAccess = () => {
    const userEmail = currentUser?.email || currentUser?.user?.email;
    return userEmail === 'prathang0000@gmail.com' || userProfile?.role === 'admin';
  };

  // Don't render anything if not authorized
  if (!currentUser || !hasAdminAccess()) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black pt-20 pb-12 px-4">
        <div className="max-w-md mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-900/50 backdrop-blur-lg border border-gray-800 rounded-xl p-8 text-center"
          >
            <AlertCircle className="w-16 h-16 mx-auto mb-4 text-yellow-400" />
            <h2 className="text-2xl font-bold text-white mb-4">Admin Access Required</h2>
            <p className="text-gray-400 mb-6">
              This area is restricted to administrators only.
            </p>
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-300 mb-2">Need admin access?</p>
              <p className="text-cyan-400 font-medium">Contact: prathang0000@gmail.com</p>
            </div>
            <Link
              to="/"
              className="inline-block bg-gradient-to-r from-cyan-500 to-pink-500 text-white px-6 py-2 rounded-lg hover:from-cyan-600 hover:to-pink-600 transition-all"
            >
              Back to Home
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  useEffect(() => {
    fetchTournaments();
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.request('/users/search/?search=');
      setUsers(response);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const handleRoleUpdate = async (userId, newRole) => {
    try {
      await api.request(`/users/${userId}/role/`, {
        method: 'POST',
        body: JSON.stringify({ role: newRole })
      });
      fetchUsers();
      if (selectedUser?.id === userId) {
        setSelectedUser({ ...selectedUser, role: newRole });
      }
      // Refresh current user profile if they updated their own role
      if (currentUser?.id === userId) {
        await refreshUserProfile();
      }
    } catch (error) {
      throw error;
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      fetchUsers();
      return;
    }
    try {
      const response = await api.request(`/users/search/?search=${searchQuery}`);
      setUsers(response);
    } catch (error) {
      toast.error('Search failed');
    }
  };

  const fetchTournaments = async () => {
    try {
      const data = await api.getTournaments();
      setTournaments(data.filter(t => t.status === 'completed'));
    } catch (error) {
      toast.error('Failed to fetch tournaments');
    }
  };

  const fetchParticipants = async (tournamentId) => {
    try {
      setLoading(true);
      const response = await api.request(`/tournaments/${tournamentId}/participants_with_uids/`);
      setParticipants(response);
    } catch (error) {
      toast.error('Failed to fetch participants');
      console.error('Fetch participants error:', error);
    } finally {
      setLoading(false);
    }
  };

  const declareResults = async (tournamentId, resultsData) => {
    try {
      await api.request(`/tournaments/${tournamentId}/declare_results/`, {
        method: 'POST',
        body: JSON.stringify({ results: resultsData })
      });
      toast.success('Results declared successfully');
      fetchTournaments();
    } catch (error) {
      toast.error('Failed to declare results');
      console.error('Declare results error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black pt-20 pb-12 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-white mb-2">Admin Panel</h1>
          <p className="text-gray-400">Manage tournaments, users, and roles</p>
        </motion.div>

        {/* Tab Navigation */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setActiveTab('tournaments')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'tournaments'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            <Trophy className="w-5 h-5 inline mr-2" />
            Tournaments
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'users'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            <Crown className="w-5 h-5 inline mr-2" />
            User Management
          </button>
        </div>

        {activeTab === 'tournaments' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Tournament List */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-gray-900/50 backdrop-blur-lg border border-gray-800 rounded-xl p-6"
          >
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Trophy className="w-6 h-6 text-yellow-400" />
              Completed Tournaments
            </h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {tournaments.map((tournament) => (
                <div
                  key={tournament.id}
                  onClick={() => {
                    setSelectedTournament(tournament);
                    fetchParticipants(tournament.id);
                  }}
                  className="p-4 bg-gray-800/50 rounded-lg cursor-pointer hover:bg-gray-700/50 transition-colors"
                >
                  <h3 className="text-white font-medium">{tournament.title}</h3>
                  <p className="text-gray-400 text-sm">{tournament.game} • ₹{tournament.prize_pool}</p>
                  <p className="text-gray-500 text-xs">{tournament.current_participants} participants</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Participants & Results */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-gray-900/50 backdrop-blur-lg border border-gray-800 rounded-xl p-6"
          >
            {selectedTournament ? (
              <>
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Users className="w-6 h-6 text-cyan-400" />
                  {selectedTournament.title} - Participants
                </h2>
                {loading ? (
                  <div className="text-center text-gray-400 py-8">Loading participants...</div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {participants.map((participant, index) => (
                      <div key={participant.id} className="p-3 bg-gray-800/50 rounded-lg">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="text-white font-medium">{participant.user.username}</p>
                            <p className="text-cyan-400 text-sm">UID: {participant.ingame_uid}</p>
                            {participant.tier && (
                              <p className="text-gray-400 text-sm">Tier: {participant.tier}</p>
                            )}
                            {participant.team_name && (
                              <p className="text-gray-400 text-sm">Team: {participant.team_name}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-gray-500 text-sm">#{index + 1}</span>
                            <button
                              onClick={() => {
                                setSelectedUser(participant.user);
                                setShowProfileCard(true);
                              }}
                              className="bg-cyan-500/20 text-cyan-400 px-2 py-1 rounded text-xs hover:bg-cyan-500/30 transition-colors"
                            >
                              View Profile
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="text-center text-gray-400 py-8">
                <Eye className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Select a tournament to view participants</p>
              </div>
            )}
          </motion.div>
        </div>
        )}

        {activeTab === 'tournaments' && (
        <div>
        {/* Winner Verification Guide */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8 bg-gray-900/50 backdrop-blur-lg border border-gray-800 rounded-xl p-6"
        >
          <h2 className="text-xl font-bold text-white mb-4">Winner Verification Process</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <Eye className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-white font-medium mb-2">1. Check In-Game UIDs</h3>
              <p className="text-gray-400 text-sm">Verify participant UIDs match their in-game profiles</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <Check className="w-6 h-6 text-green-400" />
              </div>
              <h3 className="text-white font-medium mb-2">2. Verify Results</h3>
              <p className="text-gray-400 text-sm">Cross-check match results with game screenshots</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <Trophy className="w-6 h-6 text-yellow-400" />
              </div>
              <h3 className="text-white font-medium mb-2">3. Distribute Prizes</h3>
              <p className="text-gray-400 text-sm">Transfer winnings to verified winners</p>
            </div>
          </div>
        </motion.div>
        </div>
        )}

        {activeTab === 'users' && (
        <div className="space-y-6">
          {/* User Search */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-900/50 backdrop-blur-lg border border-gray-800 rounded-xl p-6"
          >
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Search className="w-6 h-6 text-cyan-400" />
              Search Users
            </h2>
            <div className="flex gap-3">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search by username, email, or player ID..."
                className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:border-cyan-500 focus:outline-none"
              />
              <button
                onClick={handleSearch}
                className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-6 py-2 rounded-lg hover:from-cyan-400 hover:to-blue-400 transition-all"
              >
                Search
              </button>
            </div>
          </motion.div>

          {/* Users List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-900/50 backdrop-blur-lg border border-gray-800 rounded-xl p-6"
          >
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Users className="w-6 h-6 text-cyan-400" />
              Users ({users.length})
            </h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {users.map((user) => {
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
                  <div key={user.id} className="p-4 bg-gray-800/50 rounded-lg hover:bg-gray-700/50 transition-colors">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-white font-medium">{user.username}</h3>
                          <span className={`px-2 py-1 text-xs rounded-full border ${getRoleColor(user.role)}`}>
                            {user.role?.replace('_', ' ').toUpperCase() || 'PLAYER'}
                          </span>
                          {user.is_online && (
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          )}
                        </div>
                        <p className="text-gray-400 text-sm">{user.email}</p>
                        <p className="text-cyan-400 text-sm">ID: {user.player_id}</p>
                        <div className="flex gap-4 text-xs text-gray-500 mt-1">
                          <span>Tournaments: {user.tournaments_joined}</span>
                          <span>Wins: {user.tournaments_won}</span>
                          <span>Earnings: ₹{user.total_earnings}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setShowProfileCard(true);
                          }}
                          className="bg-cyan-500/20 text-cyan-400 px-3 py-1 rounded text-sm hover:bg-cyan-500/30 transition-colors"
                        >
                          View Profile
                        </button>
                      </div>
                    </div>
                    <RoleManager
                      user={user}
                      onRoleUpdate={handleRoleUpdate}
                      currentUserRole={userProfile?.role || 'player'}
                    />
                  </div>
                );
              })}
            </div>
          </motion.div>
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