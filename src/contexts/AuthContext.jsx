import React, { createContext, useContext, useState, useEffect } from "react";
import toast from "react-hot-toast";
import { djangoService } from "../services/djangoService";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = async () => {
    try {
      const profile = await djangoService.getUserProfile();
      console.log('Profile loaded:', profile);
      
      // If user doesn't have a gaming_id, generate one
      if (!profile.gaming_id) {
        try {
          const gamingId = await djangoService.generateGamingId();
          console.log('Generated gaming ID:', gamingId);
          // Refetch profile to get updated data
          return await djangoService.getUserProfile();
        } catch (error) {
          console.error('Error generating gaming ID:', error);
        }
      }
      
      return profile;
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      toast.error('Failed to load user profile');
      return null;
    }
  };

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('access_token');
    
    if (token) {
      djangoService.setToken(token);
      // Fetch user profile
      fetchUserProfile().then(profile => {
        if (profile) {
          setCurrentUser({ id: profile.id, email: profile.email, username: profile.username });
          setUserProfile(profile);
        } else {
          // Token might be invalid, clear it
          djangoService.logout();
          setCurrentUser(null);
          setUserProfile(null);
        }
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    try {
      const response = await djangoService.login(email, password);
      
      // Fetch user profile after successful login
      const profile = await fetchUserProfile();
      if (profile) {
        setCurrentUser({ id: profile.id, email: profile.email, username: profile.username });
        setUserProfile(profile);
      }
      
      toast.success('Login successful!');
      return { success: true, message: "Login successful" };
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.message || 'Login failed');
      throw error;
    }
  };

  const register = async (email, password, name) => {
    try {
      const response = await djangoService.register(email, password, name);
      
      toast.success('Account created successfully! You can now login.');
      return { success: true, message: "Registration successful" };
    } catch (error) {
      console.error('Registration error:', error);
      toast.error(error.message || 'Registration failed');
      throw error;
    }
  };

  const logout = async () => {
    try {
      await djangoService.logout();
      setCurrentUser(null);
      setUserProfile(null);
      
      toast.success('Logged out successfully!');
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Logout failed');
      throw error;
    }
  };

  const updateProfile = async (updates) => {
    try {
      if (!currentUser) throw new Error('No user logged in');

      const updatedProfile = await djangoService.updateUserProfile({
        username: updates.name,
        preferred_games: updates.favoriteGame ? [updates.favoriteGame] : []
      });
      
      // Update local state
      setUserProfile(updatedProfile);
      
      toast.success('Profile updated successfully!');
      return { success: true };
    } catch (error) {
      console.error('Update profile error:', error);
      toast.error('Failed to update profile');
      throw error;
    }
  };

  const value = {
    currentUser,
    userProfile,
    loading,
    login,
    register,
    logout,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
