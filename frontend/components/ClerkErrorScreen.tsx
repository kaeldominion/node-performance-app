'use client';

import { useEffect, useState } from 'react';
import { Logo } from './Logo';

interface ClerkErrorScreenProps {
  onRetry?: () => void;
}

export function ClerkErrorScreen({ onRetry }: ClerkErrorScreenProps) {
  const [retryCount, setRetryCount] = useState(0);
  const [autoRetrying, setAutoRetrying] = useState(false);

  useEffect(() => {
    // Auto-retry every 30 seconds
    const interval = setInterval(() => {
      setAutoRetrying(true);
      setTimeout(() => {
        if (onRetry) {
          onRetry();
        }
        window.location.reload();
      }, 1000);
    }, 30000);

    return () => clearInterval(interval);
  }, [onRetry]);

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    setAutoRetrying(true);
    setTimeout(() => {
      if (onRetry) {
        onRetry();
      }
      window.location.reload();
    }, 500);
  };

  return (
    <div className="min-h-screen bg-dark text-text-white flex items-center justify-center p-6">
      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-node-volt/5 blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-red-500/5 blur-3xl" />
        <div className="grid-overlay opacity-20" />
      </div>

      <div className="relative z-10 max-w-2xl w-full">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Logo className="text-3xl" />
        </div>

        {/* Error Card */}
        <div className="thin-border bg-panel/80 backdrop-blur-md p-8 space-y-6">
          {/* Error Icon */}
          <div className="flex justify-center">
            <div className="w-20 h-20 thin-border border-red-500/50 bg-red-500/10 flex items-center justify-center">
              <svg
                className="w-10 h-10 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
          </div>

          {/* Error Message */}
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-heading font-bold text-text-white">
              Authentication Service Unavailable
            </h1>
            <p className="text-muted-text font-body leading-relaxed">
              We're experiencing issues with our authentication provider. This is a temporary
              service interruption and we're working to resolve it.
            </p>
            <div className="pt-4 border-t thin-border">
              <p className="text-sm text-muted-text font-body">
                The site will automatically retry in a few moments.
              </p>
            </div>
          </div>

          {/* Status Indicator */}
          <div className="flex items-center justify-center gap-3 pt-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="text-xs text-muted-text uppercase tracking-[0.2em] font-heading">
                Service Interrupted
              </span>
            </div>
          </div>

          {/* Retry Button */}
          <div className="flex flex-col items-center gap-4 pt-6">
            <button
              onClick={handleRetry}
              disabled={autoRetrying}
              className="px-8 py-4 thin-border border-node-volt text-node-volt font-heading font-bold text-sm uppercase tracking-[0.25em] hover:bg-node-volt hover:text-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {autoRetrying ? 'Retrying...' : 'Retry Now'}
            </button>
            {retryCount > 0 && (
              <p className="text-xs text-muted-text">
                Retry attempt {retryCount}
              </p>
            )}
          </div>

          {/* Additional Info */}
          <div className="pt-6 border-t thin-border">
            <div className="space-y-3 text-sm text-muted-text font-body">
              <p className="font-heading text-text-white mb-2">What you can do:</p>
              <ul className="space-y-2 list-none">
                <li className="flex items-start gap-2">
                  <span className="text-node-volt font-heading">•</span>
                  <span>Wait a few moments and try again</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-node-volt font-heading">•</span>
                  <span>Check our status page for updates</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-node-volt font-heading">•</span>
                  <span>If you were already logged in, your session may still be active</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-xs text-muted-text font-body">
            NØDE OS • Authentication Service Interruption
          </p>
        </div>
      </div>
    </div>
  );
}

