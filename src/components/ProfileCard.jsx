import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Crown, Shield, Star, Trophy, Users, Gamepad2, Calendar, MapPin } from 'lucide-react';
import GameBadges from './GameBadges';
import BadgeSystem from './BadgeSystem';

export default function ProfileCard({ user, isOpen, onClose }) {
  const cardRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (cardRef.current && !cardRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !user) return null;

  const getRoleConfig = (role) => {
    const configs = {
      admin: { 
        color: 'from-red-500 to-pink-500', 
        icon: Crown, 
        label: 'Admin',
        bgColor: 'bg-red-500/10',
        borderColor: 'border-red-500/30'
      },
      moderator: { 
        color: 'from-blue-500 to-cyan-500', 
        icon: Shield, 
        label: 'Moderator',
        bgColor: 'bg-blue-500/10',
        borderColor: 'border-blue-500/30'
      },
      event_manager: { 
        color: 'from-purple-500 to-indigo-500', 
        icon: Calendar, 
        label: 'Event Manager',
        bgColor: 'bg-purple-500/10',
        borderColor: 'border-purple-500/30'
      },
      vip: { 
        color: 'from-yellow-500 to-orange-500', 
        icon: Star, 
        label: 'VIP Player',
        bgColor: 'bg-yellow-500/10',
        borderColor: 'border-yellow-500/30'
      },
      pro: { 
        color: 'from-green-500 to-emerald-500', 
        icon: Trophy, 
        label: 'Pro Player',
        bgColor: 'bg-green-500/10',
        borderColor: 'border-green-500/30'
      },
      player: { 
        color: 'from-gray-500 to-gray-600', 
        icon: Users, 
        label: 'Player',
        bgColor: 'bg-gray-500/10',
        borderColor: 'border-gray-500/30'
      }
    };
    return configs[role] || configs.player;
  };

  const roleConfig = getRoleConfig(user.role);
  const RoleIcon = roleConfig.icon;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        ref={cardRef}
        initial={{ scale: 0.8, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.8, opacity: 0, y: 50 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="relative w-full max-w-md bg-gray-900 rounded-2xl overflow-hidden shadow-2xl"
      >
        {/* Animated Background */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 via-purple-500/20 to-pink-500/20"></div>
          <motion.div
            animate={{
              background: [
                'radial-gradient(circle at 20% 50%, rgba(120, 119, 198, 0.3) 0%, transparent 50%)',
                'radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%)',
                'radial-gradient(circle at 40% 80%, rgba(119, 198, 255, 0.3) 0%, transparent 50%)',
                'radial-gradient(circle at 20% 50%, rgba(120, 119, 198, 0.3) 0%, transparent 50%)'
              ]
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0"
          />
        </div>

        {/* Header Banner */}
        <div className={`h-24 bg-gradient-to-r ${roleConfig.color} relative`}>
          <motion.div
            animate={{ x: [-100, 100, -100] }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 bg-white/10 transform skew-x-12"
          />
        </div>

        {/* Profile Content */}
        <div className="relative px-6 pb-6">
          {/* Avatar */}
          <div className="relative -mt-12 mb-4">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="relative w-20 h-20 mx-auto"
            >
              <div className={`absolute inset-0 rounded-full bg-gradient-to-r ${roleConfig.color} p-1`}>
                <div className="w-full h-full rounded-full bg-gray-900 flex items-center justify-center overflow-hidden">
                  {user.avatar ? (
                    <img 
                      src={typeof user.avatar === 'string' ? user.avatar : URL.createObjectURL(user.avatar)} 
                      alt={user.username}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center text-white font-bold text-xl">
                      {user.username?.charAt(0)?.toUpperCase()}
                    </div>
                  )}
                </div>
              </div>
              {user.is_online && (
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-gray-900">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-full h-full bg-green-400 rounded-full"
                  />
                </div>
              )}
            </motion.div>
          </div>

          {/* User Info */}
          <div className="text-center mb-4">
            <h3 className="text-xl font-bold text-white mb-1">{user.username}</h3>
            <p className="text-gray-400 text-sm mb-2">#{user.player_id}</p>
            
            {/* Role Badge */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${roleConfig.bgColor} ${roleConfig.borderColor} border`}
            >
              <RoleIcon size={14} className={`bg-gradient-to-r ${roleConfig.color} bg-clip-text text-transparent`} />
              <span className={`text-sm font-semibold bg-gradient-to-r ${roleConfig.color} bg-clip-text text-transparent`}>
                {roleConfig.label}
              </span>
            </motion.div>
          </div>

          {/* Bio */}
          {user.bio && (
            <div className="mb-4 p-3 bg-gray-800/50 rounded-lg">
              <p className="text-gray-300 text-sm text-center">{user.bio}</p>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="text-center p-2 bg-gray-800/30 rounded-lg">
              <Trophy className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
              <div className="text-white font-bold text-sm">{user.tournaments_won}</div>
              <div className="text-gray-400 text-xs">Wins</div>
            </div>
            <div className="text-center p-2 bg-gray-800/30 rounded-lg">
              <Gamepad2 className="w-5 h-5 text-cyan-400 mx-auto mb-1" />
              <div className="text-white font-bold text-sm">{user.tournaments_joined}</div>
              <div className="text-gray-400 text-xs">Joined</div>
            </div>
            <div className="text-center p-2 bg-gray-800/30 rounded-lg">
              <Star className="w-5 h-5 text-pink-400 mx-auto mb-1" />
              <div className="text-white font-bold text-sm">₹{user.total_earnings}</div>
              <div className="text-gray-400 text-xs">Earned</div>
            </div>
          </div>

          {/* Games */}
          {user.preferred_games && user.preferred_games.length > 0 && (
            <div className="mb-4">
              <h4 className="text-gray-400 text-xs uppercase tracking-wide mb-2">Favorite Games</h4>
              <div className="flex flex-wrap gap-2">
                {user.preferred_games.slice(0, 3).map((game, index) => (
                  <span 
                    key={index}
                    className="px-2 py-1 bg-cyan-500/20 text-cyan-400 text-xs rounded-full border border-cyan-500/30"
                  >
                    {game}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Gaming Badges */}
          <div className="mb-4">
            <GameBadges badges={user.badges} user={user} />
          </div>

          {/* Member Since */}
          <div className="text-center pt-3 border-t border-gray-700">
            <p className="text-gray-400 text-xs">
              Member since {new Date(user.date_joined).toLocaleDateString('en-US', { 
                month: 'short', 
                year: 'numeric' 
              })}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}