import React, { createContext, useContext, useState, useEffect } from "react";
import toast from "react-hot-toast";
import { ApiService } from "../services/api";

const apiService = new ApiService();

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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = async () => {
    try {
      const profile = await apiService.getCurrentUser();
      console.log('Profile loaded:', profile);
      return profile;
    } catch (error) {
      // Only log non-token errors to avoid spam
      if (!error.message.includes('token not valid')) {
        console.error('Error in fetchUserProfile:', error);
        toast.error('Failed to load user profile');
      }
      return null;
    }
  };

  useEffect(() => {
    // Check if user is already logged in by checking for stored token
    const initializeAuth = async () => {
      const token = localStorage.getItem('access_token');
      if (token) {
        apiService.setAuthToken(token);
        try {
          const profile = await fetchUserProfile();
          if (profile) {
            setCurrentUser({ id: profile.id, email: profile.email, username: profile.username });
            setUserProfile(profile);
            setIsAuthenticated(true);
          } else {
            // Profile is null, likely due to invalid token
            console.log('Token invalid, clearing stored tokens');
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            apiService.setAuthToken(null);
            setCurrentUser(null);
            setUserProfile(null);
            setIsAuthenticated(false);
          }
        } catch (error) {
          // Token might be invalid, clear it silently
          console.log('Token invalid, clearing stored tokens');
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          apiService.setAuthToken(null);
          setCurrentUser(null);
          setUserProfile(null);
          setIsAuthenticated(false);
        }
      } else {
        setIsAuthenticated(false);
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await apiService.login({ email, password });

      if (response.success && response.data.tokens) {
        // Store tokens
        localStorage.setItem('access_token', response.data.tokens.access);
        localStorage.setItem('refresh_token', response.data.tokens.refresh);

        // Set auth token for future requests
        apiService.setAuthToken(response.data.tokens.access);

        // Set user data from response
        setCurrentUser({
          id: response.data.user.id,
          email: response.data.user.email,
          username: response.data.user.username
        });
        setUserProfile(response.data.user);
        setIsAuthenticated(true);
      }

      toast.success('Login successful!');
      return { success: true, message: "Login successful" };
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.message || 'Login failed');
      throw error;
    }
  };

  const register = async (email, password, username, full_name, confirmPassword = password) => {
    try {
      const response = await apiService.register({
        email,
        password,
        password_confirm: confirmPassword,
        username,
        full_name
      });

      if (response.success) {
        toast.success('Account created successfully! You can now login.');
        return { success: true, message: "Registration successful" };
      } else {
        throw new Error(response.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error(error.message || 'Registration failed');
      throw error;
    }
  };

  const logout = async () => {
    try {
      await apiService.logout();
      apiService.setAuthToken(null);
      setCurrentUser(null);
      setUserProfile(null);
      setIsAuthenticated(false);

      toast.success('Logged out successfully!');
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      // Even if logout fails on server, clear local state
      apiService.setAuthToken(null);
      setCurrentUser(null);
      setUserProfile(null);
      setIsAuthenticated(false);
      toast.success('Logged out successfully!');
      return { success: true };
    }
  };

  const updateProfile = async (updates) => {
    try {
      if (!currentUser) throw new Error('No user logged in');

      // TODO: Implement updateProfile in new API service
      const updatedProfile = {
        ...userProfile,
        username: updates.name,
        preferred_games: updates.favoriteGame ? [updates.favoriteGame] : []
      };

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

  const refreshUserProfile = async () => {
    try {
      const profile = await fetchUserProfile();
      if (profile) {
        setUserProfile(profile);
        setCurrentUser({ id: profile.id, email: profile.email, username: profile.username });
      }
      return profile;
    } catch (error) {
      console.error('Error refreshing profile:', error);
      return null;
    }
  };

  const value = {
    currentUser,
    userProfile,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
    updateProfile,
    refreshUserProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
