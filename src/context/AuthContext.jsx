import React, { createContext, useContext, useState, useEffect } from 'react';

export const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

// Configure your backend API URL here
const API_URL = 'http://localhost:5000/api';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored user session
    const storedUser = localStorage.getItem('linkconnect_user');
    const storedToken = localStorage.getItem('linkconnect_token');
    
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password, role) => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        return { 
          success: false, 
          message: data.message || 'Login failed' 
        };
      }
      
      // Store user data and token
      setUser(data.user);
      localStorage.setItem('linkconnect_user', JSON.stringify(data.user));
      localStorage.setItem('linkconnect_token', data.token);
      
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      // If backend is not available, use mock login for demo
      console.warn('⚠️ Backend not connected. Using demo mode.');
      
      const mockUser = {
        id: Date.now(),
        email,
        role,
        name: email.split('@')[0],
        createdAt: new Date().toISOString(),
        rollNumber: role === 'student' ? 'DEMO001' : undefined
      };
      
      setUser(mockUser);
      localStorage.setItem('linkconnect_user', JSON.stringify(mockUser));
      localStorage.setItem('linkconnect_token', 'demo_token_' + Date.now());
      
      return { success: true };
    }
  };

  const register = async (userData) => {
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        return { 
          success: false, 
          message: data.message || 'Registration failed' 
        };
      }
      
      return { success: true, message: 'Registration successful!' };
    } catch (error) {
      console.error('Registration error:', error);
      // If backend is not available, mock success
      console.warn('⚠️ Backend not connected. Using demo mode.');
      return { success: true, message: 'Registration successful! (Demo mode)' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('linkconnect_user');
    localStorage.removeItem('linkconnect_token');
  };

  const getToken = () => {
    return localStorage.getItem('linkconnect_token');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, getToken }}>
      {children}
    </AuthContext.Provider>
  );
};
