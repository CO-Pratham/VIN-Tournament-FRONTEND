import { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings as SettingsIcon, User, Lock, Bell, Shield, Mail } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export default function Settings() {
  const { currentUser, userProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');

  const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'security', name: 'Security', icon: Lock },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'privacy', name: 'Privacy', icon: Shield },
  ];

  const ProfileSettings = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Username</label>
        <input
          type="text"
          defaultValue={userProfile?.username || ''}
          className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
        <input
          type="email"
          defaultValue={userProfile?.email || ''}
          className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Gaming ID</label>
        <input
          type="text"
          value={userProfile?.gaming_id || 'Not set'}
          disabled
          className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2 text-gray-400"
        />
      </div>
      <button
        onClick={() => toast.success('Profile updated successfully!')}
        className="bg-gradient-to-r from-cyan-500 to-pink-500 text-white px-6 py-2 rounded-lg hover:from-cyan-600 hover:to-pink-600 transition-all"
      >
        Save Changes
      </button>
    </div>
  );

  const SecuritySettings = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Current Password</label>
        <input
          type="password"
          className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">New Password</label>
        <input
          type="password"
          className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Confirm New Password</label>
        <input
          type="password"
          className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-500"
        />
      </div>
      <button
        onClick={() => toast.success('Password updated successfully!')}
        className="bg-gradient-to-r from-cyan-500 to-pink-500 text-white px-6 py-2 rounded-lg hover:from-cyan-600 hover:to-pink-600 transition-all"
      >
        Update Password
      </button>
    </div>
  );

  const NotificationSettings = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-white font-medium">Tournament Updates</h4>
          <p className="text-gray-400 text-sm">Get notified about tournament results</p>
        </div>
        <input type="checkbox" defaultChecked className="toggle" />
      </div>
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-white font-medium">Email Notifications</h4>
          <p className="text-gray-400 text-sm">Receive updates via email</p>
        </div>
        <input type="checkbox" defaultChecked className="toggle" />
      </div>
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-white font-medium">Prize Notifications</h4>
          <p className="text-gray-400 text-sm">Get notified when you win prizes</p>
        </div>
        <input type="checkbox" defaultChecked className="toggle" />
      </div>
    </div>
  );

  const PrivacySettings = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-white font-medium">Profile Visibility</h4>
          <p className="text-gray-400 text-sm">Make your profile visible to other players</p>
        </div>
        <input type="checkbox" defaultChecked className="toggle" />
      </div>
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-white font-medium">Show Gaming Stats</h4>
          <p className="text-gray-400 text-sm">Display your wins and losses publicly</p>
        </div>
        <input type="checkbox" defaultChecked className="toggle" />
      </div>
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-white font-medium">Show Tournament History</h4>
          <p className="text-gray-400 text-sm">Let others see your tournament participation</p>
        </div>
        <input type="checkbox" defaultChecked className="toggle" />
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'profile': return <ProfileSettings />;
      case 'security': return <SecuritySettings />;
      case 'notifications': return <NotificationSettings />;
      case 'privacy': return <PrivacySettings />;
      default: return <ProfileSettings />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black pt-20 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <SettingsIcon className="w-8 h-8 text-cyan-400" />
            Settings
          </h1>
          <p className="text-gray-400">Manage your account preferences and settings</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <div className="bg-gray-900/50 backdrop-blur-lg border border-gray-800 rounded-xl p-4">
              <nav className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      activeTab === tab.id
                        ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                        : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                    }`}
                  >
                    <tab.icon size={20} />
                    {tab.name}
                  </button>
                ))}
              </nav>
            </div>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-3"
          >
            <div className="bg-gray-900/50 backdrop-blur-lg border border-gray-800 rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-6">
                {tabs.find(tab => tab.id === activeTab)?.name} Settings
              </h2>
              {renderContent()}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}