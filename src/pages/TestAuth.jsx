import { useState } from 'react';
import api from '../services/api';

export default function TestAuth() {
  const [email, setEmail] = useState('prathamg030@gmail.com');
  const [password, setPassword] = useState('password123');
  const [result, setResult] = useState('');
  const [profile, setProfile] = useState(null);

  const handleLogin = async () => {
    try {
      const response = await djangoService.login(email, password);
      setResult(`Login successful! Access token: ${response.access?.substring(0, 50)}...`);
      
      // Try to fetch profile
      try {
        const profileData = await djangoService.getUserProfile();
        setProfile(profileData);
      } catch (error) {
        setResult(prev => prev + `\nProfile fetch failed: ${error.message}`);
      }
    } catch (error) {
      setResult(`Login failed: ${error.message}`);
    }
  };

  const handleGetProfile = async () => {
    try {
      const profileData = await djangoService.getUserProfile();
      setProfile(profileData);
      setResult('Profile fetched successfully!');
    } catch (error) {
      setResult(`Profile fetch failed: ${error.message}`);
    }
  };

  const handleLogout = async () => {
    try {
      await djangoService.logout();
      setResult('Logged out successfully!');
      setProfile(null);
    } catch (error) {
      setResult(`Logout failed: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black pt-20 pb-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-gray-900/50 backdrop-blur-lg border border-gray-800 rounded-2xl p-8">
          <h1 className="text-3xl font-bold text-white mb-6">Authentication Test</h1>
          
          <div className="space-y-4">
            <div>
              <label className="block text-white mb-2">Email:</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
              />
            </div>
            
            <div>
              <label className="block text-white mb-2">Password:</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
              />
            </div>
            
            <div className="flex gap-4">
              <button
                onClick={handleLogin}
                className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-3 rounded-lg transition-colors"
              >
                Login
              </button>
              
              <button
                onClick={handleGetProfile}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors"
              >
                Get Profile
              </button>
              
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
          
          {result && (
            <div className="mt-6 p-4 bg-gray-800 rounded-lg">
              <h3 className="text-white font-bold mb-2">Result:</h3>
              <pre className="text-gray-300 text-sm whitespace-pre-wrap">{result}</pre>
            </div>
          )}
          
          {profile && (
            <div className="mt-6 p-4 bg-gray-800 rounded-lg">
              <h3 className="text-white font-bold mb-2">Profile Data:</h3>
              <pre className="text-gray-300 text-sm whitespace-pre-wrap">
                {JSON.stringify(profile, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
