import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { User, Trophy, Calendar, Gamepad2, Users, ArrowLeft, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchPublicProfile } from "../store/slices/leaderboardSlice";

export default function PublicProfile() {
  const { userId } = useParams();
  const dispatch = useDispatch();
  const { currentProfile: profile, profileTournaments: tournaments, profileStats: stats, profileLoading: loading } = useSelector(state => state.leaderboard);

  useEffect(() => {
    dispatch(fetchPublicProfile(userId));
  }, [dispatch, userId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black pt-20 flex items-center justify-center">
        <div className="text-white text-xl">Loading profile...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black pt-20 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Player Not Found</h2>
          <Link to="/leaderboard" className="text-cyan-400 hover:text-cyan-300">
            Back to Leaderboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black pt-20 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-8"
        >
          <Link
            to="/leaderboard"
            className="p-2 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-white" />
          </Link>
          <h1 className="text-2xl font-bold text-white">Player Profile</h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-900/50 backdrop-blur-lg border border-gray-800 rounded-2xl overflow-hidden mb-8"
        >
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-cyan-500/20 to-pink-500/20 p-8">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 rounded-full bg-gradient-to-r from-cyan-400 to-pink-500 flex items-center justify-center text-3xl font-bold text-white">
                {(profile.username || profile.email)?.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h2 className="text-3xl font-bold text-white">{profile.username || profile.email}</h2>
                  {profile.is_verified && (
                    <div className="inline-flex items-center gap-1 bg-gradient-to-r from-green-500 to-emerald-500 px-3 py-1 rounded-full shadow-lg">
                      <CheckCircle size={16} className="text-white" />
                      <span className="text-white font-bold text-xs">Verified</span>
                    </div>
                  )}
                </div>
                <p className="text-cyan-400 font-medium text-lg">
                  ID: {profile.gaming_id || 'Not set'}
                </p>
                <p className="text-gray-300 flex items-center gap-2 mt-2">
                  <Gamepad2 className="w-4 h-4" />
                  {profile.preferred_games?.join(', ') || profile.favorite_game || "Gaming Enthusiast"}
                </p>
                <p className="text-gray-400">
                  Member since {new Date(profile.date_joined || profile.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="p-8">
            <h3 className="text-xl font-bold text-white mb-6">Player Statistics</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="bg-gray-800/50 p-4 rounded-lg text-center">
                <Trophy className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">{stats.tournaments_joined || 0}</p>
                <p className="text-gray-400 text-sm">Tournaments Joined</p>
              </div>
              <div className="bg-gray-800/50 p-4 rounded-lg text-center">
                <Trophy className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">{stats.tournaments_won || 0}</p>
                <p className="text-gray-400 text-sm">Tournaments Won</p>
              </div>
              <div className="bg-gray-800/50 p-4 rounded-lg text-center">
                <Users className="w-8 h-8 text-green-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">{stats.total_earnings || 0}</p>
                <p className="text-gray-400 text-sm">Total Earnings (₹)</p>
              </div>
              <div className="bg-gray-800/50 p-4 rounded-lg text-center">
                <Calendar className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">{stats.rank || "N/A"}</p>
                <p className="text-gray-400 text-sm">Global Rank</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Recent Tournaments */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-900/50 backdrop-blur-lg border border-gray-800 rounded-2xl p-8"
        >
          <h3 className="text-xl font-bold text-white mb-6">Recent Tournaments</h3>
          
          {tournaments.length > 0 ? (
            <div className="space-y-4">
              {tournaments.slice(0, 5).map((tournament, index) => (
                <div
                  key={tournament.id}
                  className="bg-gray-800/50 p-4 rounded-lg flex items-center justify-between"
                >
                  <div>
                    <h4 className="text-white font-medium">{tournament.title}</h4>
                    <p className="text-gray-400 text-sm">{tournament.game}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-cyan-400 font-medium">{tournament.status}</p>
                    <p className="text-gray-400 text-sm">
                      {new Date(tournament.joined_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Trophy className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No tournaments joined yet</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}