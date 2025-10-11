import { motion } from "framer-motion";
import { Gamepad2, Users, Trophy } from "lucide-react";

export default function Games() {
  const games = [
    { name: "BGMI", image: "/api/placeholder/300/200", players: "50M+", tournaments: 150 },
    { name: "Free Fire", image: "/api/placeholder/300/200", players: "80M+", tournaments: 200 },
    { name: "Valorant", image: "/api/placeholder/300/200", players: "15M+", tournaments: 75 },
    { name: "COD Mobile", image: "/api/placeholder/300/200", players: "35M+", tournaments: 100 },
    { name: "Fortnite", image: "/api/placeholder/300/200", players: "25M+", tournaments: 80 },
    { name: "Apex Legends", image: "/api/placeholder/300/200", players: "12M+", tournaments: 60 }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black pt-20 pb-12 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-white mb-4">Supported Games</h1>
          <p className="text-gray-400 text-lg">Choose your battlefield and dominate the competition</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {games.map((game, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gray-900/50 rounded-xl overflow-hidden border border-gray-800 hover:border-cyan-500/50 transition-all group"
            >
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={`https://via.placeholder.com/400x200?text=${game.name}`}
                  alt={game.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <h3 className="absolute bottom-4 left-4 text-2xl font-bold text-white">{game.name}</h3>
              </div>
              
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2 text-gray-400">
                    <Users className="w-4 h-4" />
                    <span>{game.players} Players</span>
                  </div>
                  <div className="flex items-center gap-2 text-cyan-400">
                    <Trophy className="w-4 h-4" />
                    <span>{game.tournaments} Tournaments</span>
                  </div>
                </div>
                
                <button className="w-full bg-gradient-to-r from-cyan-500 to-pink-500 text-white py-3 rounded-lg font-bold hover:from-cyan-600 hover:to-pink-600 transition-all">
                  View Tournaments
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}