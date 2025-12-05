'use client';

import { useUser, useAuth as useClerkAuth } from '@clerk/nextjs';
import { useEffect, useState, useRef } from 'react';
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

// Mock user for dev mode when Clerk is unavailable
const DEV_MOCK_USER: User = {
  id: 'dev-user-123',
  email: 'dev@node.local',
  name: 'Dev User',
  role: 'HOME_USER',
  isAdmin: true,
};

// Wrapper to maintain compatibility with existing code
export function useAuth(): AuthContextType {
  const { user: clerkUser, isLoaded: clerkLoaded } = useUser();
  const { signOut, getToken } = useClerkAuth();
  const [clerkError, setClerkError] = useState(false);
  const [dbUser, setDbUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Check if we should use dev mode - only when explicitly enabled via env var
  // Don't auto-enable just because we're in development - Clerk should work in dev too
  const isDevMode = process.env.NEXT_PUBLIC_DEV_MODE === 'true';
  
  // Detect Clerk failures - only in dev mode and only if explicitly enabled
  useEffect(() => {
    // Only enable dev mode fallback if explicitly set via env var, not just because we're in development
    const devModeExplicit = process.env.NEXT_PUBLIC_DEV_MODE === 'true';
    if (!devModeExplicit) {
      setClerkError(false);
      return;
    }
    
    // If Clerk hasn't loaded after 5 seconds, assume it's down
    const timeout = setTimeout(() => {
      if (!clerkLoaded) {
        console.warn('⚠️ Clerk not loaded after 5s, enabling dev mode fallback');
        setClerkError(true);
      }
    }, 5000);
    
    return () => clearTimeout(timeout);
  }, [clerkLoaded]);
  
  // Debug: Log user status
  useEffect(() => {
    if (!clerkError) {
      console.log('Clerk User Status:', {
        isLoaded: clerkLoaded,
        hasUser: !!clerkUser,
        userId: clerkUser?.id,
        email: clerkUser?.emailAddresses[0]?.emailAddress,
      });
    }
  }, [clerkUser, clerkLoaded, clerkError]);

  // Update API token when Clerk user changes
  useEffect(() => {
    const updateToken = async () => {
      // If Clerk is down and we're in dev mode, use mock token
      if (isDevMode && clerkError) {
        console.log('🔧 DEV MODE: Using mock token (Clerk unavailable)');
        setApiToken('dev-mock-token');
        return;
      }
      
      console.log('Token update effect triggered', { 
        hasClerkUser: !!clerkUser, 
        clerkUserId: clerkUser?.id,
        isLoaded: clerkLoaded,
        clerkError,
      });
      
      if (!clerkLoaded) {
        console.log('Clerk not loaded yet, waiting...');
        return;
      }
      
      if (clerkUser) {
        try {
          console.log('Attempting to get token from Clerk...', { userId: clerkUser.id });
          // Get token from Clerk - try with and without template
          let token = await getToken();
          
          // If no token, try with template
          if (!token) {
            console.log('No token without template, trying with template...');
            token = await getToken({ template: 'default' }).catch(() => null);
          }
          
          console.log('Token received from Clerk:', { 
            hasToken: !!token, 
            tokenLength: token?.length,
            tokenPreview: token ? token.substring(0, 30) + '...' : null,
          });
          
          if (token) {
            setApiToken(token);
            console.log('Token set for API requests');
          } else {
            console.warn('No token received from Clerk (token is null/undefined)');
            // Only use dev token if Clerk is actually unavailable (clerkError), not just in dev mode
            if (isDevMode && clerkError) {
              console.log('🔧 DEV MODE: Falling back to mock token (Clerk unavailable)');
              setApiToken('dev-mock-token');
            } else {
              setApiToken(null);
            }
          }
        } catch (error) {
          console.error('Failed to get Clerk token:', {
            error,
            errorMessage: error instanceof Error ? error.message : String(error),
            errorStack: error instanceof Error ? error.stack : undefined,
          });
          // Only use dev token if explicitly in dev mode and Clerk is unavailable
          if (isDevMode) {
            console.log('🔧 DEV MODE: Clerk error, using mock token');
            setApiToken('dev-mock-token');
            setClerkError(true);
          } else {
            setApiToken(null);
          }
        }
      } else {
        console.log('No Clerk user, clearing token');
        // Only keep mock token if explicitly in dev mode and Clerk is unavailable
        if (isDevMode && clerkError) {
          console.log('🔧 DEV MODE: Keeping mock token (Clerk unavailable)');
        } else {
          setApiToken(null);
        }
      }
    };
    updateToken();
  }, [clerkUser, clerkLoaded, getToken, clerkError, isDevMode]);

  // Sync Clerk user with database user
  useEffect(() => {
    // If Clerk is down and we're in dev mode, use mock user
    if (isDevMode && clerkError) {
      console.log('🔧 DEV MODE: Using mock user (Clerk unavailable)');
      setApiToken('dev-mock-token');
      // Try to fetch from backend, but fallback to mock if it fails
      userApi.getMe()
        .then((userData) => {
          console.log('✅ DEV MODE: Backend user found:', userData);
          setDbUser(userData);
        })
        .catch((error) => {
          console.log('⚠️ DEV MODE: Backend unavailable, using mock user:', error.message);
          setDbUser(DEV_MOCK_USER);
        })
        .finally(() => {
          setLoading(false);
        });
      return;
    }
    
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
      console.log('fetchUserData: Ensuring token is available...');
      try {
        // Get token directly from Clerk
        const token = await getToken();
        if (token) {
          console.log('Got token in fetchUserData, setting it...');
          setApiToken(token);
          // Small delay to ensure token is set in the interceptor
          await new Promise(resolve => setTimeout(resolve, 50));
        } else {
          console.error('No token available from Clerk in fetchUserData');
        }
      } catch (error) {
        console.error('Failed to get token in fetchUserData:', error);
      }
      
      try {
        console.log('Making API call to /me...');
        const userData = await userApi.getMe();
        console.log('API call successful, user data received:', { userId: userData?.id, email: userData?.email });
        setDbUser(userData);
      } catch (error: any) {
        console.error('Failed to fetch user data:', {
          error,
          errorMessage: error?.message,
          errorResponse: error?.response?.data,
          status: error?.response?.status,
        });
        
        // If it's a 401, the token might not be valid yet - wait and retry once
        if (error?.response?.status === 401) {
          console.log('Got 401, waiting 500ms and retrying...');
          await new Promise(resolve => setTimeout(resolve, 500));
          try {
            // Try to get token again
            const retryToken = await getToken();
            if (retryToken) {
              setApiToken(retryToken);
              await new Promise(resolve => setTimeout(resolve, 100));
              const userData = await userApi.getMe();
              console.log('Retry successful, user data received');
              setDbUser(userData);
              setLoading(false);
              return;
            }
          } catch (retryError) {
            console.error('Retry also failed:', retryError);
          }
        }
        
        // Fallback to Clerk user data if API fails
        // Always use Clerk user data when Clerk is working, even if backend fails
        console.log('Using fallback Clerk user data');
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
    
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, [clerkUser?.id, clerkLoaded, clerkError, isDevMode]); // Only depend on clerkUser.id, not the whole object

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
    if (isDevMode && clerkError) {
      console.log('🔧 DEV MODE: Mock logout');
      setDbUser(null);
      setApiToken(null);
      return;
    }
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
