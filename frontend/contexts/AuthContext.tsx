'use client';

import { useUser, useAuth as useClerkAuth } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
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

// Wrapper to maintain compatibility with existing code
export function useAuth(): AuthContextType {
  const { user: clerkUser, isLoaded: clerkLoaded } = useUser();
  const { signOut, getToken } = useClerkAuth();
  const [dbUser, setDbUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Update API token when Clerk user changes
  useEffect(() => {
    const updateToken = async () => {
      if (clerkUser) {
        try {
          const token = await getToken();
          setApiToken(token);
        } catch (error) {
          setApiToken(null);
        }
      } else {
        setApiToken(null);
      }
    };
    updateToken();
  }, [clerkUser, getToken]);

  // Sync Clerk user with database user
  useEffect(() => {
    if (!clerkLoaded) {
      setLoading(true);
      return;
    }

    if (!clerkUser) {
      setDbUser(null);
      setLoading(false);
      return;
    }

    // Only fetch if we don't already have this user's data
    const currentUserId = dbUser?.id;
    const clerkUserId = clerkUser.id;
    
    if (currentUserId === clerkUserId) {
      // Already have this user's data, don't refetch
      setLoading(false);
      return;
    }

    // Fetch user data from our database
    const fetchUserData = async () => {
      setLoading(true);
      try {
        const userData = await userApi.getMe();
        setDbUser(userData);
      } catch (error) {
        console.error('Failed to fetch user data:', error);
        // Fallback to Clerk user data if API fails
        setDbUser({
          id: clerkUser.id,
          email: clerkUser.emailAddresses[0]?.emailAddress || '',
          name: clerkUser.firstName || clerkUser.lastName 
            ? `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim()
            : undefined,
          role: (clerkUser.publicMetadata?.role as string) || 'HOME_USER',
          isAdmin: (clerkUser.publicMetadata?.isAdmin as boolean) || false,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [clerkUser, clerkLoaded, dbUser?.id]);

  const login = async (email: string, password: string) => {
    // Clerk handles login through their UI components
    // This is kept for compatibility but should use Clerk's SignIn component
    throw new Error('Please use Clerk SignIn component for login');
  };

  const register = async (email: string, password: string, name?: string) => {
    // Clerk handles registration through their UI components
    // This is kept for compatibility but should use Clerk's SignUp component
    throw new Error('Please use Clerk SignUp component for registration');
  };

  const logout = async () => {
    await signOut();
    setDbUser(null);
  };

  const refreshUser = async () => {
    if (clerkUser) {
      try {
        const userData = await userApi.getMe();
        setDbUser(userData);
      } catch (error) {
        console.error('Failed to refresh user:', error);
      }
    }
  };

  return {
    user: dbUser,
    loading: loading || !clerkLoaded,
    login,
    register,
    logout,
    refreshUser,
  };
}

// Export AuthProvider for compatibility (no-op since ClerkProvider handles it)
export function AuthProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
