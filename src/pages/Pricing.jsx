import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Zap, Crown, Trophy, Sword, Shield, Star, Sparkles, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { fetchNotifications } from '../store/slices/notificationSlice';
import api from '../services/api';

export default function Pricing() {
  const { userProfile, refreshUserProfile } = useAuth();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [loading, setLoading] = useState(false);

  const plans = [
    {
      id: 'free',
      name: 'Free Warrior',
      price: 0,
      icon: Shield,
      color: 'from-gray-500 to-gray-600',
      popular: false,
      features: [
        'Join 1 tournament per month',
        'Create 1 fantasy team',
        'Basic community access',
        'Standard support',
        'Limited achievements',
        '❌ No AI features',
        '❌ No priority support',
        '❌ No exclusive tournaments'
      ]
    },
    {
      id: 'warrior',
      name: 'Elite Warrior',
      price: 50,
      icon: Sword,
      color: 'from-blue-500 to-cyan-500',
      popular: false,
      features: [
        'Join 10 tournaments per month',
        'Create 3 fantasy teams',
        'Basic leaderboard access',
        'Community chat access',
        'Standard support',
        'Basic achievements',
        'Profile customization',
        '10 tournament entries',
        '❌ Limited AI features'
      ]
    },
    {
      id: 'champion',
      name: 'Pro Champion',
      price: 100,
      icon: Trophy,
      color: 'from-purple-500 to-pink-500',
      popular: true,
      features: [
        'Unlimited tournament entries',
        'Create 10 fantasy teams',
        'Advanced leaderboard stats',
        'Priority community access',
        'Priority support',
        'Exclusive achievements',
        'Premium profile badges',
        'AI-powered insights (Limited)',
        'Early access to new features',
        'Monthly rewards'
      ]
    },
    {
      id: 'legend',
      name: 'Ultimate Legend',
      price: 500,
      icon: Crown,
      color: 'from-yellow-500 to-orange-500',
      popular: false,
      features: [
        'Everything in Pro Champion',
        'Unlimited fantasy teams',
        '✨ Full AI-powered features',
        '✨ AI match predictions',
        '✨ AI team recommendations',
        '✨ AI performance analysis',
        'VIP tournament access',
        'Exclusive Legend badge',
        'Custom profile themes',
        '24/7 VIP support',
        'Weekly bonus rewards',
        'Beta features access',
        'Personal gaming coach AI'
      ]
    }
  ];

  const handleSelectPlan = async (planId) => {
    if (loading) return;

    try {
      setLoading(true);
      setSelectedPlan(planId);

      // Call API to update subscription
      const response = await api.updateSubscription(planId);

      if (response.success) {
        const selectedPlanName = plans.find(p => p.id === planId)?.name;
        
        // Refresh user profile to get updated subscription FIRST
        if (refreshUserProfile) {
          await refreshUserProfile();
        }

        // Fetch notifications to show the upgrade notification
        dispatch(fetchNotifications());

        // Navigate back to profile after delay
        setTimeout(() => {
          navigate('/dashboard/profile');
        }, 1000);
      } else {
        throw new Error(response.message || 'Failed to update subscription');
      }
    } catch (error) {
      console.error('Subscription error:', error);
      // Error notification will be handled by notification system
    } finally {
      setLoading(false);
    }
  };

  const currentPlan = userProfile?.subscription_plan || 'free';

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>

        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles className="w-10 h-10 text-yellow-400 animate-pulse" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Choose Your Battle Path
            </h1>
            <Sparkles className="w-10 h-10 text-yellow-400 animate-pulse" />
          </div>
          <p className="text-gray-300 text-lg mb-4">
            Upgrade your gaming experience and unlock exclusive features
          </p>
          <div className="inline-flex items-center gap-2 bg-green-500/20 px-4 py-2 rounded-full border border-green-500/30">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-green-400 text-sm font-medium">
              Current Plan: <span className="font-bold capitalize">{currentPlan === 'free' ? 'Free Warrior' : plans.find(p => p.id === currentPlan)?.name || 'Free'}</span>
            </span>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`relative bg-gray-900/50 backdrop-blur-sm rounded-xl border ${
                plan.popular ? 'border-purple-500 shadow-lg shadow-purple-500/20 scale-105' : 'border-gray-800'
              } p-6 hover:border-purple-500/50 transition-all duration-300 ${
                selectedPlan === plan.id ? 'ring-2 ring-purple-500' : ''
              }`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1 rounded-full text-sm font-bold flex items-center gap-2">
                    <Star className="w-4 h-4" />
                    MOST POPULAR
                  </div>
                </div>
              )}

              {/* Plan Icon */}
              <div className={`w-16 h-16 rounded-xl bg-gradient-to-r ${plan.color} p-4 mb-4 mx-auto`}>
                <plan.icon className="w-full h-full text-white" />
              </div>

              {/* Plan Name */}
              <h3 className="text-2xl font-bold text-white text-center mb-2">
                {plan.name}
              </h3>

              {/* Price */}
              <div className="text-center mb-6">
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-gray-400 text-lg">₹</span>
                  <span className="text-5xl font-bold text-white">{plan.price}</span>
                  <span className="text-gray-400 text-lg">/month</span>
                </div>
              </div>

              {/* Features */}
              <div className="space-y-3 mb-6 min-h-[300px]">
                {plan.features.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300 text-sm">{feature}</span>
                  </div>
                ))}
              </div>

              {/* CTA Button */}
              <button
                onClick={() => handleSelectPlan(plan.id)}
                disabled={loading || currentPlan === plan.id || plan.id === 'free'}
                className={`w-full py-3 px-6 rounded-lg font-bold transition-all duration-300 flex items-center justify-center gap-2 ${
                  plan.id === 'free'
                    ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                    : currentPlan === plan.id
                    ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                    : loading && selectedPlan === plan.id
                    ? 'bg-purple-600 text-white opacity-75 cursor-wait'
                    : `bg-gradient-to-r ${plan.color} text-white hover:scale-105 hover:shadow-lg`
                }`}
              >
                {plan.id === 'free' ? (
                  <>
                    <Shield className="w-5 h-5" />
                    <span>Free Forever</span>
                  </>
                ) : currentPlan === plan.id ? (
                  <>
                    <span>✓ Current Plan</span>
                  </>
                ) : loading && selectedPlan === plan.id ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Activating...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5" />
                    <span>Upgrade Now</span>
                  </>
                )}
              </button>
            </motion.div>
          ))}
        </div>

        {/* Trust Indicators */}
        <div className="flex items-center justify-center gap-8 text-gray-400 text-sm mb-12">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-green-400" />
            <span>Secure Payment</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-yellow-400" />
            <span>Instant Activation</span>
          </div>
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-purple-400" />
            <span>Cancel Anytime</span>
          </div>
        </div>
      </div>
    </div>
  );
}
