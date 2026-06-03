import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      } catch (e) {
        console.error('Failed to parse user:', e);
      }
    }
    setLoading(false);
  }, []);

  const register = async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      toast.success('Registration successful! Please login.');
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.error || 'Registration failed');
      throw error;
    }
  };

  const login = async (email, password, role) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user: userData } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(userData);
      toast.success(`Welcome back, ${userData.name}!`);
      navigate(`/${userData.role}`);
      return userData;
    } catch (error) {
      toast.error(error.response?.data?.error || 'Login failed');
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
    toast.success('Logged out successfully');
    navigate('/');
  };

  const updateEmail = async (newEmail, currentPassword) => {
    try {
      await api.put('/auth/update-email', { newEmail, currentPassword });
      toast.success('Email updated successfully');
      return true;
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update email');
      return false;
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      await api.put('/auth/change-password', { currentPassword, newPassword });
      toast.success('Password changed successfully');
      return true;
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to change password');
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, register, login, logout, updateEmail, changePassword }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;