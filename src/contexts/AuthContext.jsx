import React, { useState, useContext, useEffect } from 'react';
import api from '../api/api';

const AuthContext = React.createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const checkLoggedIn = async () => {
      if (localStorage.getItem('token')) {
        setLoading(true);
        try {
          api.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem('token')}`;
          const res = await api.get('/api/auth/me');
          if (res.data.success) {
            setUser(res.data.user);
            setIsAuthenticated(true);
          } else {
            localStorage.removeItem('token');
            setIsAuthenticated(false);
            setUser(null);
          }
        } catch (err) {
          localStorage.removeItem('token');
          setIsAuthenticated(false);
          setUser(null);
        }
        setLoading(false);
      } else {
        setLoading(false);
      }
    };
    
    checkLoggedIn();
  }, []);
  
  // Registrar usuário
  const register = async (userData) => {
    setLoading(true);
    setError(null);
    
    try {
      const res = await api.post('/api/auth/register', userData);
      
      if (res.data.success) {
        localStorage.setItem('token', res.data.token);
        api.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
        
        setUser(res.data.user);
        setIsAuthenticated(true);
      }
      setLoading(false);
      return res.data;
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'Erro ao registrar. Tente novamente.');
      return { success: false, message: err.response?.data?.message };
    }
  };
  
  // Login de usuário
  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post('/api/auth/login', { email, password });
      
      if (res.data.success) {
        localStorage.setItem('token', res.data.token);
        api.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
        
        setUser(res.data.user);
        setIsAuthenticated(true);
      }
      setLoading(false);
      return res.data;
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'Credenciais inválidas');
      return { success: false, message: err.response?.data?.message };
    }
  };
  
  // Logout
  const logout = () => {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
    setIsAuthenticated(false);
  };
  
  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        error,
        register,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);