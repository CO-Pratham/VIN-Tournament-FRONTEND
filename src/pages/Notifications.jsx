import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, Settings, Check, X, Trophy, Users, MessageCircle, Zap, Calendar, Star } from 'lucide-react';
import api from '../services/api';

export default function Notifications() {
  const [activeTab, setActiveTab] = useState('all');
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notificationSettings, setNotificationSettings] = useState({
    tournaments: true,
    matches: true,
    community: false,
    achievements: true,
    marketing: false
  });

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const notificationsRes = await api.getNotifications();
      setNotifications(notificationsRes.results || notificationsRes);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setError('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await api.markNotificationRead(notificationId);
      setNotifications(notifications.map(notif =>
        notif.id === notificationId
          ? { ...notif, is_read: true }
          : notif
      ));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications(notifications.map(notif => ({ ...notif, is_read: true })));
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'tournament': return Trophy;
      case 'achievement': return Star;
      case 'comment':
      case 'like':
      case 'mention': return MessageCircle;
      case 'follow': return Users;
      case 'system': return Zap;
      default: return Bell;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'tournament': return 'text-yellow-400';
      case 'achievement': return 'text-purple-400';
      case 'comment':
      case 'like':
      case 'mention': return 'text-blue-400';
      case 'follow': return 'text-green-400';
      case 'system': return 'text-orange-400';
      default: return 'text-gray-400';
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    return `${Math.floor(diffInHours / 24)} days ago`;
  };

  const filteredNotifications = activeTab === 'all'
    ? notifications
    : notifications.filter(n => n.notification_type === activeTab);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const handleSettingChange = (setting) => {
    setNotificationSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-red-400 via-pink-500 to-purple-500 bg-clip-text text-transparent mb-4">
            🔔 Notifications Center
          </h1>
          <p className="text-gray-400 text-lg">Stay updated with all your gaming activities</p>
        </motion.div>

        {/* Notification Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-red-500/20 to-pink-500/20 border border-red-500/30 rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <Bell className="text-red-400" size={24} />
              <span className="text-2xl font-bold text-red-400">{unreadCount}</span>
            </div>
            <h3 className="text-lg font-semibold">Unread</h3>
            <p className="text-sm text-gray-400">New notifications</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <Trophy className="text-blue-400" size={24} />
              <span className="text-2xl font-bold text-blue-400">3</span>
            </div>
            <h3 className="text-lg font-semibold">Tournament Alerts</h3>
            <p className="text-sm text-gray-400">Active tournaments</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <Settings className="text-green-400" size={24} />
              <span className="text-2xl font-bold text-green-400">5</span>
            </div>
            <h3 className="text-lg font-semibold">Active Settings</h3>
            <p className="text-sm text-gray-400">Notification types</p>
          </motion.div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-gray-800/50 rounded-lg p-1 mb-8">
          {[
            { id: 'all', label: 'All Notifications', count: mockNotifications.length },
            { id: 'tournament', label: 'Tournaments', count: mockNotifications.filter(n => n.type === 'tournament').length },
            { id: 'achievement', label: 'Achievements', count: mockNotifications.filter(n => n.type === 'achievement').length },
            { id: 'community', label: 'Community', count: mockNotifications.filter(n => n.type === 'community').length }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
                activeTab === tab.id
                  ? 'bg-red-500 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              {tab.label}
              <span className="bg-gray-600 text-xs px-2 py-1 rounded-full">{tab.count}</span>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Notifications List */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-gray-900/50 border border-gray-700 rounded-xl p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Recent Notifications</h2>
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-sm text-blue-400 hover:text-blue-300"
                >
                  Mark all as read
                </button>
              </div>

              <div className="space-y-4">
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="text-gray-400 mt-4">Loading notifications...</p>
                  </div>
                ) : error ? (
                  <div className="text-center py-8">
                    <p className="text-red-400">{error}</p>
                    <button
                      onClick={fetchNotifications}
                      className="mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors"
                    >
                      Retry
                    </button>
                  </div>
                ) : filteredNotifications.length === 0 ? (
                  <div className="text-center py-8">
                    <Bell className="mx-auto text-gray-400 mb-4" size={48} />
                    <p className="text-gray-400">No notifications to show</p>
                  </div>
                ) : (
                  filteredNotifications.map((notification) => {
                    const IconComponent = getNotificationIcon(notification.notification_type);
                    const iconColor = getNotificationColor(notification.notification_type);

                    return (
                      <div
                        key={notification.id}
                        className={`p-4 rounded-lg border transition-all hover:border-gray-600 ${
                          notification.is_read
                            ? 'bg-gray-800/30 border-gray-700'
                            : 'bg-gray-800/50 border-blue-500/30'
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <div className={`p-2 rounded-lg bg-gray-700 ${iconColor}`}>
                            <IconComponent size={20} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="font-semibold">{notification.title}</h4>
                              <span className="text-xs text-gray-400">
                                {formatTimestamp(notification.created_at)}
                              </span>
                            </div>
                            <p className="text-gray-400 text-sm mb-2">{notification.message}</p>
                            {!notification.is_read && (
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleMarkAsRead(notification.id)}
                                  className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded hover:bg-green-500/30"
                                >
                                  <Check size={12} className="inline mr-1" />
                                  Mark Read
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </motion.div>
          </div>

          {/* Notification Settings */}
          <div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-gray-900/50 border border-gray-700 rounded-xl p-6"
            >
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Settings className="text-gray-400" />
                Notification Settings
              </h3>

              <div className="space-y-4">
                {[
                  { key: 'tournaments', label: 'Tournament Updates', description: 'Registration, matches, results' },
                  { key: 'matches', label: 'Match Notifications', description: 'Live scores, results' },
                  { key: 'community', label: 'Community Activity', description: 'Messages, mentions, follows' },
                  { key: 'achievements', label: 'Achievements & Badges', description: 'XP gains, new badges' },
                  { key: 'marketing', label: 'Promotional Content', description: 'Special offers, news' }
                ].map((setting) => (
                  <div key={setting.key} className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
                    <div>
                      <h4 className="font-medium">{setting.label}</h4>
                      <p className="text-xs text-gray-400">{setting.description}</p>
                    </div>
                    <button
                      onClick={() => handleSettingChange(setting.key)}
                      className={`w-12 h-6 rounded-full transition-colors ${
                        notificationSettings[setting.key] 
                          ? 'bg-green-500' 
                          : 'bg-gray-600'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 bg-white rounded-full transition-transform ${
                          notificationSettings[setting.key] 
                            ? 'translate-x-6' 
                            : 'translate-x-0.5'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-gray-700">
                <h4 className="font-semibold mb-3">Quick Actions</h4>
                <div className="space-y-2">
                  <button className="w-full text-left px-3 py-2 bg-gray-800/50 rounded hover:bg-gray-800 transition-colors text-sm">
                    Enable Push Notifications
                  </button>
                  <button className="w-full text-left px-3 py-2 bg-gray-800/50 rounded hover:bg-gray-800 transition-colors text-sm">
                    Set Quiet Hours
                  </button>
                  <button className="w-full text-left px-3 py-2 bg-gray-800/50 rounded hover:bg-gray-800 transition-colors text-sm">
                    Export Notification Data
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
