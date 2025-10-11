import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

const LoadingScreen = () => {
  const [currentWord, setCurrentWord] = useState(0);
  const [showVin, setShowVin] = useState(false);
  const words = ['Play.', 'Compete.', 'Earn.'];
  const vinLetters = ['V', 'I', 'N'];

  useEffect(() => {
    const timers = [
      setTimeout(() => setCurrentWord(1), 1000),
      setTimeout(() => setCurrentWord(2), 2000),
      setTimeout(() => {
        setCurrentWord(3);
        setTimeout(() => setShowVin(true), 800);
      }, 3000)
    ];

    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-50">
      <div className="flex justify-center items-center space-x-4 mb-16">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex items-center space-x-2">
            <motion.div
              className="w-3 h-3 bg-white rounded-full"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 0.8,
                repeat: showVin ? 0 : Infinity,
                delay: i * 0.2
              }}
            />
            {showVin && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.2 + 0.5 }}
                className="text-4xl md:text-6xl font-bold text-white"
              >
                {vinLetters[i]}
              </motion.span>
            )}
          </div>
        ))}
      </div>
      
      <div className="text-center">
        {currentWord < 3 && (
          <AnimatePresence mode="wait">
            <motion.div
              key={currentWord}
              initial={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-4xl md:text-6xl font-bold text-white"
            >
              {words[currentWord]}
            </motion.div>
          </AnimatePresence>
        )}
        
        {showVin && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="text-3xl md:text-5xl font-extrabold bg-gradient-to-r from-pink-500 to-cyan-500 bg-clip-text text-transparent"
          >
            Welcome to VIN Tournaments
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default LoadingScreen;