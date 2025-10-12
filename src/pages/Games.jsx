import { motion } from "framer-motion";
import { Gamepad2, Users, Trophy } from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchTournaments } from "../store/slices/tournamentSlice";
import { Link } from "react-router-dom";

export default function Games() {
  const dispatch = useDispatch();
  const { items: tournaments, loading } = useSelector(state => state.tournaments);
  const [gameStats, setGameStats] = useState([]);

  useEffect(() => {
    dispatch(fetchTournaments());
  }, [dispatch]);

  useEffect(() => {
    if (Array.isArray(tournaments)) {
      // Calculate stats for each game
      const gameMap = {};
      
      tournaments.forEach(tournament => {
        const gameName = tournament.game || 'unknown';
        const gameKey = gameName.toLowerCase().replace(/[^a-z0-9]/g, '_');
        
        if (!gameMap[gameKey]) {
          gameMap[gameKey] = {
            name: formatGameName(gameName),
            key: gameKey,
            tournaments: 0,
            players: 0,
            image: getGameImage(gameName)
          };
        }
        
        gameMap[gameKey].tournaments += 1;
        gameMap[gameKey].players += tournament.current_participants || 0;
      });
      
      setGameStats(Object.values(gameMap));
    }
  }, [tournaments]);

  const formatGameName = (gameName) => {
    const gameNames = {
      'bgmi': 'BGMI',
      'free_fire': 'Free Fire',
      'valorant': 'Valorant',
      'cod_mobile': 'COD Mobile',
      'fortnite': 'Fortnite',
      'apex_legends': 'Apex Legends'
    };
    return gameNames[gameName.toLowerCase().replace(/[^a-z0-9]/g, '_')] || gameName.toUpperCase();
  };

  const getGameImage = (gameName) => {
    return `https://via.placeholder.com/400x200?text=${encodeURIComponent(formatGameName(gameName))}`;
  };

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

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
            <span className="ml-3 text-gray-400">Loading games...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {gameStats.length > 0 ? gameStats.map((game, index) => (
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
                    <span>{game.players} Active Players</span>
                  </div>
                  <div className="flex items-center gap-2 text-cyan-400">
                    <Trophy className="w-4 h-4" />
                    <span>{game.tournaments} Tournaments</span>
                  </div>
                </div>
                
                <Link to={`/tournaments?game=${game.key}`}>
                  <button className="w-full bg-gradient-to-r from-cyan-500 to-pink-500 text-white py-3 rounded-lg font-bold hover:from-cyan-600 hover:to-pink-600 transition-all">
                    View Tournaments
                  </button>
                </Link>
              </div>
            </motion.div>
            )) : (
              <div className="col-span-full text-center py-12">
                <Gamepad2 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-400 mb-2">
                  No games available
                </h3>
                <p className="text-gray-500">
                  Create tournaments to see games here
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}