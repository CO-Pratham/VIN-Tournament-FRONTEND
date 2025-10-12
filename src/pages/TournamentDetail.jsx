import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Calendar,
  Users,
  Trophy,
  Clock,
  MapPin,
  DollarSign,
  User,
  Shield,
  Target,
  Award,
  Share2,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useDispatch, useSelector } from "react-redux";
import { fetchTournamentById, joinTournament, leaveTournament } from "../store/slices/tournamentSlice";
import toast from "react-hot-toast";

export default function TournamentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const dispatch = useDispatch();
  const { items: tournaments, currentTournament, loading } = useSelector((state) => state.tournaments);
  
  const tournament = currentTournament || tournaments.find(t => t.id === id);
  const [isJoining, setIsJoining] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinData, setJoinData] = useState({
    ingame_uid: '',
    tier: '',
    team_name: ''
  });
  
  // Debug tournament data
  console.log('Tournament data:', tournament);
  console.log('Current user:', currentUser);

  useEffect(() => {
    dispatch(fetchTournamentById(id));
  }, [id, dispatch]);

  const handleJoinClick = () => {
    if (!currentUser) {
      toast.error("Please login to join tournaments");
      return;
    }
    setShowJoinModal(true);
  };

  const handleJoinTournament = async () => {
    if (!joinData.ingame_uid.trim()) {
      toast.error("Please enter your in-game UID");
      return;
    }

    setIsJoining(true);
    try {
      await dispatch(joinTournament({ 
        tournamentId: tournament.id, 
        joinData 
      })).unwrap();
      await dispatch(fetchTournamentById(id));
      setShowJoinModal(false);
      setJoinData({ ingame_uid: '', tier: '', team_name: '' });
      toast.success('Successfully joined tournament!');
    } catch (error) {
      console.error('Join tournament error:', error);
      toast.error(error.message || 'Failed to join tournament');
    } finally {
      setIsJoining(false);
    }
  };

  const handleWithdrawTournament = async () => {
    if (!confirm("Are you sure you want to withdraw from this tournament? Your entry fee will be refunded in 3-4 working days.")) {
      return;
    }

    setIsJoining(true);
    try {
      await dispatch(leaveTournament(tournament.id)).unwrap();
      await dispatch(fetchTournamentById(id));
      toast.success('Tournament withdrawal successful! Your entry fee of ₹' + tournament.entry_fee + ' will be refunded to your account within 3-4 working days.');
    } catch (error) {
      console.error('Withdraw tournament error:', error);
      toast.error(error.message || 'Failed to withdraw from tournament');
    } finally {
      setIsJoining(false);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Tournament link copied to clipboard!");
  };

  if (!tournament) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-black">
        <div className="text-center text-white">
          <h2 className="text-2xl font-bold mb-4">Tournament Not Found</h2>
          <button onClick={() => navigate('/tournaments')} className="bg-cyan-500 px-6 py-2 rounded-lg">
            Back to Tournaments
          </button>
        </div>
      </div>
    );
  }

  const isCreator = currentUser?.id === tournament?.created_by?.id;
  const isParticipant = tournament?.participants?.some(p => p.id === currentUser?.id) || false;
  const canJoin = tournament?.status === 'upcoming' && 
                  tournament?.current_participants < tournament?.max_participants && 
                  !isParticipant && !isCreator;
  
  console.log('Join status:', { 
    isCreator, 
    isParticipant, 
    canJoin, 
    currentUserId: currentUser?.id,
    creatorId: tournament?.created_by?.id,
    participants: tournament?.participants,
    status: tournament?.status,
    currentCount: tournament?.current_participants,
    maxCount: tournament?.max_participants
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'upcoming': return 'text-blue-400 bg-blue-400/10';
      case 'live': return 'text-green-400 bg-green-400/10';
      case 'completed': return 'text-gray-400 bg-gray-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black pt-20 pb-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-8"
        >
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-white" />
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Tournament Details</h1>
          <button
            onClick={handleShare}
            className="ml-auto p-2 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 transition-colors"
          >
            <Share2 className="w-6 h-6 text-white" />
          </button>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tournament Banner */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-cyan-500/20 to-pink-500/20 border border-gray-800"
            >
              {tournament.banner_url && (
                <img
                  src={tournament.banner_url}
                  alt={tournament.title}
                  className="w-full h-64 object-cover"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(tournament.status)}`}>
                    {tournament.status.charAt(0).toUpperCase() + tournament.status.slice(1)}
                  </span>
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-purple-500/20 text-purple-400">
                    {tournament.game}
                  </span>
                </div>
                <h2 className="text-3xl font-bold text-white mb-2">{tournament.title}</h2>
                <p className="text-gray-300">{tournament.description}</p>
              </div>
            </motion.div>

            {/* Tournament Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gray-900/50 backdrop-blur-lg border border-gray-800 rounded-xl p-6"
            >
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Shield className="w-6 h-6 text-cyan-400" />
                Tournament Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-cyan-400" />
                  <div>
                    <p className="text-gray-400 text-sm">Start Date</p>
                    <p className="text-white font-medium">
                      {new Date(tournament.start_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-cyan-400" />
                  <div>
                    <p className="text-gray-400 text-sm">Registration Deadline</p>
                    <p className="text-white font-medium">
                      {new Date(tournament.registration_deadline).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-cyan-400" />
                  <div>
                    <p className="text-gray-400 text-sm">Participants</p>
                    <p className="text-white font-medium">
                      {tournament.current_participants} / {tournament.max_participants}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <DollarSign className="w-5 h-5 text-cyan-400" />
                  <div>
                    <p className="text-gray-400 text-sm">Entry Fee</p>
                    <p className="text-white font-medium">₹{tournament.entry_fee}</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Rules */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gray-900/50 backdrop-blur-lg border border-gray-800 rounded-xl p-6"
            >
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Target className="w-6 h-6 text-cyan-400" />
                Tournament Rules
              </h3>
              <div className="text-gray-300 whitespace-pre-line">
                {tournament.rules}
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Prize Pool */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-xl p-6 text-center"
            >
              <Trophy className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Prize Pool</h3>
              <p className="text-3xl font-bold text-yellow-400">₹{tournament.prize_pool}</p>
            </motion.div>

            {/* Creator Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gray-900/50 backdrop-blur-lg border border-gray-800 rounded-xl p-6"
            >
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-cyan-400" />
                Tournament Creator
              </h3>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-cyan-400 to-pink-500 flex items-center justify-center">
                  <span className="text-white font-bold">
                    {tournament.created_by?.username?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-white font-medium">{tournament.created_by?.username}</p>
                  <p className="text-gray-400 text-sm">Tournament Organizer</p>
                </div>
              </div>
            </motion.div>

            {/* Action Button */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              {isCreator ? (
                <div className="bg-green-500/20 border border-green-500/30 rounded-xl p-4 text-center">
                  <Award className="w-8 h-8 text-green-400 mx-auto mb-2" />
                  <p className="text-green-400 font-medium">You created this tournament</p>
                </div>
              ) : isParticipant ? (
                <div className="space-y-3">
                  <div className="bg-blue-500/20 border border-blue-500/30 rounded-xl p-4 text-center">
                    <Users className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                    <p className="text-blue-400 font-medium">You're participating</p>
                  </div>
                  <button
                    onClick={handleWithdrawTournament}
                    disabled={isJoining}
                    className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white font-bold py-3 px-6 rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-300 disabled:opacity-50"
                  >
                    {isJoining ? "Processing..." : "Withdraw from Tournament"}
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleJoinClick}
                  disabled={!currentUser || tournament.status !== 'upcoming' || tournament.current_participants >= tournament.max_participants}
                  className="w-full bg-gradient-to-r from-cyan-500 to-pink-500 text-white font-bold py-4 px-6 rounded-xl hover:from-cyan-600 hover:to-pink-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {!currentUser ? "Please login to join" :
                   tournament.status !== 'upcoming' ? "Registration closed" :
                   tournament.current_participants >= tournament.max_participants ? "Tournament full" :
                   `Join Tournament - ₹${tournament.entry_fee}`}
                </button>
              )}
            </motion.div>

            {/* Participants List */}
            {tournament.participants && tournament.participants.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-gray-900/50 backdrop-blur-lg border border-gray-800 rounded-xl p-6"
              >
                <h3 className="text-lg font-bold text-white mb-4">Participants</h3>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {tournament.participants.map((participant, index) => (
                    <div key={participant.id} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-400 to-pink-500 flex items-center justify-center text-xs font-bold text-white">
                        {index + 1}
                      </div>
                      <span className="text-gray-300">{participant.username}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Join Tournament Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-900 border border-gray-800 rounded-xl p-6 w-full max-w-md"
          >
            <h3 className="text-xl font-bold text-white mb-4">Join Tournament</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  In-Game UID *
                </label>
                <input
                  type="text"
                  value={joinData.ingame_uid}
                  onChange={(e) => setJoinData({...joinData, ingame_uid: e.target.value})}
                  placeholder="Enter your in-game UID"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Current Tier/Rank
                </label>
                <input
                  type="text"
                  value={joinData.tier}
                  onChange={(e) => setJoinData({...joinData, tier: e.target.value})}
                  placeholder="e.g., Diamond, Conqueror, etc."
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Team Name (Optional)
                </label>
                <input
                  type="text"
                  value={joinData.team_name}
                  onChange={(e) => setJoinData({...joinData, team_name: e.target.value})}
                  placeholder="Enter team name if applicable"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowJoinModal(false)}
                className="flex-1 bg-gray-700 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleJoinTournament}
                disabled={isJoining || !joinData.ingame_uid.trim()}
                className="flex-1 bg-gradient-to-r from-cyan-500 to-pink-500 text-white py-2 px-4 rounded-lg hover:from-cyan-600 hover:to-pink-600 transition-all disabled:opacity-50"
              >
                {isJoining ? "Joining..." : "Join Tournament"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}