'use client';

import { useUser as useClerkUser, useAuth as useClerkAuth } from '@clerk/nextjs';
import { useState, useEffect } from 'react';

/**
 * Safe wrapper around Clerk hooks
 * 
 * IMPORTANT: This hook MUST be used within ClerkProvider.
 * The ClerkErrorBoundary ensures ClerkProvider is always rendered,
 * so hooks will always be available. If Clerk is down, the error
 * boundary will catch it and show the error screen.
 */
export function useSafeClerk() {
  // Always call hooks unconditionally - React requires this
  // ClerkProvider should always be rendered by ClerkErrorBoundary
  const clerkUser = useClerkUser();
  const clerkAuth = useClerkAuth();
  const [clerkAvailable, setClerkAvailable] = useState(true);

  useEffect(() => {
    // Check if Clerk script is loaded (only in browser)
    if (typeof window === 'undefined') return;

    const checkClerk = () => {
      const clerkScript = document.querySelector('script[data-clerk-js-script="true"]');
      if (!clerkScript && process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
        // Clerk key is set but script not loaded - Clerk might be down
        setTimeout(() => {
          if (!document.querySelector('script[data-clerk-js-script="true"]')) {
            console.warn('Clerk script not loaded after timeout');
            setClerkAvailable(false);
          }
        }, 5000);
      }
    };

    checkClerk();
  }, []);

  // Return Clerk values with availability flag
  return {
    ...clerkUser,
    ...clerkAuth,
    clerkAvailable,
  };
}

