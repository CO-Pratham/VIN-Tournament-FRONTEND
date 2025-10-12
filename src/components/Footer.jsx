import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Gamepad2 } from 'lucide-react';

export default function Footer() {
  return (
    <motion.footer
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gradient-to-r from-black via-gray-900 to-black border-t border-cyan-500/30 py-6 mt-auto"
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col items-center justify-center space-y-3">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-2 text-gray-300"
          >
            <span>Made with</span>
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, 10, -10, 0]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse"
              }}
            >
              <Heart className="text-red-500 fill-red-500" size={18} />
            </motion.div>
            <span>for all gamers</span>
            <Gamepad2 className="text-cyan-400" size={18} />
          </motion.div>
          
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="text-center"
          >
            <p className="text-sm text-gray-400">
              Developed by{' '}
              <span className="text-transparent bg-gradient-to-r from-cyan-400 via-blue-400 to-pink-400 bg-clip-text font-bold">
                MR Blacky
              </span>
            </p>
          </motion.div>
          
          <div className="text-xs text-gray-500">
            © 2025 Vin Tournament • Play • Compete • Earn
          </div>
        </div>
      </div>
    </motion.footer>
  );
}