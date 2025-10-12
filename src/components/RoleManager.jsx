import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Crown, Shield, Star, Trophy, Users, Calendar, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function RoleManager({ user, onRoleUpdate, currentUserRole }) {
  const [selectedRole, setSelectedRole] = useState(user.role);
  const [isUpdating, setIsUpdating] = useState(false);

  const roles = [
    { value: 'player', label: 'Player', icon: Users, color: 'from-gray-500 to-gray-600' },
    { value: 'vip', label: 'VIP Player', icon: Star, color: 'from-yellow-500 to-orange-500' },
    { value: 'pro', label: 'Pro Player', icon: Trophy, color: 'from-green-500 to-emerald-500' },
    { value: 'moderator', label: 'Moderator', icon: Shield, color: 'from-blue-500 to-cyan-500' },
    { value: 'event_manager', label: 'Event Manager', icon: Calendar, color: 'from-purple-500 to-indigo-500' },
    { value: 'admin', label: 'Admin', icon: Crown, color: 'from-red-500 to-pink-500' }
  ];

  const canManageRole = (targetRole) => {
    if (currentUserRole !== 'admin') return false;
    if (targetRole === 'admin' && user.email !== 'prathang0000@gmail.com') return false;
    return true;
  };

  const handleRoleUpdate = async () => {
    if (!canManageRole(selectedRole)) {
      toast.error('You cannot assign this role');
      return;
    }

    setIsUpdating(true);
    try {
      await onRoleUpdate(user.id, selectedRole);
      toast.success(`Role updated to ${roles.find(r => r.value === selectedRole)?.label}`);
    } catch (error) {
      toast.error('Failed to update role');
      setSelectedRole(user.role);
    } finally {
      setIsUpdating(false);
    }
  };

  if (currentUserRole !== 'admin') {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-800/50 rounded-lg p-4 mt-4"
    >
      <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
        <Crown size={16} className="text-red-400" />
        Role Management
      </h4>
      
      <div className="space-y-2 mb-4">
        {roles.map((role) => {
          const RoleIcon = role.icon;
          const isDisabled = !canManageRole(role.value);
          
          return (
            <motion.button
              key={role.value}
              whileHover={!isDisabled ? { scale: 1.02 } : {}}
              onClick={() => !isDisabled && setSelectedRole(role.value)}
              disabled={isDisabled}
              className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all ${
                selectedRole === role.value
                  ? `bg-gradient-to-r ${role.color} bg-opacity-20 border-opacity-50`
                  : 'bg-gray-700/30 border-gray-600 hover:bg-gray-700/50'
              } ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <RoleIcon 
                size={18} 
                className={`bg-gradient-to-r ${role.color} bg-clip-text text-transparent`} 
              />
              <span className="text-white font-medium">{role.label}</span>
              {selectedRole === role.value && (
                <Check size={16} className="text-green-400 ml-auto" />
              )}
              {isDisabled && role.value === 'admin' && (
                <X size={16} className="text-red-400 ml-auto" />
              )}
            </motion.button>
          );
        })}
      </div>

      {selectedRole !== user.role && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleRoleUpdate}
          disabled={isUpdating}
          className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-semibold py-2 px-4 rounded-lg transition-all disabled:opacity-50"
        >
          {isUpdating ? 'Updating...' : 'Update Role'}
        </motion.button>
      )}
    </motion.div>
  );
}