import { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

interface User {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load user data if token exists
    if (token) {
      const loadUser = async () => {
        try {
          // Set the token in the headers for every request
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

          // Safely parse user from localStorage
          const storedUser = localStorage.getItem('user');
          let userData = null;
          if (storedUser && storedUser !== 'undefined') {
            userData = JSON.parse(storedUser);
          }
          if (userData && userData.id) {
            setUser(userData);
          } else {
            // If no valid user data, logout
            logout();
          }
        } catch (err) {
          console.error('Error loading user', err);
          logout();
        }
      };

      loadUser();
    } else {
      // No token means not authenticated
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post(`${API_URL}/login`, { email, password });
      
      // Save in state
      setToken(res.data.token);
      setUser(res.data.user);
      
      // Save in localStorage
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      
      // Set authorization header
      axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to login');
      console.error('Login error', err);
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post(`${API_URL}/signup`, { name, email, password });
      
      // Save in state
      setToken(res.data.token);
      setUser(res.data.user);
      
      // Save in localStorage
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      
      // Set authorization header
      axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to register');
      console.error('Register error', err);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
  };

  const clearError = () => {
    setError(null);
  };

  const value = {
    user,
    token,
    loading,
    error,
    login,
    register,
    logout,
    clearError
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
