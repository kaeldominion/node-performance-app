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
  networkCode?: string;
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
  
  // Debug: Log user status
  useEffect(() => {
    console.log('👤 Clerk User Status:', {
      isLoaded: clerkLoaded,
      hasUser: !!clerkUser,
      userId: clerkUser?.id,
      email: clerkUser?.emailAddresses[0]?.emailAddress,
    });
  }, [clerkUser, clerkLoaded]);
  const [dbUser, setDbUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Update API token when Clerk user changes
  useEffect(() => {
    const updateToken = async () => {
      console.log('🔄 Token update effect triggered', { 
        hasClerkUser: !!clerkUser, 
        clerkUserId: clerkUser?.id,
        isLoaded: clerkLoaded,
      });
      
      if (!clerkLoaded) {
        console.log('⏳ Clerk not loaded yet, waiting...');
        return;
      }
      
      if (clerkUser) {
        try {
          console.log('🔍 Attempting to get token from Clerk...', { userId: clerkUser.id });
          // Get token from Clerk - try with and without template
          let token = await getToken();
          
          // If no token, try with template
          if (!token) {
            console.log('⚠️ No token without template, trying with template...');
            token = await getToken({ template: 'default' }).catch(() => null);
          }
          
          console.log('📦 Token received from Clerk:', { 
            hasToken: !!token, 
            tokenLength: token?.length,
            tokenPreview: token ? token.substring(0, 30) + '...' : null,
          });
          
          if (token) {
            setApiToken(token);
            console.log('✅ Token set for API requests');
          } else {
            console.warn('⚠️ No token received from Clerk (token is null/undefined)');
            setApiToken(null);
          }
              } catch (error) {
                console.error('❌ Failed to get Clerk token:', {
                  error,
                  errorMessage: error instanceof Error ? error.message : String(error),
                  errorStack: error instanceof Error ? error.stack : undefined,
                });
                setApiToken(null);
              }
      } else {
        console.log('👤 No Clerk user, clearing token');
        setApiToken(null);
      }
    };
    updateToken();
  }, [clerkUser, clerkLoaded, getToken]);

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
    
    if (currentUserId === clerkUserId && dbUser) {
      // Already have this user's data, don't refetch
      setLoading(false);
      return;
    }

    // Fetch user data from our database
    const fetchUserData = async () => {
      setLoading(true);
      
      // Ensure token is retrieved and set before making API call
      console.log('🔄 fetchUserData: Ensuring token is available...');
      try {
        // Get token directly from Clerk
        const token = await getToken();
        if (token) {
          console.log('✅ Got token in fetchUserData, setting it...');
          setApiToken(token);
          // Small delay to ensure token is set in the interceptor
          await new Promise(resolve => setTimeout(resolve, 50));
        } else {
          console.error('❌ No token available from Clerk in fetchUserData');
        }
      } catch (error) {
        console.error('❌ Failed to get token in fetchUserData:', error);
      }
      
      try {
        console.log('📞 Making API call to /me...');
        const userData = await userApi.getMe();
        console.log('✅ API call successful, user data received');
        setDbUser(userData);
      } catch (error) {
        console.error('❌ Failed to fetch user data:', error);
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
  }, [clerkUser?.id, clerkLoaded]); // Only depend on clerkUser.id, not the whole object

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
