import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  location?: string;
  website?: string;
}

// ============================================
// API CONFIGURATION - UPDATE THESE FOR YOUR BACKEND
// ============================================
const API_BASE_URL = ''; // e.g., 'https://your-api.com/api'

// API endpoint paths (relative to API_BASE_URL)
const API_ENDPOINTS = {
  login: '/auth/login',
  signup: '/auth/signup',
  logout: '/auth/logout',
  getProfile: '/auth/profile',
  updateProfile: '/auth/profile',
  refreshToken: '/auth/refresh',
};

// ============================================
// API SERVICE - IMPLEMENT YOUR API CALLS HERE
// ============================================

interface LoginResponse {
  user: User;
  token: string;
}

interface SignupData {
  name: string;
  email: string;
  password: string;
}

// Helper function for API calls
async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('auth_token');
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || 'Request failed');
  }

  return response.json();
}

// ============================================
// AUTH CONTEXT
// ============================================

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock user for development - REMOVE THIS WHEN CONNECTING REAL API
const mockUser: User = {
  id: '1',
  name: 'John Doe',
  email: 'john@example.com',
  avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
  bio: 'Passionate writer and tech enthusiast.',
  location: 'San Francisco, CA',
  website: 'https://johndoe.com'
};

// Set this to false when you connect your real API
const USE_MOCK_DATA = true;

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('auth_token');
      
      if (token) {
        try {
          if (USE_MOCK_DATA) {
            // Mock: simulate getting user from token
            setUser(mockUser);
          } else {
            // Real API: fetch user profile
            const userData = await apiCall<User>(API_ENDPOINTS.getProfile);
            setUser(userData);
          }
        } catch (error) {
          // Token invalid or expired
          localStorage.removeItem('auth_token');
          setUser(null);
        }
      }
      
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    if (USE_MOCK_DATA) {
      // Mock login - REMOVE THIS BLOCK WHEN CONNECTING REAL API
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
      localStorage.setItem('auth_token', 'mock_token_123');
      setUser(mockUser);
      return;
    }

    // Real API implementation
    const response = await apiCall<LoginResponse>(API_ENDPOINTS.login, {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    localStorage.setItem('auth_token', response.token);
    setUser(response.user);
  };

  const signup = async (data: SignupData) => {
    if (USE_MOCK_DATA) {
      // Mock signup - REMOVE THIS BLOCK WHEN CONNECTING REAL API
      await new Promise(resolve => setTimeout(resolve, 500));
      localStorage.setItem('auth_token', 'mock_token_123');
      setUser({ ...mockUser, name: data.name, email: data.email });
      return;
    }

    // Real API implementation
    const response = await apiCall<LoginResponse>(API_ENDPOINTS.signup, {
      method: 'POST',
      body: JSON.stringify(data),
    });

    localStorage.setItem('auth_token', response.token);
    setUser(response.user);
  };

  const logout = async () => {
    if (!USE_MOCK_DATA) {
      try {
        await apiCall(API_ENDPOINTS.logout, { method: 'POST' });
      } catch (error) {
        // Continue with local logout even if API fails
        console.error('Logout API error:', error);
      }
    }

    localStorage.removeItem('auth_token');
    setUser(null);
  };

  const updateProfile = async (data: Partial<User>) => {
    if (USE_MOCK_DATA) {
      // Mock update - REMOVE THIS BLOCK WHEN CONNECTING REAL API
      await new Promise(resolve => setTimeout(resolve, 500));
      if (user) {
        setUser({ ...user, ...data });
      }
      return;
    }

    // Real API implementation
    const updatedUser = await apiCall<User>(API_ENDPOINTS.updateProfile, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });

    setUser(updatedUser);
  };

  const refreshUser = async () => {
    if (USE_MOCK_DATA) {
      return;
    }

    try {
      const userData = await apiCall<User>(API_ENDPOINTS.getProfile);
      setUser(userData);
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated: !!user, 
      isLoading,
      login, 
      signup,
      logout, 
      updateProfile,
      refreshUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
