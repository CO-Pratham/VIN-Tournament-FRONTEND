import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Trophy, Calendar, Users, DollarSign, Gamepad2, Clock, 
  MapPin, FileText, AlertCircle, Check, X, CreditCard 
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { tournamentService } from "../services/tournamentService";
import toast from "react-hot-toast";


export default function JoinTournament() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [tournament, setTournament] = useState(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [showRules, setShowRules] = useState(true);
  const [agreedToRules, setAgreedToRules] = useState(false);
  const [participantCount, setParticipantCount] = useState(0);

  useEffect(() => {
    fetchTournament();
  }, [id]);

  const fetchTournament = async () => {
    try {
      const data = await tournamentService.getTournamentById(id);
      setTournament(data);
      setParticipantCount(data.participants?.length || 0);
    } catch (error) {
      console.error("Error fetching tournament:", error);
      toast.error("Failed to load tournament");
      navigate("/tournaments");
    } finally {
      setLoading(false);
    }
  };

  const handleJoinTournament = () => {
    if (!currentUser) {
      toast.error("Please login to join tournament");
      navigate("/login");
      return;
    }

    if (!agreedToRules) {
      toast.error("Please accept the tournament rules");
      return;
    }

    if (tournament.entry_fee > 0) {
      setShowPayment(true);
    } else {
      completeTournamentJoin();
    }
  };

  const completeTournamentJoin = async () => {
    setJoining(true);
    try {
      await tournamentService.joinTournament(tournament.id, currentUser.uid);
      toast.success("Successfully joined tournament!");
      navigate("/tournaments");
    } catch (error) {
      console.error("Error joining tournament:", error);
      if (error.message?.includes("duplicate")) {
        toast.error("You have already joined this tournament");
      } else {
        toast.error("Failed to join tournament");
      }
    } finally {
      setJoining(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-black">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
          <span className="text-gray-400">Loading tournament...</span>
        </div>
      </div>
    );
  }

  if (!tournament) {
    return null;
  }

  const tournamentDate = new Date(tournament.date);
  const spotsLeft = tournament.max_participants - participantCount;

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black pt-24 pb-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {tournament.title}
          </h1>
          <div className="flex items-center justify-center gap-4 text-gray-400">
            <span className={`px-4 py-1 rounded-full text-sm font-semibold ${
              tournament.status === 'upcoming' ? 'bg-green-500/20 text-green-400' :
              tournament.status === 'live' ? 'bg-red-500/20 text-red-400' :
              'bg-gray-500/20 text-gray-400'
            }`}>
              {tournament.status.toUpperCase()}
            </span>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tournament Details */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gray-900/50 backdrop-blur-lg border border-gray-800 rounded-2xl p-6"
            >
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <Trophy className="w-6 h-6 text-yellow-400" />
                Tournament Details
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="flex items-center gap-3">
                  <Gamepad2 className="w-5 h-5 text-cyan-400" />
                  <div>
                    <p className="text-gray-400 text-sm">Game</p>
                    <p className="text-white font-semibold">{tournament.game}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-pink-400" />
                  <div>
                    <p className="text-gray-400 text-sm">Mode</p>
                    <p className="text-white font-semibold">{tournament.mode}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-purple-400" />
                  <div>
                    <p className="text-gray-400 text-sm">Date</p>
                    <p className="text-white font-semibold">
                      {tournamentDate.toLocaleDateString('en-IN', { 
                        day: 'numeric', 
                        month: 'long', 
                        year: 'numeric' 
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-orange-400" />
                  <div>
                    <p className="text-gray-400 text-sm">Time</p>
                    <p className="text-white font-semibold">
                      {tournamentDate.toLocaleTimeString('en-IN', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-red-400" />
                  <div>
                    <p className="text-gray-400 text-sm">Map</p>
                    <p className="text-white font-semibold">{tournament.map || 'TBD'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-blue-400" />
                  <div>
                    <p className="text-gray-400 text-sm">Participants</p>
                    <p className="text-white font-semibold">
                      {participantCount} / {tournament.max_participants}
                    </p>
                  </div>
                </div>
              </div>

              {tournament.description && (
                <div className="mt-6 pt-6 border-t border-gray-700">
                  <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-indigo-400" />
                    Description
                  </h3>
                  <p className="text-gray-400">{tournament.description}</p>
                </div>
              )}
            </motion.div>

            {/* Tournament Rules */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gray-900/50 backdrop-blur-lg border border-gray-800 rounded-2xl p-6"
            >
              <div 
                className="flex items-center justify-between cursor-pointer"
                onClick={() => setShowRules(!showRules)}
              >
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <FileText className="w-6 h-6 text-yellow-400" />
                  Tournament Rules
                </h2>
                <motion.div
                  animate={{ rotate: showRules ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <AlertCircle className="w-5 h-5 text-gray-400" />
                </motion.div>
              </div>

              {showRules && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 pt-4 border-t border-gray-700"
                >
                  {tournament.rules ? (
                    <div className="space-y-2 text-gray-300 whitespace-pre-line">
                      {tournament.rules}
                    </div>
                  ) : (
                    <div className="space-y-2 text-gray-300">
                      <p>• No cheating, hacking, or use of third-party tools</p>
                      <p>• Respect all players and tournament officials</p>
                      <p>• Follow the tournament schedule strictly</p>
                      <p>• Any form of toxicity will result in disqualification</p>
                      <p>• Organizer's decision is final</p>
                      <p>• Teams must be ready 15 minutes before match time</p>
                      <p>• Screenshots required for disputes</p>
                    </div>
                  )}
                  
                  <div className="mt-6 flex items-start gap-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                    <input
                      type="checkbox"
                      id="agreeRules"
                      checked={agreedToRules}
                      onChange={(e) => setAgreedToRules(e.target.checked)}
                      className="mt-1 w-5 h-5 rounded border-gray-600 bg-gray-800 text-cyan-500 focus:ring-2 focus:ring-cyan-500"
                    />
                    <label htmlFor="agreeRules" className="text-gray-300 cursor-pointer">
                      I have read and agree to follow all tournament rules and regulations
                    </label>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Prize & Entry Fee */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-yellow-500/10 to-pink-500/10 border border-yellow-500/30 rounded-2xl p-6"
            >
              <div className="text-center mb-4">
                <Trophy className="w-12 h-12 text-yellow-400 mx-auto mb-3" />
                <h3 className="text-gray-400 text-sm mb-1">Prize Pool</h3>
                <p className="text-4xl font-bold text-white">₹{tournament.prize?.toLocaleString()}</p>
              </div>

              <div className="border-t border-gray-700 pt-4 mt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400">Entry Fee</span>
                  <span className="text-white font-semibold">₹{tournament.entry_fee || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Spots Left</span>
                  <span className={`font-semibold ${spotsLeft <= 10 ? 'text-red-400' : 'text-green-400'}`}>
                    {spotsLeft}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Join Button */}
            {!showPayment ? (
              <motion.button
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                onClick={handleJoinTournament}
                disabled={!agreedToRules || spotsLeft === 0 || joining}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-gradient-to-r from-cyan-500 to-pink-500 hover:from-cyan-400 hover:to-pink-400 text-white font-bold py-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {joining ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Joining...
                  </>
                ) : (
                  <>
                    <Check className="w-5 h-5" />
                    {tournament.entry_fee > 0 ? 'Proceed to Payment' : 'Join Tournament'}
                  </>
                )}
              </motion.button>
            ) : (
              <PaymentSection 
                tournament={tournament}
                onSuccess={completeTournamentJoin}
                onCancel={() => setShowPayment(false)}
              />
            )}

            {/* Warning */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-red-500/10 border border-red-500/30 rounded-xl p-4"
            >
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-gray-300">
                  <p className="font-semibold text-red-400 mb-1">Important</p>
                  <p>Make sure you're available at the scheduled time. Late entries may result in disqualification.</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PaymentSection({ tournament, onSuccess, onCancel }) {
  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [processing, setProcessing] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState({
    upiId: "",
    cardNumber: "",
    cardExpiry: "",
    cardCvv: "",
  });

  const handlePayment = async (e) => {
    e.preventDefault();
    setProcessing(true);

    setTimeout(() => {
      toast.success("Payment successful!");
      setProcessing(false);
      onSuccess();
    }, 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-gray-900/50 backdrop-blur-lg border border-gray-800 rounded-2xl p-6 space-y-4"
    >
      <h3 className="text-xl font-bold text-white flex items-center gap-2">
        <CreditCard className="w-5 h-5 text-cyan-400" />
        Payment
      </h3>

      <div className="space-y-3">
        <div className="flex gap-3">
          <button
            onClick={() => setPaymentMethod("upi")}
            className={`flex-1 py-2 rounded-lg font-semibold transition-all ${
              paymentMethod === "upi"
                ? "bg-cyan-500 text-white"
                : "bg-gray-800 text-gray-400"
            }`}
          >
            UPI
          </button>
          <button
            onClick={() => setPaymentMethod("card")}
            className={`flex-1 py-2 rounded-lg font-semibold transition-all ${
              paymentMethod === "card"
                ? "bg-cyan-500 text-white"
                : "bg-gray-800 text-gray-400"
            }`}
          >
            Card
          </button>
        </div>

        <form onSubmit={handlePayment} className="space-y-3">
          {paymentMethod === "upi" ? (
            <input
              type="text"
              placeholder="Enter UPI ID (e.g., name@upi)"
              value={paymentDetails.upiId}
              onChange={(e) => setPaymentDetails({...paymentDetails, upiId: e.target.value})}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              required
            />
          ) : (
            <>
              <input
                type="text"
                placeholder="Card Number"
                value={paymentDetails.cardNumber}
                onChange={(e) => setPaymentDetails({...paymentDetails, cardNumber: e.target.value})}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                required
                maxLength="16"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="MM/YY"
                  value={paymentDetails.cardExpiry}
                  onChange={(e) => setPaymentDetails({...paymentDetails, cardExpiry: e.target.value})}
                  className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  required
                  maxLength="5"
                />
                <input
                  type="text"
                  placeholder="CVV"
                  value={paymentDetails.cardCvv}
                  onChange={(e) => setPaymentDetails({...paymentDetails, cardCvv: e.target.value})}
                  className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  required
                  maxLength="3"
                />
              </div>
            </>
          )}

          <div className="bg-gray-800/50 rounded-lg p-3 flex justify-between items-center">
            <span className="text-gray-400">Total Amount</span>
            <span className="text-white font-bold text-lg">₹{tournament.entry_fee}</span>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={processing}
              className="flex-1 py-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-white font-semibold rounded-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {processing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Processing...
                </>
              ) : (
                `Pay ₹${tournament.entry_fee}`
              )}
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
}
