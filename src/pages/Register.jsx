import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, User, Gamepad2, Check, X } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import toast from "react-hot-toast";

export default function Register() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState(null); // null, 'checking', 'available', 'taken'
  const [checkingUsername, setCheckingUsername] = useState(false);

  const navigate = useNavigate();
  const { register } = useAuth();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    
    if (e.target.name === 'username') {
      setUsernameStatus(null);
    }
  };

  // Username availability check
  useEffect(() => {
    const checkUsername = async () => {
      if (formData.username.length < 3) {
        setUsernameStatus(null);
        return;
      }

      setCheckingUsername(true);
      setUsernameStatus('checking');

      try {
        const response = await fetch(`http://localhost:8000/api/users/register/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            username: formData.username,
            email: `test${Date.now()}@test.com`,
            password: 'testpass123',
            re_password: 'testpass123'
          })
        });
        
        const data = await response.json();
        
        // Check if username error exists in response
        if (data.username) {
          const usernameError = Array.isArray(data.username) ? data.username[0] : data.username;
          if (usernameError.toLowerCase().includes('already exists') || 
              usernameError.toLowerCase().includes('taken') ||
              usernameError.toLowerCase().includes('user with this username')) {
            setUsernameStatus('taken');
          } else {
            setUsernameStatus('available');
          }
        } else if (!response.ok) {
          // If response is not ok but no username error, assume available
          setUsernameStatus('available');
        } else {
          // Registration would succeed, so username is available
          setUsernameStatus('available');
        }
      } catch (error) {
        setUsernameStatus('available');
      } finally {
        setCheckingUsername(false);
      }
    };

    const timeoutId = setTimeout(checkUsername, 500);
    return () => clearTimeout(timeoutId);
  }, [formData.username]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords don't match!");
      return;
    }

    if (formData.password.length < 8) {
      toast.error("Password must be at least 8 characters long!");
      return;
    }

    setLoading(true);

    try {
      const result = await register(formData.email, formData.password, formData.username);
      if (result.success) {
        navigate('/');
      }
    } catch (error) {
      console.error('Registration error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center px-4 pt-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-cyan-500 to-pink-500 rounded-full mb-4"
          >
            <Gamepad2 size={32} className="text-white" />
          </motion.div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Join VIN Tournament
          </h1>
          <p className="text-gray-400">
            Create your account and start competing
          </p>
        </div>

        {/* Form */}
        <motion.form
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          onSubmit={handleSubmit}
          className="bg-gray-900/50 backdrop-blur-lg border border-gray-800 rounded-2xl p-8 shadow-2xl"
        >
          {/* Username Field */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Username
            </label>
            <div className="relative">
              <User
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                minLength={3}
                className={`w-full pl-10 pr-12 py-3 bg-gray-800/50 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
                  usernameStatus === 'available' ? 'border-green-500 focus:ring-green-500' :
                  usernameStatus === 'taken' ? 'border-red-500 focus:ring-red-500' :
                  'border-gray-700 focus:ring-cyan-500'
                }`}
                placeholder="Choose a username"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                {checkingUsername ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-cyan-400"></div>
                ) : usernameStatus === 'available' ? (
                  <Check size={20} className="text-green-400" />
                ) : usernameStatus === 'taken' ? (
                  <X size={20} className="text-red-400" />
                ) : null}
              </div>
            </div>
            {usernameStatus === 'available' && (
              <p className="text-green-400 text-sm mt-1">✓ Username is available</p>
            )}
            {usernameStatus === 'taken' && (
              <p className="text-red-400 text-sm mt-1">✗ Username is already taken</p>
            )}
            {formData.username.length > 0 && formData.username.length < 3 && (
              <p className="text-yellow-400 text-sm mt-1">Username must be at least 3 characters</p>
            )}
          </div>

          {/* Email Field */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                placeholder="Enter your email"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-12 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                placeholder="Create a password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Confirm Password Field */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <Lock
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-12 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                placeholder="Confirm your password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-cyan-500 to-pink-500 hover:from-cyan-400 hover:to-pink-400 text-white font-semibold py-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Creating Account...
              </div>
            ) : (
              "Create Account"
            )}
          </motion.button>

          {/* Divider */}
          <div className="my-6 flex items-center">
            <div className="flex-1 border-t border-gray-700"></div>
            <span className="px-4 text-gray-400 text-sm">or</span>
            <div className="flex-1 border-t border-gray-700"></div>
          </div>

          {/* Sign In Link */}
          <div className="text-center">
            <p className="text-gray-400">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </motion.form>


      </motion.div>
    </div>
  );
}
