import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AUTH_DISABLED = String(process.env.REACT_APP_AUTH_DISABLE || '').toLowerCase() === 'true';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (AUTH_DISABLED) {
      // Development-only: auto sign-in as mock admin user
      setUser({
        _id: 'dev-user',
        email: 'dev@local',
        firstName: 'Dev',
        lastName: 'User',
        role: 'admin',
        isActive: true
      });
      setLoading(false);
      return;
    }
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const response = await authService.getProfile();
        if (response.success) {
          setUser(response.data);
        } else {
          localStorage.removeItem('token');
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    if (AUTH_DISABLED) {
      setUser({
        _id: 'dev-user',
        email: credentials?.email || 'dev@local',
        firstName: 'Dev',
        lastName: 'User',
        role: 'admin',
        isActive: true
      });
      return { success: true };
    }
    try {
      const response = await authService.login(credentials);
      if (response.success) {
        localStorage.setItem('token', response.data.token);
        setUser(response.data.user);
        return { success: true };
      } else {
        return { success: false, message: response.message };
      }
    } catch (error) {
      console.error('Login failed:', error);
      return { success: false, message: 'Login failed' };
    }
  };

  const register = async (userData) => {
    if (AUTH_DISABLED) {
      setUser({
        _id: 'dev-user',
        email: userData?.email || 'dev@local',
        firstName: userData?.firstName || 'Dev',
        lastName: userData?.lastName || 'User',
        role: 'admin',
        isActive: true
      });
      return { success: true };
    }
    try {
      const response = await authService.register(userData);
      if (response.success) {
        localStorage.setItem('token', response.data.token);
        setUser(response.data.user);
        return { success: true };
      } else {
        return { success: false, message: response.message };
      }
    } catch (error) {
      console.error('Registration failed:', error);
      return { success: false, message: 'Registration failed' };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await authService.updateProfile(profileData);
      if (response.success) {
        setUser(response.data);
        return { success: true };
      } else {
        return { success: false, message: response.message };
      }
    } catch (error) {
      console.error('Profile update failed:', error);
      return { success: false, message: 'Profile update failed' };
    }
  };

  const updateUser = (nextUser) => {
    setUser(nextUser);
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateProfile,
    updateUser,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
