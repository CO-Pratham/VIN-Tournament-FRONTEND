import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Trophy,
  Zap,
  Star,
  Sparkles,
  ArrowRight,
  Crown,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const AuthPromptModal = () => {
  const [showModal, setShowModal] = useState(false);
  const [hasShownOnce, setHasShownOnce] = useState(false);
  const [modalVariant, setModalVariant] = useState(0);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    // Don't show if user is authenticated
    if (isAuthenticated) {
      setShowModal(false);
      return;
    }

    // Show first popup after 5 seconds
    const initialTimer = setTimeout(() => {
      setShowModal(true);
      setHasShownOnce(true);
      setModalVariant(Math.floor(Math.random() * 3)); // Random variant (0, 1, or 2)
    }, 5000);

    // Cleanup
    return () => clearTimeout(initialTimer);
  }, [isAuthenticated]);

  useEffect(() => {
    // Only set up recurring timer if user is not authenticated and has seen first popup
    if (!isAuthenticated && hasShownOnce) {
      const recurringTimer = setInterval(() => {
        setShowModal(true);
        setModalVariant(Math.floor(Math.random() * 3)); // Different variant each time
      }, 30000); // Show every 30 seconds after first display

      return () => clearInterval(recurringTimer);
    }
  }, [isAuthenticated, hasShownOnce]);

  const handleClose = () => {
    setShowModal(false);
  };

  const handleSignUp = () => {
    setShowModal(false);
    navigate("/register");
  };

  const handleLogin = () => {
    setShowModal(false);
    navigate("/login");
  };

  // Don't render anything if user is authenticated
  if (isAuthenticated) {
    return null;
  }

  return (
    <AnimatePresence>
      {showModal && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998]"
            onClick={handleClose}
          />

          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-[9999] pointer-events-none">
            <motion.div
              initial={{ scale: 0.5, opacity: 0, y: 50, rotateX: -15 }}
              animate={{ scale: 1, opacity: 1, y: 0, rotateX: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 20 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 25,
                duration: 0.5,
              }}
              className="relative max-w-lg w-full mx-4 pointer-events-auto"
            >
              {/* Animated rings around modal */}
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.3, 0.6, 0.3],
                  rotate: [0, 180, 360],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "linear",
                }}
                className="absolute inset-0 rounded-3xl border-4 border-cyan-500/30 blur-sm"
              />
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.2, 0.5, 0.2],
                  rotate: [360, 180, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "linear",
                }}
                className="absolute inset-0 rounded-3xl border-4 border-pink-500/30 blur-md"
              />

              {/* Main Modal Content */}
              <div className="relative bg-gradient-to-br from-gray-900 via-purple-900/50 to-gray-900 rounded-3xl border border-cyan-500/30 shadow-2xl overflow-hidden">
                {/* Animated Background Elements */}
                <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
                <motion.div
                  animate={{
                    x: [0, 100, 0],
                    y: [0, -50, 0],
                    scale: [1, 1.2, 1],
                  }}
                  transition={{ duration: 8, repeat: Infinity }}
                  className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl"
                />
                <motion.div
                  animate={{
                    x: [0, -100, 0],
                    y: [0, 50, 0],
                    scale: [1, 1.3, 1],
                  }}
                  transition={{ duration: 10, repeat: Infinity }}
                  className="absolute bottom-0 left-0 w-64 h-64 bg-pink-500/20 rounded-full blur-3xl"
                />

                {/* Close Button */}
                <button
                  onClick={handleClose}
                  className="absolute top-4 right-4 z-10 text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full"
                >
                  <X size={24} />
                </button>

                {/* Content */}
                <div className="relative z-10 p-8 text-center">
                  {/* Animated Icon */}
                  <motion.div
                    animate={{
                      rotate: [0, 10, -10, 0],
                      y: [0, -10, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatType: "reverse",
                    }}
                    className="inline-flex items-center justify-center w-20 h-20 mb-6 rounded-2xl bg-gradient-to-br from-cyan-500 to-pink-500 shadow-2xl shadow-cyan-500/50"
                  >
                    <Trophy className="w-10 h-10 text-white" />
                  </motion.div>

                  {/* Sparkles */}
                  <div className="absolute top-8 left-8">
                    <motion.div
                      animate={{
                        scale: [1, 1.5, 1],
                        opacity: [0.5, 1, 0.5],
                      }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <Sparkles className="w-6 h-6 text-yellow-400" />
                    </motion.div>
                  </div>
                  <div className="absolute top-8 right-16">
                    <motion.div
                      animate={{
                        scale: [1, 1.5, 1],
                        opacity: [0.5, 1, 0.5],
                      }}
                      transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                    >
                      <Star className="w-5 h-5 text-cyan-400" />
                    </motion.div>
                  </div>

                  {/* Title - Different messages based on variant */}
                  <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-3xl md:text-4xl font-bold mb-4"
                  >
                    <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                      {modalVariant === 0 && "Join the Action! 🎮"}
                      {modalVariant === 1 && "Don't Miss Out! 🏆"}
                      {modalVariant === 2 && "Level Up Your Game! ⚡"}
                    </span>
                  </motion.h2>

                  {/* Description - Different messages based on variant */}
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-gray-300 text-lg mb-6"
                  >
                    {modalVariant === 0 &&
                      "Create an account to unlock exclusive tournaments, win amazing prizes, and compete with the best gamers!"}
                    {modalVariant === 1 &&
                      "Join 500K+ gamers competing in daily tournaments. Sign up now and get instant access to exclusive features!"}
                    {modalVariant === 2 &&
                      "Ready to dominate? Register now to participate in live tournaments, build fantasy teams, and climb the leaderboard!"}
                  </motion.p>

                  {/* Features */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="grid grid-cols-3 gap-4 mb-8"
                  >
                    <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-3">
                      <Trophy className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
                      <p className="text-cyan-400 text-xs font-semibold">
                        20+ Tournaments
                      </p>
                    </div>
                    <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-3">
                      <Crown className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                      <p className="text-purple-400 text-xs font-semibold">
                        Real Prizes
                      </p>
                    </div>
                    <div className="bg-pink-500/10 border border-pink-500/30 rounded-xl p-3">
                      <Zap className="w-6 h-6 text-pink-400 mx-auto mb-2" />
                      <p className="text-pink-400 text-xs font-semibold">
                        Instant Play
                      </p>
                    </div>
                  </motion.div>

                  {/* Action Buttons */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="flex flex-col sm:flex-row gap-3"
                  >
                    <motion.button
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleSignUp}
                      className="flex-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 hover:from-cyan-400 hover:via-purple-400 hover:to-pink-400 text-white font-bold py-4 px-6 rounded-xl shadow-lg shadow-cyan-500/50 transition-all flex items-center justify-center gap-2 group"
                    >
                      <span>Sign Up Free</span>
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleLogin}
                      className="flex-1 bg-white/10 hover:bg-white/20 backdrop-blur-lg text-white font-bold py-4 px-6 rounded-xl border-2 border-white/30 hover:border-white/50 transition-all"
                    >
                      Login
                    </motion.button>
                  </motion.div>

                  {/* Bottom Text */}
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="text-gray-400 text-sm mt-4"
                  >
                    No credit card required • Join 500K+ gamers
                  </motion.p>
                </div>

                {/* Glowing Border Effect */}
                <motion.div
                  animate={{
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="absolute inset-0 rounded-3xl border-2 border-cyan-500/50 pointer-events-none"
                />
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AuthPromptModal;
