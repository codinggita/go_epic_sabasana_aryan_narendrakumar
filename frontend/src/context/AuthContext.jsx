import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize Auth State from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');

      if (token && savedUser) {
        try {
          setUser(JSON.parse(savedUser));
          
          // Verify token/profile with backend
          const res = await api.get('/auth/profile');
          if (res.data && res.data.data) {
            setUser(res.data.data);
            localStorage.setItem('user', JSON.stringify(res.data.data));
          }
        } catch (err) {
          console.error("Auth initialization failed:", err);
          // If token verification fails with a 401, interceptor will clear it.
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  // Login
  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      const { token, user: userData } = res.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      return { success: true, data: userData };
    } catch (err) {
      throw err.response?.data || { message: "Login failed" };
    }
  };

  // Register
  const register = async (name, email, password) => {
    try {
      const res = await api.post('/auth/register', { name, email, password });
      return { success: true, message: res.data.message || "Registration successful" };
    } catch (err) {
      throw err.response?.data || { message: "Registration failed" };
    }
  };

  // Logout
  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.error("Logout request error:", err);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
    }
  };

  // Send OTP
  const sendOtp = async (email) => {
    try {
      const res = await api.post('/auth/send-otp', { email });
      return { success: true, message: res.data.message };
    } catch (err) {
      throw err.response?.data || { message: "Failed to send OTP" };
    }
  };

  // Verify OTP
  const verifyOtp = async (email, otp) => {
    try {
      const res = await api.post('/auth/verify-otp', { email, otp });
      return { success: true, message: res.data.message };
    } catch (err) {
      throw err.response?.data || { message: "OTP verification failed" };
    }
  };

  // Forgot Password
  const forgotPassword = async (email) => {
    try {
      const res = await api.post('/auth/forgot-password', { email });
      return { success: true, message: res.data.message };
    } catch (err) {
      throw err.response?.data || { message: "Failed to request reset password" };
    }
  };

  // Reset Password
  const resetPassword = async (email, otp, newPassword) => {
    try {
      const res = await api.post('/auth/reset-password', { email, otp, newPassword });
      return { success: true, message: res.data.message };
    } catch (err) {
      throw err.response?.data || { message: "Failed to reset password" };
    }
  };

  // Update Profile
  const updateProfile = async (profileData) => {
    try {
      const res = await api.patch('/auth/profile', profileData);
      const updatedUser = res.data.data;
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      return { success: true, data: updatedUser };
    } catch (err) {
      throw err.response?.data || { message: "Profile update failed" };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        sendOtp,
        verifyOtp,
        forgotPassword,
        resetPassword,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
