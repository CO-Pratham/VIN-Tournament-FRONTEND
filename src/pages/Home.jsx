import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import NET from "vanta/dist/vanta.net.min";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Trophy, Users, Target, ArrowRight, Gamepad2, DollarSign } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useDispatch, useSelector } from "react-redux";
import { fetchTournaments } from "../store/slices/tournamentSlice";
import TournamentCard from "../components/TournamentCard";

export default function Home() {
  const vantaRef = useRef(null);
  const [vantaEffect, setVantaEffect] = useState(null);
  const { currentUser } = useAuth();
  const dispatch = useDispatch();
  const { items: tournaments, loading } = useSelector(state => state.tournaments);

  useEffect(() => {
    if (!vantaEffect) {
      const effect = NET({
        el: vantaRef.current,
        THREE,
        mouseControls: true,
        touchControls: true,
        minHeight: 200.0,
        minWidth: 200.0,
        scale: 1.0,
        scaleMobile: 1.0,
        color: 0xff005d,
        backgroundColor: 0x000000,
      });
      setVantaEffect(effect);
    }
    return () => {
      if (vantaEffect) vantaEffect.destroy();
    };
  }, [vantaEffect]);

  useEffect(() => {
    dispatch(fetchTournaments());
  }, [dispatch]);

  const featuredTournaments = Array.isArray(tournaments) 
    ? tournaments
        .filter((t) => t.status === "upcoming")
        .sort((a, b) => (b.prize_pool || 0) - (a.prize_pool || 0))
        .slice(0, 3)
    : [];

  console.log('Tournaments data:', tournaments);
  console.log('Featured tournaments:', featuredTournaments);

  const stats = [
    {
      value: Array.isArray(tournaments) ? tournaments.length : 0,
      label: "Active Tournaments",
      icon: Trophy,
      color: "text-yellow-400",
    },
    {
      value: Array.isArray(tournaments) 
        ? tournaments.reduce((sum, t) => sum + (t.current_participants || 0), 0)
        : 0,
      label: "Active Players",
      icon: Users,
      color: "text-cyan-400",
    },
    {
      value: `₹${Array.isArray(tournaments)
        ? Math.floor(tournaments.reduce((sum, t) => sum + (parseFloat(t.prize_pool) || 0), 0)).toLocaleString()
        : '0'}`,
      label: "Total Prize Pool",
      icon: Target,
      color: "text-pink-400",
    },
  ];

  return (
    <div
      ref={vantaRef}
      className="min-h-screen w-full relative text-white overflow-hidden"
    >
      <div className="absolute inset-0 bg-black/70 z-0"></div>

      <section className="relative z-10 flex flex-col justify-center items-center text-center min-h-screen px-4 sm:px-6 lg:px-8">
        <motion.h1
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-extrabold leading-tight"
        >
          Level Up Your <span className="text-pink-500">Game</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2 }}
          className="mt-4 text-base sm:text-lg md:text-xl max-w-2xl text-gray-300 px-4"
        >
          Play. Compete. <span className="text-yellow-400">Earn.</span>
          <br className="hidden sm:block" />
          <span className="block sm:inline">
            Vin Tournament is your gateway to{" "}
          </span>
          <span className="text-cyan-400">eSports</span> & a new earning source.
        </motion.p>
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center w-full max-w-md sm:max-w-none">
          <Link to="/tournaments" className="w-full sm:w-auto">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full sm:w-auto bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-bold text-base sm:text-lg flex items-center justify-center gap-2 transition-all"
            >
              <Trophy size={18} />
              <span className="hidden xs:inline">Join Tournament</span>
              <ArrowRight size={18} />
            </motion.button>
          </Link>
          {!currentUser ? (
            <Link to="/register" className="w-full sm:w-auto">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full sm:w-auto bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-bold text-base sm:text-lg transition-all"
              >
                Get Started
              </motion.button>
            </Link>
          ) : (
            <Link to="/tournaments" className="w-full sm:w-auto">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full sm:w-auto bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-bold text-base sm:text-lg transition-all"
              >
                View Tournaments
              </motion.button>
            </Link>
          )}
        </div>
      </section>

      <section className="relative z-10 py-12 sm:py-16 px-4 sm:px-6 bg-black/80">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8 sm:mb-12"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
              Platform Statistics
            </h2>
            <p className="text-gray-400 text-base sm:text-lg px-4">
              Real-time data from our gaming community
            </p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="bg-gray-900/70 border border-gray-700 rounded-2xl p-6 sm:p-8 text-center group hover:border-cyan-500/50 transition-all"
              >
                <div className="flex items-center justify-center mb-4">
                  <stat.icon
                    className={`${stat.color} w-10 h-10 sm:w-12 sm:h-12 group-hover:scale-110 transition-transform`}
                  />
                </div>
                <div className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 text-white">
                  {stat.value}
                </div>
                <div className="text-gray-400 text-sm sm:text-base">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative z-10 py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Featured <span className="text-yellow-400">Tournaments</span>
            </h2>
            <p className="text-gray-400 text-lg">
              Join the hottest tournaments happening right now
            </p>
          </motion.div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-cyan-500"></div>
              <span className="ml-3 text-gray-400">Loading tournaments...</span>
            </div>
          ) : featuredTournaments.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredTournaments.map((tournament, index) => (
                <TournamentCard key={tournament.id} tournament={tournament} />
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-center py-16"
            >
              <Gamepad2 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-400 mb-2">
                No tournaments available
              </h3>
              <p className="text-gray-500 mb-6">
                Check back soon for exciting tournaments!
              </p>
            </motion.div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 py-16 px-6 bg-black/90">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why Choose <span className="text-cyan-400">VIN Tournament</span>
            </h2>
            <p className="text-gray-400 text-lg">
              Experience the best eSports platform in India
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Trophy,
                title: "Competitive Gaming",
                description: "Join tournaments across multiple popular games",
                color: "text-yellow-400",
                bgGradient: "from-yellow-500/10 to-orange-500/10",
                borderColor: "border-yellow-500/30"
              },
              {
                icon: DollarSign,
                title: "Real Prizes",
                description: "Win real money and exclusive rewards",
                color: "text-green-400",
                bgGradient: "from-green-500/10 to-emerald-500/10",
                borderColor: "border-green-500/30"
              },
              {
                icon: Users,
                title: "Active Community",
                description: "Connect with thousands of gamers",
                color: "text-blue-400",
                bgGradient: "from-blue-500/10 to-cyan-500/10",
                borderColor: "border-blue-500/30"
              },
              {
                icon: Gamepad2,
                title: "Multiple Games",
                description: "BGMI, Free Fire, Valorant & more",
                color: "text-pink-400",
                bgGradient: "from-pink-500/10 to-purple-500/10",
                borderColor: "border-pink-500/30"
              }
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -10, scale: 1.02 }}
                className={`bg-gradient-to-br ${feature.bgGradient} border ${feature.borderColor} rounded-2xl p-6 text-center group hover:shadow-2xl hover:shadow-cyan-500/20 transition-all`}
              >
                <div className="flex justify-center mb-4">
                  <feature.icon className={`w-12 h-12 ${feature.color} group-hover:scale-110 transition-transform`} />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-400 text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="relative z-10 py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              How It <span className="text-pink-500">Works</span>
            </h2>
            <p className="text-gray-400 text-lg">
              Start your journey in 3 simple steps
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Sign Up",
                description: "Create your free account and complete your gaming profile",
                icon: Users
              },
              {
                step: "02",
                title: "Join Tournament",
                description: "Browse and join tournaments for your favorite games",
                icon: Trophy
              },
              {
                step: "03",
                title: "Play & Win",
                description: "Compete with players and win amazing prizes",
                icon: Target
              }
            ].map((step, index) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="relative"
              >
                <div className="bg-gray-900/70 border border-gray-700 rounded-2xl p-8 text-center group hover:border-cyan-500/50 transition-all h-full">
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-cyan-500 to-pink-500 text-white font-bold text-2xl w-12 h-12 rounded-full flex items-center justify-center">
                    {step.step}
                  </div>
                  <div className="mt-6 flex justify-center mb-4">
                    <step.icon className="w-16 h-16 text-cyan-400 group-hover:scale-110 transition-transform" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                  <p className="text-gray-400">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="relative z-10 py-16 px-6 bg-black/90">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              What Gamers <span className="text-yellow-400">Say</span>
            </h2>
            <p className="text-gray-400 text-lg">
              Join thousands of satisfied gamers
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Arjun Sharma",
                game: "BGMI Player",
                rating: 5,
                text: "Amazing platform! Won my first tournament and got paid within 24 hours. Highly recommended!"
              },
              {
                name: "Priya Patel",
                game: "Free Fire Pro",
                rating: 5,
                text: "The tournament organization is top-notch. Fair play and instant support. Love it!"
              },
              {
                name: "Rohit Kumar",
                game: "Valorant Champion",
                rating: 5,
                text: "Best eSports platform in India. Great prizes, smooth gameplay, and active community!"
              }
            ].map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="bg-gray-900/70 border border-gray-700 rounded-2xl p-6 hover:border-cyan-500/50 transition-all"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Trophy key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-300 mb-4 italic">"{testimonial.text}"</p>
                <div className="border-t border-gray-700 pt-4">
                  <p className="text-white font-semibold">{testimonial.name}</p>
                  <p className="text-gray-400 text-sm">{testimonial.game}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-cyan-500/20 to-pink-500/20 border border-cyan-500/30 rounded-3xl p-12 text-center"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Start Your Journey?
            </h2>
            <p className="text-gray-300 text-lg mb-8">
              Join VIN Tournament today and compete with the best gamers
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {!currentUser ? (
                <>
                  <Link to="/register">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-gradient-to-r from-cyan-500 to-pink-500 hover:from-cyan-400 hover:to-pink-400 px-8 py-4 rounded-lg font-bold text-lg transition-all"
                    >
                      Sign Up Now
                    </motion.button>
                  </Link>
                  <Link to="/tournaments">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-white/10 hover:bg-white/20 backdrop-blur-lg px-8 py-4 rounded-lg font-bold text-lg transition-all border border-white/30"
                    >
                      Browse Tournaments
                    </motion.button>
                  </Link>
                </>
              ) : (
                <Link to="/tournaments">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-gradient-to-r from-cyan-500 to-pink-500 hover:from-cyan-400 hover:to-pink-400 px-8 py-4 rounded-lg font-bold text-lg transition-all"
                  >
                    Join Tournament Now
                  </motion.button>
                </Link>
              )}
            </div>
          </motion.div>
        </div>
      </section>


    </div>
  );
}