import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Star, Crown, Target, Zap, Award, Medal, Flame } from 'lucide-react';

export default function GameBadges({ badges = [], user = null }) {
  // Auto-generate badges based on user stats
  const getAutoBadges = () => {
    if (!user) return badges;
    
    const autoBadges = [...badges];
    
    // Tournament participation badges
    if (user.tournaments_joined >= 1 && !autoBadges.includes('first_tournament')) {
      autoBadges.push('first_tournament');
    }
    if (user.tournaments_joined >= 5 && !autoBadges.includes('tournament_veteran')) {
      autoBadges.push('tournament_veteran');
    }
    if (user.tournaments_joined >= 10 && !autoBadges.includes('tournament_master')) {
      autoBadges.push('tournament_master');
    }
    
    // Victory badges
    if (user.tournaments_won >= 1 && !autoBadges.includes('first_victory')) {
      autoBadges.push('first_victory');
    }
    if (user.tournaments_won >= 3 && !autoBadges.includes('champion')) {
      autoBadges.push('champion');
    }
    if (user.tournaments_won >= 5 && !autoBadges.includes('legend')) {
      autoBadges.push('legend');
    }
    
    // Organizer badges
    if (user.tournaments_created >= 1 && !autoBadges.includes('organizer')) {
      autoBadges.push('organizer');
    }
    if (user.tournaments_created >= 5 && !autoBadges.includes('event_master')) {
      autoBadges.push('event_master');
    }
    
    // Earning badges
    if (user.total_earnings >= 1000 && !autoBadges.includes('earner')) {
      autoBadges.push('earner');
    }
    if (user.total_earnings >= 5000 && !autoBadges.includes('big_earner')) {
      autoBadges.push('big_earner');
    }
    
    return autoBadges;
  };
  
  const allBadges = getAutoBadges();
  const badgeConfig = {
    first_tournament: {
      icon: Trophy,
      name: 'First Tournament',
      description: 'Participated in first tournament',
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/30'
    },
    tournament_veteran: {
      icon: Star,
      name: 'Tournament Veteran',
      description: 'Participated in 5+ tournaments',
      color: 'from-purple-500 to-indigo-500',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/30'
    },
    tournament_master: {
      icon: Crown,
      name: 'Tournament Master',
      description: 'Participated in 10+ tournaments',
      color: 'from-yellow-500 to-orange-500',
      bgColor: 'bg-yellow-500/10',
      borderColor: 'border-yellow-500/30'
    },
    first_victory: {
      icon: Medal,
      name: 'First Victory',
      description: 'Won first tournament',
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/30'
    },
    champion: {
      icon: Award,
      name: 'Champion',
      description: 'Won 3+ tournaments',
      color: 'from-red-500 to-pink-500',
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/30'
    },
    legend: {
      icon: Flame,
      name: 'Legend',
      description: 'Won 5+ tournaments',
      color: 'from-orange-500 to-red-500',
      bgColor: 'bg-orange-500/10',
      borderColor: 'border-orange-500/30'
    },
    organizer: {
      icon: Target,
      name: 'Organizer',
      description: 'Organized first tournament',
      color: 'from-cyan-500 to-blue-500',
      bgColor: 'bg-cyan-500/10',
      borderColor: 'border-cyan-500/30'
    },
    event_master: {
      icon: Zap,
      name: 'Event Master',
      description: 'Organized 5+ tournaments',
      color: 'from-violet-500 to-purple-500',
      bgColor: 'bg-violet-500/10',
      borderColor: 'border-violet-500/30'
    },
    earner: {
      icon: Star,
      name: 'Earner',
      description: 'Earned ₹1000+',
      color: 'from-green-500 to-teal-500',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/30'
    },
    big_earner: {
      icon: Crown,
      name: 'Big Earner',
      description: 'Earned ₹5000+',
      color: 'from-yellow-500 to-amber-500',
      bgColor: 'bg-yellow-500/10',
      borderColor: 'border-yellow-500/30'
    }
  };

  if (!allBadges || allBadges.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <h4 className="text-gray-300 text-sm font-semibold uppercase tracking-wide">Gaming Badges</h4>
          <div className="h-px bg-gradient-to-r from-cyan-500/50 to-transparent flex-1"></div>
        </div>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-8 bg-gray-800/30 rounded-xl border border-gray-700/50 border-dashed"
        >
          <Trophy className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500 text-sm font-medium">No badges earned yet</p>
          <p className="text-gray-600 text-xs mt-1">Play tournaments to unlock achievements!</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <h4 className="text-gray-300 text-sm font-semibold uppercase tracking-wide">Gaming Badges</h4>
        <div className="h-px bg-gradient-to-r from-cyan-500/50 to-transparent flex-1"></div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {allBadges.map((badgeKey, index) => {
          const badge = badgeConfig[badgeKey];
          if (!badge) return null;

          const BadgeIcon = badge.icon;

          return (
            <motion.div
              key={badgeKey}
              initial={{ opacity: 0, scale: 0.5, rotateY: 180 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              transition={{ 
                delay: index * 0.15,
                type: "spring",
                stiffness: 300,
                damping: 20
              }}
              whileHover={{ 
                scale: 1.08, 
                y: -5,
                rotateX: 10,
                transition: { duration: 0.2 }
              }}
              whileTap={{ scale: 0.95 }}
              className={`relative ${badge.bgColor} ${badge.borderColor} border-2 rounded-xl p-3 text-center group cursor-pointer overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300`}
              title={badge.description}
            >
              {/* Animated background glow */}
              <motion.div
                className={`absolute inset-0 bg-gradient-to-r ${badge.color} opacity-0 group-hover:opacity-20 transition-opacity duration-300`}
                animate={{
                  background: [
                    `linear-gradient(45deg, transparent, rgba(255,255,255,0.1), transparent)`,
                    `linear-gradient(225deg, transparent, rgba(255,255,255,0.1), transparent)`
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              />
              
              {/* Sparkle effect */}
              <motion.div
                className="absolute top-1 right-1 w-1 h-1 bg-white rounded-full opacity-0 group-hover:opacity-100"
                animate={{
                  scale: [0, 1, 0],
                  opacity: [0, 1, 0]
                }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
              />
              <motion.div
                className="absolute bottom-2 left-2 w-0.5 h-0.5 bg-white rounded-full opacity-0 group-hover:opacity-100"
                animate={{
                  scale: [0, 1, 0],
                  opacity: [0, 1, 0]
                }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 1 }}
              />
              
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
                className="relative z-10"
              >
                <BadgeIcon 
                  size={24} 
                  className={`mx-auto mb-2 bg-gradient-to-r ${badge.color} bg-clip-text text-transparent group-hover:drop-shadow-lg transition-all duration-300`} 
                />
              </motion.div>
              
              <p className={`text-xs font-bold bg-gradient-to-r ${badge.color} bg-clip-text text-transparent relative z-10 group-hover:text-shadow-lg`}>
                {badge.name}
              </p>
              
              {/* Badge shine effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 opacity-0 group-hover:opacity-100"
                initial={{ x: '-100%' }}
                whileHover={{ x: '100%' }}
                transition={{ duration: 0.6 }}
              />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}