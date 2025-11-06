import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import { Trophy, Calendar, Users, DollarSign, Gamepad2, Clock, MapPin, FileText, Upload, X } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { createTournament } from "../store/slices/tournamentSlice";
import toast from "react-hot-toast";


export default function CreateTournament() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentUser } = useAuth();
  const { actionLoading } = useSelector((state) => state.tournaments);
  
  const [formData, setFormData] = useState({
    title: "",
    game: "BGMI",
    mode: "Squad",
    entryFee: "",
    prize: "",
    maxParticipants: "",
    date: "",
    time: "",
    map: "Erangel",
    description: "",
    rules: "",
    platform: "Mobile",
  });

  const [bannerImage, setBannerImage] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);

  const games = ["BGMI", "Free Fire", "Valorant", "COD Mobile", "Fortnite", "Apex Legends"];
  const modes = {
    "BGMI": ["Solo", "Duo", "Squad"],
    "Free Fire": ["Solo", "Duo", "Squad"],
    "Valorant": ["5v5", "Team Deathmatch"],
    "COD Mobile": ["Solo", "Duo", "Squad", "5v5"],
    "Fortnite": ["Solo", "Duo", "Squad"],
    "Apex Legends": ["Solo", "Duo", "Trio"],
  };
  const maps = {
    "BGMI": ["Erangel", "Miramar", "Sanhok", "Vikendi"],
    "Free Fire": ["Bermuda", "Purgatory", "Kalahari"],
    "Valorant": ["Bind", "Haven", "Split", "Ascent"],
    "COD Mobile": ["Crossfire", "Standoff", "Nuketown"],
    "Fortnite": ["Battle Royale Island"],
    "Apex Legends": ["Kings Canyon", "World's Edge"],
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }
      setBannerImage(file);
      const reader = new FileReader();
      reader.onload = (e) => setBannerPreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const removeBannerImage = () => {
    setBannerImage(null);
    setBannerPreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!currentUser) {
      toast.error("Please login to create a tournament");
      navigate("/login");
      return;
    }

    if (!formData.title || !formData.game || !formData.date || !formData.time) {
      toast.error("Please fill all required fields");
      return;
    }

    if (parseInt(formData.entryFee) < 0 || parseInt(formData.prize) < 0 || parseInt(formData.maxParticipants) <= 0) {
      toast.error("Please enter valid numbers");
      return;
    }



    const tournamentDateTime = new Date(`${formData.date}T${formData.time}`);

    const tournamentData = {
      title: formData.title,
      game_type: formData.game,
      tournament_type: formData.mode,
      entry_fee: parseInt(formData.entryFee) || 0,
      prize_pool: parseInt(formData.prize) || 0,
      max_participants: parseInt(formData.maxParticipants) || 100,
      start_date: tournamentDateTime.toISOString(),
      end_date: tournamentDateTime.toISOString(),
      registration_deadline: tournamentDateTime.toISOString(),
      description: formData.description,
      rules: formData.rules,
    };



    try {
      await dispatch(createTournament({ tournamentData, bannerFile: bannerImage })).unwrap();
      navigate("/tournaments");
    } catch (error) {
      console.error("Error creating tournament:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black pt-24 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Create <span className="text-transparent bg-gradient-to-r from-cyan-400 to-pink-500 bg-clip-text">Tournament</span>
          </h1>
          <p className="text-gray-400 text-lg">
            Set up your gaming tournament and invite players to compete
          </p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onSubmit={handleSubmit}
          className="bg-gray-900/50 backdrop-blur-lg border border-gray-800 rounded-2xl p-6 md:p-8 space-y-6"
        >
          {/* Banner Image Upload */}
          <div>
            <label className="flex items-center gap-2 text-white font-semibold mb-2">
              <Upload className="w-5 h-5 text-purple-400" />
              Tournament Banner
            </label>
            {bannerPreview ? (
              <div className="relative">
                <img
                  src={bannerPreview}
                  alt="Banner preview"
                  className="w-full h-48 object-cover rounded-lg border border-gray-700"
                />
                <button
                  type="button"
                  onClick={removeBannerImage}
                  className="absolute top-2 right-2 p-1 bg-red-500 hover:bg-red-600 rounded-full transition-colors"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-700 rounded-lg p-8 text-center hover:border-gray-600 transition-colors">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400 mb-2">Click to upload tournament banner</p>
                <p className="text-gray-500 text-sm">PNG, JPG up to 5MB</p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
            )}
          </div>

          {/* Tournament Title */}
          <div>
            <label className="flex items-center gap-2 text-white font-semibold mb-2">
              <Trophy className="w-5 h-5 text-yellow-400" />
              Tournament Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="e.g., BGMI Pro Championship 2025"
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
              required
            />
          </div>

          {/* Game and Mode */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="flex items-center gap-2 text-white font-semibold mb-2">
                <Gamepad2 className="w-5 h-5 text-cyan-400" />
                Game *
              </label>
              <select
                name="game"
                value={formData.game}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                required
              >
                {games.map((game) => (
                  <option key={game} value={game}>{game}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="flex items-center gap-2 text-white font-semibold mb-2">
                <Users className="w-5 h-5 text-pink-400" />
                Mode *
              </label>
              <select
                name="mode"
                value={formData.mode}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                required
              >
                {modes[formData.game]?.map((mode) => (
                  <option key={mode} value={mode}>{mode}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Entry Fee and Prize */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="flex items-center gap-2 text-white font-semibold mb-2">
                <DollarSign className="w-5 h-5 text-green-400" />
                Entry Fee (₹)
              </label>
              <input
                type="number"
                name="entryFee"
                value={formData.entryFee}
                onChange={handleInputChange}
                placeholder="50"
                min="0"
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-white font-semibold mb-2">
                <Trophy className="w-5 h-5 text-yellow-400" />
                Prize Pool (₹)
              </label>
              <input
                type="number"
                name="prize"
                value={formData.prize}
                onChange={handleInputChange}
                placeholder="5000"
                min="0"
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Date and Time */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="flex items-center gap-2 text-white font-semibold mb-2">
                <Calendar className="w-5 h-5 text-purple-400" />
                Date *
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                required
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-white font-semibold mb-2">
                <Clock className="w-5 h-5 text-orange-400" />
                Time *
              </label>
              <input
                type="time"
                name="time"
                value={formData.time}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                required
              />
            </div>
          </div>

          {/* Max Participants and Map */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="flex items-center gap-2 text-white font-semibold mb-2">
                <Users className="w-5 h-5 text-blue-400" />
                Max Participants
              </label>
              <input
                type="number"
                name="maxParticipants"
                value={formData.maxParticipants}
                onChange={handleInputChange}
                placeholder="100"
                min="2"
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-white font-semibold mb-2">
                <MapPin className="w-5 h-5 text-red-400" />
                Map
              </label>
              <select
                name="map"
                value={formData.map}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
              >
                {maps[formData.game]?.map((map) => (
                  <option key={map} value={map}>{map}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="flex items-center gap-2 text-white font-semibold mb-2">
              <FileText className="w-5 h-5 text-indigo-400" />
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe your tournament..."
              rows="4"
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all resize-none"
            />
          </div>

          {/* Rules */}
          <div>
            <label className="flex items-center gap-2 text-white font-semibold mb-2">
              <FileText className="w-5 h-5 text-yellow-400" />
              Tournament Rules
            </label>
            <textarea
              name="rules"
              value={formData.rules}
              onChange={handleInputChange}
              placeholder="1. No cheating or hacking&#10;2. Respect all players&#10;3. Follow tournament schedule..."
              rows="6"
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all resize-none"
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <motion.button
              type="button"
              onClick={() => navigate("/tournaments")}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-all"
            >
              Cancel
            </motion.button>
            <motion.button
              type="submit"
              disabled={actionLoading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-500 to-pink-500 hover:from-cyan-400 hover:to-pink-400 text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {actionLoading ? "Creating..." : "Create Tournament"}
            </motion.button>
          </div>
        </motion.form>
      </div>
    </div>
  );
}
