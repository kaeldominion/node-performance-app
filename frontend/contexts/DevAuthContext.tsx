'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { userApi, setApiToken } from '@/lib/api';

interface User {
  id: string;
  email: string;
  name?: string;
  isAdmin?: boolean;
  role?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock user for development when Clerk is down
const MOCK_USER: User = {
  id: 'dev-user-123',
  email: 'dev@node.local',
  name: 'Dev User',
  role: 'HOME_USER',
  isAdmin: true, // Make admin for easier testing
};

export function DevAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In dev mode, automatically "log in" with mock user
    const isDevMode = process.env.NODE_ENV === 'development' || 
                      process.env.NEXT_PUBLIC_DEV_MODE === 'true';
    
    if (isDevMode) {
      console.log('🔧 DEV MODE: Using mock authentication (Clerk bypass)');
      // Set a mock token for API calls
      setApiToken('dev-mock-token');
      
      // Try to fetch user from backend, but fallback to mock if it fails
      userApi.getMe()
        .then((userData) => {
          console.log('✅ DEV MODE: Backend user found:', userData);
          setUser(userData);
        })
        .catch((error) => {
          console.log('⚠️ DEV MODE: Backend unavailable, using mock user:', error.message);
          setUser(MOCK_USER);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    console.log('🔧 DEV MODE: Mock login (no-op)');
    setUser(MOCK_USER);
    setApiToken('dev-mock-token');
  };

  const register = async (email: string, password: string, name?: string) => {
    console.log('🔧 DEV MODE: Mock register (no-op)');
    setUser({ ...MOCK_USER, email, name });
    setApiToken('dev-mock-token');
  };

  const logout = async () => {
    console.log('🔧 DEV MODE: Mock logout');
    setUser(null);
    setApiToken(null);
  };

  const refreshUser = async () => {
    if (user) {
      try {
        const userData = await userApi.getMe();
        setUser(userData);
      } catch (error) {
        console.log('⚠️ DEV MODE: Backend unavailable, keeping mock user');
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useDevAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useDevAuth must be used within DevAuthProvider');
  }
  return context;
}

