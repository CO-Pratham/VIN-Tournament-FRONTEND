import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Star, Trophy, Target, Zap, Award, TrendingUp } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export default function Gamification() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [userStats, setUserStats] = useState(null);
  const [badges, setBadges] = useState([]);
  const [userBadges, setUserBadges] = useState([]);
  const [leaderboards, setLeaderboards] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      fetchGamificationData();
    } else if (!authLoading && !isAuthenticated) {
      setLoading(false);
      setError('Please log in to view gamification data');
    }
  }, [isAuthenticated, authLoading]);

  const fetchGamificationData = async () => {
    try {
      setLoading(true);
      const [statsRes, badgesRes, userBadgesRes, leaderboardsRes, activitiesRes] = await Promise.all([
        api.getUserStats(),
        api.getBadges(),
        api.getUserBadges(),
        api.getLeaderboards(),
        api.getActivities()
      ]);

      setUserStats(statsRes.data || statsRes);
      setBadges(badgesRes.results || badgesRes || []);
      setUserBadges(userBadgesRes.results || userBadgesRes || []);
      setLeaderboards(leaderboardsRes.results || leaderboardsRes || []);
      setActivities(activitiesRes.results || activitiesRes || []);
    } catch (error) {
      console.error('Error fetching gamification data:', error);
      setError('Failed to load gamification data');
    } finally {
      setLoading(false);
    }
  };

  const getRarityColor = (rarity) => {
    switch (rarity) {
      case 'common': return 'text-gray-400 border-gray-400';
      case 'rare': return 'text-blue-400 border-blue-400';
      case 'epic': return 'text-purple-400 border-purple-400';
      case 'legendary': return 'text-yellow-400 border-yellow-400';
      default: return 'text-gray-400 border-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent mb-4">
            🎮 Gamification Dashboard
          </h1>
          <p className="text-gray-400 text-lg">Track your progress, earn badges, and climb the leaderboard!</p>
        </motion.div>

        {/* Content */}
        <>

        {/* User Stats Cards */}
        {authLoading || loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto"></div>
            <p className="text-gray-400 mt-4">{authLoading ? 'Checking authentication...' : 'Loading your stats...'}</p>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-400">{error}</p>
            <button
              onClick={fetchGamificationData}
              className="mt-4 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 rounded-lg transition-colors"
            >
              Retry
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <Star className="text-yellow-400" size={24} />
                <span className="text-2xl font-bold text-yellow-400">
                  Lv.{userStats?.level || 1}
                </span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Level & XP</h3>
              <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                <div
                  className="bg-gradient-to-r from-yellow-400 to-orange-500 h-2 rounded-full"
                  style={{
                    width: `${userStats ? ((userStats.current_xp / (userStats.level * 1000)) * 100) : 0}%`
                  }}
                ></div>
              </div>
              <p className="text-sm text-gray-400">
                {userStats?.current_xp || 0}/{(userStats?.level || 1) * 1000} XP
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <Trophy className="text-blue-400" size={24} />
                <span className="text-2xl font-bold text-blue-400">
                  #{userStats?.global_rank || 'N/A'}
                </span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Global Rank</h3>
              <p className="text-sm text-gray-400">Out of 10,000+ players</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <Target className="text-green-400" size={24} />
                <span className="text-2xl font-bold text-green-400">
                  {userStats?.win_rate || 0}%
                </span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Win Rate</h3>
              <p className="text-sm text-gray-400">
                {userStats?.total_wins || 0}/{userStats?.total_matches || 0} matches
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="bg-gradient-to-br from-red-500/20 to-pink-500/20 border border-red-500/30 rounded-xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <Zap className="text-red-400" size={24} />
                <span className="text-2xl font-bold text-red-400">
                  {userStats?.current_streak || 0}
                </span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Daily Streak</h3>
              <p className="text-sm text-gray-400">Keep it up! 🔥</p>
            </motion.div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Badges Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-gray-900/50 border border-gray-700 rounded-xl p-6"
          >
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Award className="text-purple-400" />
              Badges & Achievements
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {badges.length === 0 ? (
                <div className="col-span-2 text-center py-8">
                  <Award className="mx-auto text-gray-400 mb-4" size={48} />
                  <p className="text-gray-400">No badges earned yet</p>
                </div>
              ) : (
                badges.map((badge) => {
                  const isEarned = userBadges.some(ub => ub.badge?.id === badge.id);
                  return (
                    <div
                      key={badge.id}
                      className={`p-4 rounded-lg border-2 ${getRarityColor(badge.rarity)} ${
                        isEarned ? 'bg-gray-800/50' : 'bg-gray-900/50 opacity-50'
                      }`}
                    >
                      <div className="text-3xl mb-2">{badge.icon || '🏆'}</div>
                      <h3 className="font-semibold text-sm">{badge.name}</h3>
                      <p className="text-xs text-gray-400 mt-1">{badge.description}</p>
                      <span className={`text-xs px-2 py-1 rounded-full mt-2 inline-block ${getRarityColor(badge.rarity)}`}>
                        {badge.rarity}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>

          {/* Recent Activities */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-gray-900/50 border border-gray-700 rounded-xl p-6"
          >
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <TrendingUp className="text-green-400" />
              Recent Activities
            </h2>
            <div className="space-y-4">
              {activities.length === 0 ? (
                <div className="text-center py-8">
                  <TrendingUp className="mx-auto text-gray-400 mb-4" size={48} />
                  <p className="text-gray-400">No recent activities</p>
                </div>
              ) : (
                activities.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                    <div>
                      <p className="font-medium">{activity.description}</p>
                      <p className="text-sm text-gray-400">
                        {new Date(activity.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-green-400 font-bold">+{activity.xp_earned || 0} XP</div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-8 text-center"
        >
          <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl p-8">
            <h3 className="text-2xl font-bold mb-4">Ready to Level Up?</h3>
            <p className="text-gray-400 mb-6">Join tournaments, complete challenges, and earn more XP!</p>
            <div className="flex gap-4 justify-center">
              <button className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg font-semibold hover:from-purple-400 hover:to-pink-400 transition-all">
                Join Tournament
              </button>
              <button className="px-6 py-3 border border-gray-600 rounded-lg font-semibold hover:bg-gray-800 transition-all">
                View Challenges
              </button>
            </div>
          </div>
        </motion.div>
        </>
      </div>
    </div>
  );
}
