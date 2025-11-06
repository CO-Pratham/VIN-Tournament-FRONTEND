import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bot, Brain, TrendingUp, Target, Lightbulb, BarChart3, Zap, Star, Upload, FileVideo, CheckCircle, AlertCircle, Clock, Loader2, Lock, Crown } from 'lucide-react';
import { useSelector } from 'react-redux';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export default function AIFeatures() {
  const [activeTab, setActiveTab] = useState('upload');
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedPlayer, setSelectedPlayer] = useState('');
  const [analysisResult, setAnalysisResult] = useState(null);
  const [error, setError] = useState(null);
  const [players, setPlayers] = useState([]);
  const [performanceAnalytics, setPerformanceAnalytics] = useState([]);
  const [gameplayAnalyses, setGameplayAnalyses] = useState([]);
  const [performanceData, setPerformanceData] = useState(null);
  const [skillProfile, setSkillProfile] = useState(null);
  const [tournamentRecommendations, setTournamentRecommendations] = useState([]);
  const [insights, setInsights] = useState(null);

  const { user } = useSelector((state) => state.auth);
  const { isAuthenticated, loading: authLoading, userProfile } = useAuth();

  // Check if user has Legend plan (required for AI features)
  const hasAIAccess = userProfile?.subscription_plan === 'legend';
  const currentPlan = userProfile?.subscription_plan || 'free';

  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      loadPlayers();
      loadPerformanceAnalytics();
    }
  }, [isAuthenticated, authLoading]);

  const loadPlayers = async () => {
    try {
      const response = await api.getAllPlayers();
      setPlayers(response.results || response || []);
    } catch (error) {
      console.error("Error loading players:", error);
    }
  };

  const loadPerformanceAnalytics = async () => {
    try {
      const response = await api.getPerformanceAnalytics();
      setPerformanceAnalytics(response.data?.analytics || []);
    } catch (error) {
      console.error("Error loading analytics:", error);
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file size (50MB limit)
      if (file.size > 50 * 1024 * 1024) {
        setError('File size must be less than 50MB');
        return;
      }

      // Validate file type
      const allowedTypes = ['video/mp4', 'video/avi', 'video/mov', 'video/quicktime'];
      if (!allowedTypes.includes(file.type)) {
        setError('Please select a valid video file (MP4, AVI, MOV)');
        return;
      }

      setSelectedFile(file);
      setError(null);
    }
  };

  const handleVideoUpload = async () => {
    if (!selectedFile) {
      setError('Please select a video file');
      return;
    }

    setLoading(true);
    setError(null);
    setUploadProgress(0);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Use Gemini AI analysis
      const result = await api.analyzeVideoPerformance(selectedFile, selectedPlayer || null);
      
      clearInterval(progressInterval);
      setUploadProgress(100);

      if (result.success) {
        setAnalysisResult(result.data);
        // Refresh analytics if player was specified
        if (selectedPlayer) {
          await loadPerformanceAnalytics();
        }
        // Reset form
        setSelectedFile(null);
        setSelectedPlayer('');
        setUploadProgress(0);
      } else {
        setError(result.message || 'Analysis failed');
      }
    } catch (error) {
      console.error('Analysis error:', error);
      setError('Failed to analyze video. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Show locked state if user doesn't have AI access
  if (!hasAIAccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white p-6 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl w-full"
        >
          <div className="bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 rounded-2xl p-10 border border-purple-500/20 text-center">
            {/* Lock Icon */}
            <div className="mb-6 flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-purple-500/30 blur-2xl rounded-full"></div>
                <div className="relative bg-gray-800 rounded-full p-6">
                  <Lock className="w-16 h-16 text-purple-400" />
                </div>
              </div>
            </div>

            {/* Title */}
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-yellow-400 bg-clip-text text-transparent">
              AI Features Locked
            </h2>

            {/* Description */}
            <p className="text-gray-300 text-lg mb-6">
              Unlock the power of AI-powered gaming intelligence with the <span className="text-yellow-400 font-bold">Ultimate Legend</span> plan
            </p>

            {/* Current Plan */}
            <div className="bg-gray-800/50 rounded-lg p-4 mb-6">
              <p className="text-gray-400 text-sm mb-2">Your Current Plan:</p>
              <div className="inline-flex items-center gap-2 bg-gray-700 px-4 py-2 rounded-full">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                <span className="text-white font-semibold capitalize">
                  {currentPlan === 'free' ? 'Free Warrior' : currentPlan === 'warrior' ? 'Elite Warrior' : currentPlan === 'champion' ? 'Pro Champion' : 'Free'}
                </span>
              </div>
            </div>

            {/* Features List */}
            <div className="bg-gray-800/30 rounded-xl p-6 mb-8 text-left">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Crown className="w-6 h-6 text-yellow-400" />
                Unlock with Ultimate Legend:
              </h3>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-gray-300">
                  <Brain className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <span>AI-Powered Match Predictions</span>
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <Target className="w-5 h-5 text-blue-400 flex-shrink-0" />
                  <span>Personalized Team Recommendations</span>
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <TrendingUp className="w-5 h-5 text-purple-400 flex-shrink-0" />
                  <span>Advanced Performance Analytics</span>
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <Bot className="w-5 h-5 text-cyan-400 flex-shrink-0" />
                  <span>24/7 AI Gaming Coach</span>
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <Zap className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                  <span>Real-time Strategy Insights</span>
                </li>
              </ul>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => window.location.href = '/dashboard'}
                className="px-8 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold rounded-xl hover:scale-105 transition-all duration-300 shadow-lg shadow-yellow-500/20 flex items-center justify-center gap-2"
              >
                <Crown className="w-5 h-5" />
                Upgrade to Legend
              </button>
              <button
                onClick={() => window.history.back()}
                className="px-8 py-4 bg-gray-700 text-white font-bold rounded-xl hover:bg-gray-600 transition-colors"
              >
                Go Back
              </button>
            </div>

            {/* Trust Indicators */}
            <div className="mt-8 flex items-center justify-center gap-6 text-gray-400 text-sm">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-400" />
                <span>Premium Features</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-purple-400" />
                <span>Instant Access</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 via-blue-500 to-purple-500 bg-clip-text text-transparent mb-4">
            🤖 AI-Powered Gaming Intelligence
          </h1>
          <p className="text-gray-400 text-lg">Advanced analytics and personalized recommendations to elevate your game</p>
        </motion.div>

        {/* AI Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <Brain className="text-green-400" size={24} />
              <span className="text-2xl font-bold text-green-400">
                {skillProfile?.overall_skill_rating ? Math.round(skillProfile.overall_skill_rating / 20) : '--'}
              </span>
            </div>
            <h3 className="text-lg font-semibold">AI Performance Score</h3>
            <p className="text-sm text-gray-400">Based on gameplay analysis</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <Target className="text-blue-400" size={24} />
              <span className="text-2xl font-bold text-blue-400">
                {skillProfile?.win_rate ? Math.round(skillProfile.win_rate) : '--'}%
              </span>
            </div>
            <h3 className="text-lg font-semibold">Win Rate</h3>
            <p className="text-sm text-gray-400">Overall performance</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="text-purple-400" size={24} />
              <span className="text-lg font-bold text-purple-400">
                {skillProfile?.skill_level || 'Unranked'}
              </span>
            </div>
            <h3 className="text-lg font-semibold">Skill Level</h3>
            <p className="text-sm text-gray-400">AI-calculated rank</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <Lightbulb className="text-yellow-400" size={24} />
              <span className="text-2xl font-bold text-yellow-400">
                {gameplayAnalyses?.length || 0}
              </span>
            </div>
            <h3 className="text-lg font-semibold">Analyses Complete</h3>
            <p className="text-sm text-gray-400">Gameplay videos analyzed</p>
          </motion.div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-gray-800/50 rounded-lg p-1 mb-8">
          {[
            { id: 'upload', label: 'Upload Gameplay', icon: Upload },
            { id: 'recommendations', label: 'Tournament Recommendations', icon: Bot },
            { id: 'analytics', label: 'Performance Analytics', icon: BarChart3 },
            { id: 'insights', label: 'AI Insights', icon: Lightbulb }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
                activeTab === tab.id
                  ? 'bg-green-500 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'upload' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold mb-6">Upload Gameplay Video for AI Analysis</h2>

              {/* Upload Section */}
              <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-8">
                <div className="text-center">
                  <FileVideo className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Upload Your Gameplay</h3>
                  <p className="text-gray-400 mb-6">
                    Upload a gameplay video (max 50MB) to get AI-powered analysis and insights
                  </p>

                  <div className="space-y-4">
                    <input
                      type="file"
                      accept="video/mp4,video/avi,video/mov,video/quicktime"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="video-upload"
                    />
                    <label
                      htmlFor="video-upload"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 rounded-lg cursor-pointer transition-colors"
                    >
                      <Upload size={20} />
                      Choose Video File
                    </label>

                    {/* Player Selection */}
                    <div className="max-w-md mx-auto">
                      <label className="block text-sm text-gray-400 mb-2">Select Player (Optional)</label>
                      <select
                        value={selectedPlayer}
                        onChange={(e) => setSelectedPlayer(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                      >
                        <option value="">No specific player</option>
                        {players.map((player) => (
                          <option key={player.player_id} value={player.player_id}>
                            {player.name} ({player.position}) - {player.team}
                          </option>
                        ))}
                      </select>
                    </div>

                    {selectedFile && (
                      <div className="bg-gray-800/50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">{selectedFile.name}</span>
                          <span className="text-sm text-gray-400">
                            {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                          </span>
                        </div>

                        {uploadProgress > 0 && (
                          <div className="w-full bg-gray-700 rounded-full h-2 mb-4">
                            <div
                              className="bg-green-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${uploadProgress}%` }}
                            ></div>
                          </div>
                        )}

                        <button
                          onClick={handleVideoUpload}
                          disabled={loading}
                          className="w-full px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-600 rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                          {loading ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Analyzing with Gemini AI...
                            </>
                          ) : (
                            <>
                              <Zap className="w-4 h-4" />
                              Start AI Analysis
                            </>
                          )}
                        </button>
                      </div>
                    )}

                    {/* Error Display */}
                    {error && (
                      <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4 text-red-400 flex items-center gap-2">
                        <AlertCircle className="w-5 h-5" />
                        {error}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* AI Analysis Results */}
              {analysisResult && (
                <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-6">
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <Brain className="text-purple-400" />
                    Gemini AI Analysis Results
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Overall Score */}
                    <div className={`p-6 rounded-xl border ${
                      (analysisResult.overall_score || 75) >= 90 ? 'bg-green-500/20 border-green-500/30' :
                      (analysisResult.overall_score || 75) >= 80 ? 'bg-blue-500/20 border-blue-500/30' :
                      (analysisResult.overall_score || 75) >= 70 ? 'bg-yellow-500/20 border-yellow-500/30' :
                      (analysisResult.overall_score || 75) >= 60 ? 'bg-orange-500/20 border-orange-500/30' :
                      'bg-red-500/20 border-red-500/30'
                    }`}>
                      <div className="flex items-center gap-3 mb-4">
                        <Target className="w-8 h-8 text-purple-400" />
                        <h4 className="text-lg font-semibold text-white">Overall Score</h4>
                      </div>
                      <div className={`text-4xl font-bold ${
                        (analysisResult.overall_score || 75) >= 90 ? 'text-green-400' :
                        (analysisResult.overall_score || 75) >= 80 ? 'text-blue-400' :
                        (analysisResult.overall_score || 75) >= 70 ? 'text-yellow-400' :
                        (analysisResult.overall_score || 75) >= 60 ? 'text-orange-400' :
                        'text-red-400'
                      }`}>
                        {analysisResult.overall_score || 75}
                      </div>
                      <p className="text-gray-400 text-sm mt-2">Performance Rating</p>
                    </div>

                    {/* Performance Metrics */}
                    {analysisResult.performance_metrics && Object.keys(analysisResult.performance_metrics).length > 0 && (
                      <div className="p-6 bg-gray-800/50 rounded-xl border border-gray-700">
                        <div className="flex items-center gap-3 mb-4">
                          <BarChart3 className="w-8 h-8 text-blue-400" />
                          <h4 className="text-lg font-semibold text-white">Metrics</h4>
                        </div>
                        <div className="space-y-2">
                          {Object.entries(analysisResult.performance_metrics).map(([key, value]) => (
                            <div key={key} className="flex justify-between">
                              <span className="text-gray-400 capitalize">{key.replace('_', ' ')}:</span>
                              <span className="text-white font-semibold">{value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Insights */}
                    {analysisResult.insights && analysisResult.insights.length > 0 && (
                      <div className="p-6 bg-gray-800/50 rounded-xl border border-gray-700">
                        <div className="flex items-center gap-3 mb-4">
                          <Brain className="w-8 h-8 text-green-400" />
                          <h4 className="text-lg font-semibold text-white">AI Insights</h4>
                        </div>
                        <div className="space-y-2">
                          {analysisResult.insights.map((insight, index) => (
                            <div key={index} className="text-sm text-gray-300">
                              • {insight}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Recommendations */}
                  {analysisResult.recommendations && analysisResult.recommendations.length > 0 && (
                    <div className="mt-6 p-6 bg-gray-800/50 rounded-xl border border-gray-700">
                      <div className="flex items-center gap-3 mb-4">
                        <TrendingUp className="w-8 h-8 text-yellow-400" />
                        <h4 className="text-lg font-semibold text-white">Recommendations</h4>
                      </div>
                      <div className="space-y-2">
                        {analysisResult.recommendations.map((rec, index) => (
                          <div key={index} className="text-sm text-gray-300">
                            • {rec}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Recent Analyses */}
              <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-6">
                <h3 className="text-xl font-bold mb-4">Recent Analyses</h3>
                {gameplayAnalyses.length > 0 ? (
                  <div className="space-y-4">
                    {gameplayAnalyses.slice(0, 5).map((analysis) => (
                      <div key={analysis.id} className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            analysis.status === 'completed' ? 'bg-green-500' :
                            analysis.status === 'processing' ? 'bg-yellow-500' :
                            analysis.status === 'failed' ? 'bg-red-500' : 'bg-gray-500'
                          }`}>
                            {analysis.status === 'completed' ? <CheckCircle size={16} /> :
                             analysis.status === 'processing' ? <Clock size={16} /> :
                             <AlertCircle size={16} />}
                          </div>
                          <div>
                            <p className="font-medium">{analysis.game_type} Analysis</p>
                            <p className="text-sm text-gray-400">
                              {new Date(analysis.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`px-2 py-1 rounded text-xs ${
                            analysis.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                            analysis.status === 'processing' ? 'bg-yellow-500/20 text-yellow-400' :
                            analysis.status === 'failed' ? 'bg-red-500/20 text-red-400' : 'bg-gray-500/20 text-gray-400'
                          }`}>
                            {analysis.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400 text-center py-8">No analyses yet. Upload your first gameplay video!</p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'recommendations' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold mb-6">AI Tournament Recommendations</h2>
              {tournamentRecommendations.length > 0 ? (
                tournamentRecommendations.map((rec, index) => (
                  <div key={index} className="bg-gray-900/50 border border-gray-700 rounded-xl p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                            <Bot size={16} className="text-white" />
                          </div>
                          <h3 className="text-xl font-semibold">{rec.tournament.name}</h3>
                          <span className="text-sm bg-green-500/20 text-green-400 px-2 py-1 rounded">
                            {rec.confidence}% match
                          </span>
                        </div>
                        <p className="text-gray-400 mb-2">{rec.reasoning}</p>
                        <div className="flex gap-4 text-sm text-gray-300 mb-4">
                          <span>Game: {rec.tournament.game}</span>
                          <span>Entry: ₹{rec.tournament.entry_fee}</span>
                          <span>Prize: ₹{rec.tournament.prize_pool}</span>
                        </div>
                        <button className="px-4 py-2 bg-green-500 hover:bg-green-600 rounded-lg transition-colors">
                          Join Tournament
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <Bot className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                  <p className="text-gray-400">Upload gameplay videos to get personalized tournament recommendations!</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold mb-6">Performance Analytics</h2>

              {/* Gemini AI Performance Analytics */}
              {performanceAnalytics.length > 0 ? (
                <div className="space-y-6">
                  <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-6">
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                      <Brain className="text-purple-400" />
                      Gemini AI Performance Analytics
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {performanceAnalytics.map((player, index) => (
                        <motion.div
                          key={player.player_id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className={`p-6 rounded-xl border ${
                            player.performance_score >= 90 ? 'bg-green-500/20 border-green-500/30' :
                            player.performance_score >= 80 ? 'bg-blue-500/20 border-blue-500/30' :
                            player.performance_score >= 70 ? 'bg-yellow-500/20 border-yellow-500/30' :
                            player.performance_score >= 60 ? 'bg-orange-500/20 border-orange-500/30' :
                            'bg-red-500/20 border-red-500/30'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="text-lg font-semibold text-white">{player.player_name}</h4>
                            <span className="text-sm text-gray-400">#{player.player_id}</span>
                          </div>
                          
                          <div className={`text-3xl font-bold mb-2 ${
                            player.performance_score >= 90 ? 'text-green-400' :
                            player.performance_score >= 80 ? 'text-blue-400' :
                            player.performance_score >= 70 ? 'text-yellow-400' :
                            player.performance_score >= 60 ? 'text-orange-400' :
                            'text-red-400'
                          }`}>
                            {player.performance_score}
                          </div>
                          
                          <p className="text-gray-400 text-sm mb-4">Performance Score</p>
                          
                          {player.insights && player.insights.length > 0 && (
                            <div className="space-y-1">
                              <p className="text-xs text-gray-500 uppercase tracking-wide">Key Insights:</p>
                              {player.insights.slice(0, 2).map((insight, i) => (
                                <p key={i} className="text-xs text-gray-300">• {insight}</p>
                              ))}
                            </div>
                          )}
                          
                          <div className="mt-4 text-xs text-gray-500">
                            Last analyzed: {player.last_analyzed || 'N/A'}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Brain className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                  <p className="text-gray-400 text-lg">No Gemini AI analytics available</p>
                  <p className="text-gray-500 text-sm mt-2">Upload videos to generate AI insights</p>
                </div>
              )}

              {/* Legacy Performance Data */}
              {performanceData && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Performance Summary */}
                  <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-6">
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                      <BarChart3 className="text-blue-400" />
                      Performance Summary
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span>Total Matches</span>
                        <span className="text-blue-400 font-bold">{performanceData.total_matches}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Average Performance Score</span>
                        <span className="text-green-400 font-bold">{performanceData.average_performance_score}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Average K/D Ratio</span>
                        <span className="text-purple-400 font-bold">{performanceData.average_kd_ratio}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Recent Trend</span>
                        <span className={`font-bold ${
                          performanceData.recent_trend === 'improving' ? 'text-green-400' :
                          performanceData.recent_trend === 'declining' ? 'text-red-400' : 'text-yellow-400'
                        }`}>
                          {performanceData.recent_trend}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Skill Breakdown */}
                  {skillProfile && (
                    <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-6">
                      <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <Target className="text-purple-400" />
                        Skill Breakdown
                      </h3>
                      <div className="space-y-4">
                        {[
                          { name: 'Aim Skill', value: skillProfile.aim_skill, color: 'bg-red-400' },
                          { name: 'Strategy', value: skillProfile.strategy_skill, color: 'bg-blue-400' },
                          { name: 'Teamwork', value: skillProfile.teamwork_skill, color: 'bg-green-400' },
                          { name: 'Game Sense', value: skillProfile.game_sense, color: 'bg-purple-400' }
                        ].map((skill) => (
                          <div key={skill.name} className="flex items-center justify-between">
                            <span>{skill.name}</span>
                            <div className="flex items-center gap-2">
                              <div className="w-24 bg-gray-700 rounded-full h-2">
                                <div
                                  className={`${skill.color} h-2 rounded-full`}
                                  style={{ width: `${skill.value}%` }}
                                ></div>
                              </div>
                              <span className="text-gray-300 text-sm">{Math.round(skill.value)}%</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'insights' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold mb-6">AI Insights & Recommendations</h2>

              {insights ? (
                <div className="space-y-6">
                  {/* Performance Trends */}
                  {insights.performance_trends?.length > 0 && (
                    <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-6">
                      <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <TrendingUp className="text-blue-400" />
                        Performance Trends
                      </h3>
                      <div className="space-y-2">
                        {insights.performance_trends.map((trend, index) => (
                          <div key={index} className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg">
                            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                            <span className="text-gray-300">{trend}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Strengths */}
                  {insights.recent_strengths?.length > 0 && (
                    <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-6">
                      <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <Star className="text-green-400" />
                        Your Strengths
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {insights.recent_strengths.map((strength, index) => (
                          <div key={index} className="flex items-center gap-3 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                            <span className="text-green-300">{strength}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Weaknesses */}
                  {insights.recent_weaknesses?.length > 0 && (
                    <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-6">
                      <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <Target className="text-red-400" />
                        Areas for Improvement
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {insights.recent_weaknesses.map((weakness, index) => (
                          <div key={index} className="flex items-center gap-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                            <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                            <span className="text-red-300">{weakness}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Improvement Recommendations */}
                  {insights.improvement_recommendations?.length > 0 && (
                    <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-6">
                      <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <Lightbulb className="text-yellow-400" />
                        AI Recommendations
                      </h3>
                      <div className="space-y-3">
                        {insights.improvement_recommendations.map((tip, index) => (
                          <div key={index} className="flex items-start gap-3 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                            <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                              <span className="text-black text-sm font-bold">{index + 1}</span>
                            </div>
                            <span className="text-yellow-100">{tip}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Lightbulb className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                  <p className="text-gray-400">Upload gameplay videos and play tournaments to get AI insights!</p>
                </div>
              )}
            </div>
          )}
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-8 text-center"
        >
          <div className="bg-gradient-to-r from-green-500/20 to-blue-500/20 border border-green-500/30 rounded-xl p-8">
            <h3 className="text-2xl font-bold mb-4">Unlock Your Full Gaming Potential</h3>
            <p className="text-gray-400 mb-6">
              Upload your gameplay videos to get AI-powered analysis, personalized recommendations, and tournament suggestions!
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => setActiveTab('upload')}
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg font-semibold hover:from-green-400 hover:to-blue-400 transition-all"
              >
                Upload Gameplay Now
              </button>
              <button
                onClick={() => setActiveTab('recommendations')}
                className="px-6 py-3 border border-gray-600 rounded-lg font-semibold hover:bg-gray-800 transition-all"
              >
                View Recommendations
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
