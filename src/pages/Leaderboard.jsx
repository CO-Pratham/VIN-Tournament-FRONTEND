import { useEffect } from "react";
import { motion } from "framer-motion";
import { Trophy, Medal, Award, Users, Crown } from "lucide-react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchLeaderboard } from "../store/slices/leaderboardSlice";

export default function Leaderboard() {
  const dispatch = useDispatch();
  const { players: leaders, loading } = useSelector(state => state.leaderboard);

  useEffect(() => {
    dispatch(fetchLeaderboard());
  }, [dispatch]);

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1: return <Crown className="w-6 h-6 text-yellow-400" />;
      case 2: return <Medal className="w-6 h-6 text-gray-400" />;
      case 3: return <Award className="w-6 h-6 text-orange-400" />;
      default: return <span className="text-lg font-bold text-gray-400">#{rank}</span>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black pt-20 flex items-center justify-center">
        <div className="text-white text-xl">Loading leaderboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black pt-20 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-white mb-4 flex items-center justify-center gap-3">
            <Trophy className="w-10 h-10 text-yellow-400" />
            Leaderboard
          </h1>
          <p className="text-gray-400 text-lg">Top players by tournaments joined</p>
        </motion.div>

        <div className="space-y-4">
          {leaders.map((player, index) => (
            <motion.div
              key={player.user_id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`bg-gray-900/50 backdrop-blur-lg border rounded-xl p-6 hover:border-cyan-500/50 transition-all ${
                index < 3 ? 'border-yellow-500/30' : 'border-gray-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-12 h-12">
                    {getRankIcon(index + 1)}
                  </div>
                  
                  <Link 
                    to={`/player/${player.user_id}`}
                    className="flex items-center gap-4 hover:opacity-80 transition-opacity"
                  >
                    <div className="w-16 h-16 rounded-full bg-gradient-to-r from-cyan-400 to-pink-500 flex items-center justify-center text-xl font-bold text-white">
                      {player.username?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">{player.username}</h3>
                      <p className="text-gray-400">ID: {player.player_id || 'VIN' + player.user_id.slice(-6).toUpperCase()}</p>
                      <p className="text-gray-400">Player since {new Date(player.created_at).getFullYear()}</p>
                    </div>
                  </Link>
                </div>

                <div className="text-right">
                  <div className="flex items-center gap-2 text-cyan-400 mb-2">
                    <Users className="w-5 h-5" />
                    <span className="text-2xl font-bold">{player.tournaments_joined}</span>
                  </div>
                  <p className="text-gray-400 text-sm">Tournaments Joined</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {leaders.length === 0 && (
          <div className="text-center py-12">
            <Trophy className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">No players on the leaderboard yet</p>
          </div>
        )}
      </div>
    </div>
  );
}