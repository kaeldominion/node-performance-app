'use client';

import { useEffect, useState, ReactNode, Component, ErrorInfo, ReactElement } from 'react';
import { ClerkProvider } from '@clerk/nextjs';
import { ClerkErrorScreen } from './ClerkErrorScreen';

interface ClerkErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ClerkErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ClerkErrorBoundaryClass extends Component<
  { children: ReactNode; isProduction: boolean; isDevMode: boolean },
  ClerkErrorBoundaryState
> {
  constructor(props: { children: ReactNode; isProduction: boolean; isDevMode: boolean }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ClerkErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ClerkErrorBoundary caught error:', error, errorInfo);
    
    // Check if it's a Clerk-related error
    const isClerkError = 
      error.message?.includes('ClerkProvider') ||
      error.message?.includes('useUser') ||
      error.message?.includes('clerk');
    
    if (isClerkError && this.props.isProduction) {
      // In production, show error screen for Clerk errors
      this.setState({ hasError: true, error });
    } else if (isClerkError && this.props.isDevMode) {
      // In dev mode, log but don't show error screen
      console.log('🔧 DEV MODE: Clerk error caught, continuing with dev mode');
    }
  }

  render() {
    if (this.state.hasError && this.props.isProduction) {
      return <ClerkErrorScreen onRetry={() => window.location.reload()} />;
    }

    if (this.state.hasError && this.props.isDevMode) {
      // In dev mode, render children anyway (dev mode will handle it)
      return <>{this.props.children}</>;
    }

    return <>{this.props.children}</>;
  }
}

export function ClerkErrorBoundary({ children, fallback }: ClerkErrorBoundaryProps) {
  const [clerkKey, setClerkKey] = useState<string | null>(null);
  const [clerkInitError, setClerkInitError] = useState(false);
  const isDevMode = process.env.NODE_ENV === 'development' || 
                    process.env.NEXT_PUBLIC_DEV_MODE === 'true';
  const isProduction = process.env.NODE_ENV === 'production';

  useEffect(() => {
    // Get Clerk key
    const key = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || '';
    setClerkKey(key);
  }, []);

  // If no Clerk key, render without ClerkProvider
  if (!clerkKey) {
    if (isDevMode) {
      console.log('🔧 DEV MODE: No Clerk key, rendering without ClerkProvider');
    }
    return <>{children}</>;
  }

  // If Clerk initialization failed, show error screen in production
  if (clerkInitError && isProduction) {
    return <ClerkErrorScreen onRetry={() => window.location.reload()} />;
  }

  // Always try to render ClerkProvider, let error boundary catch failures
  // The error boundary will catch any errors from hooks or ClerkProvider
  return (
    <ClerkErrorBoundaryClass isProduction={isProduction} isDevMode={isDevMode}>
      <ClerkProvider publishableKey={clerkKey}>
        {children}
      </ClerkProvider>
    </ClerkErrorBoundaryClass>
  );
}

