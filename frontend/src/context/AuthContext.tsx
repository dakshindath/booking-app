import { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

interface User {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  isHost: boolean;
  hostSince?: Date;
  hostInfo?: {
    phone: string;
    address: string;
    bio: string;
    identification: string;
  };
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
  refreshUser: () => Promise<void>;
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
  const [loading, setLoading] = useState<boolean>(true); // Start as true while initializing
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        if (token) {
          // Set the token in the headers for every request
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

          // Safely parse user from localStorage
          const storedUser = localStorage.getItem('user');
          let userData = null;
          if (storedUser && storedUser !== 'undefined') {
            userData = JSON.parse(storedUser);
            if (userData && userData.id) {
              // Verify the token and user data are still valid
              const response = await axios.get(`${API_URL}/user/${userData.id}`, {
                headers: { Authorization: `Bearer ${token}` }
              });
              setUser(response.data);
              localStorage.setItem('user', JSON.stringify(response.data));
            } else {
              logout();
            }
          } else {
            logout();
          }
        } else {
          // No token means not authenticated
          delete axios.defaults.headers.common['Authorization'];
        }
      } catch (err) {
        console.error('Error initializing auth:', err);
        logout();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
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

  const refreshUser = async () => {
    if (token && user?.id) {
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${token}`
          }
        };
        const response = await axios.get(`${API_URL}/user/${user.id}`, config);
        const updatedUser = response.data;
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      } catch (err) {
        console.error('Error refreshing user data:', err);
      }
    }
  };

  const value = {
    user,
    token,
    loading,
    error,
    login,
    register,
    logout,
    clearError,
    refreshUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
