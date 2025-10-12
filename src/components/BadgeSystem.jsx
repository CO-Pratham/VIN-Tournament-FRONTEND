import { motion } from "framer-motion";
import { Trophy, Users, Star, Crown, Target, Zap } from "lucide-react";

const BadgeSystem = ({ user, className = "" }) => {
  const getBadges = () => {
    const badges = [];
    
    // Tournament Organizer Badge
    if (user?.tournaments_created > 0) {
      badges.push({
        id: 'organizer',
        name: 'Tournament Organizer',
        icon: Trophy,
        color: 'from-yellow-400 to-orange-500',
        description: `Organized ${user.tournaments_created} tournament${user.tournaments_created > 1 ? 's' : ''}`
      });
    }
    
    // Tournament Participant Badge
    if (user?.tournaments_joined > 0) {
      badges.push({
        id: 'participant',
        name: 'Tournament Participant',
        icon: Users,
        color: 'from-blue-400 to-cyan-500',
        description: `Joined ${user.tournaments_joined} tournament${user.tournaments_joined > 1 ? 's' : ''}`
      });
    }
    
    // Winner Badge
    if (user?.tournaments_won > 0) {
      badges.push({
        id: 'winner',
        name: 'Champion',
        icon: Crown,
        color: 'from-purple-400 to-pink-500',
        description: `Won ${user.tournaments_won} tournament${user.tournaments_won > 1 ? 's' : ''}`
      });
    }
    
    // High Earner Badge
    if (user?.total_earnings >= 1000) {
      badges.push({
        id: 'earner',
        name: 'High Earner',
        icon: Star,
        color: 'from-green-400 to-emerald-500',
        description: `Earned ₹${user.total_earnings}`
      });
    }
    
    // Active Player Badge (5+ tournaments)
    if (user?.tournaments_joined >= 5) {
      badges.push({
        id: 'active',
        name: 'Active Player',
        icon: Target,
        color: 'from-red-400 to-rose-500',
        description: 'Highly active in tournaments'
      });
    }
    
    // Pro Player Badge (3+ wins)
    if (user?.tournaments_won >= 3) {
      badges.push({
        id: 'pro',
        name: 'Pro Player',
        icon: Zap,
        color: 'from-indigo-400 to-purple-500',
        description: 'Professional level player'
      });
    }
    
    return badges;
  };

  const badges = getBadges();

  if (badges.length === 0) return null;

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {badges.map((badge) => (
        <motion.div
          key={badge.id}
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          whileHover={{ scale: 1.1, y: -2 }}
          className="relative group"
        >
          <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${badge.color} flex items-center justify-center shadow-lg cursor-pointer`}>
            <badge.icon size={16} className="text-white" />
          </div>
          
          {/* Hover Tooltip */}
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.8 }}
            whileHover={{ opacity: 1, y: 0, scale: 1 }}
            className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-xl border border-gray-700 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-200 z-50"
          >
            <div className="font-semibold">{badge.name}</div>
            <div className="text-gray-300">{badge.description}</div>
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
          </motion.div>
        </motion.div>
      ))}
    </div>
  );
};

export default BadgeSystem;