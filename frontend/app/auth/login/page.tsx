'use client';

import { SignIn } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useTheme } from '@/contexts/ThemeContext';
import Link from 'next/link';
import { Logo } from '@/components/Logo';

export default function LoginPage() {
  const router = useRouter();
  const { isSignedIn, isLoaded } = useUser();
  const { theme } = useTheme();
  const [scrollY, setScrollY] = useState(0);
  const isLight = theme === 'light';

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.replace('/dashboard');
    }
  }, [isSignedIn, isLoaded, router]);

  return (
    <div className="min-h-screen bg-dark text-text-white relative overflow-hidden flex items-center justify-center p-6">
      {/* Animated background particles */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-dark via-panel/20 to-dark" />
        <div 
          className="absolute top-16 left-1/4 w-[600px] h-[600px] bg-node-volt/12 blur-3xl animate-pulse-slow"
          style={{ transform: `translateY(${scrollY * 0.3}px)` }}
        />
        <div 
          className="absolute bottom-10 right-1/4 w-[600px] h-[600px] bg-blue-500/12 blur-3xl animate-pulse-slow"
          style={{ transform: `translateY(${-scrollY * 0.2}px)` }}
        />
        <div className="absolute top-1/2 left-1/2 w-[400px] h-[400px] bg-node-volt/5 blur-3xl animate-pulse-slow" 
          style={{ transform: `translate(${-scrollY * 0.15}px, ${scrollY * 0.25}px)` }}
        />
      </div>

      {/* Parallax symbol */}
      <div 
        className="pointer-events-none fixed inset-0 flex items-center justify-center z-0"
        style={{ transform: `translateY(${scrollY * 0.5}px)` }}
      >
        <div className="font-heading font-bold text-[55vh] text-text-white/5 leading-none select-none animate-fade-in-slow">
          Ø
        </div>
      </div>

      {/* Grid overlay */}
      <div className="fixed inset-0 grid-overlay opacity-20 z-0" />

      {/* Content */}
      <div className="relative z-10 w-full max-w-md mx-auto animate-fade-in">
        <div className="bg-panel/80 backdrop-blur-xl thin-border p-10 shadow-2xl hover:border-node-volt transition-all duration-300">
          {/* Logo */}
          <div className="text-center mb-10">
            <Link href="/" className="inline-block mb-4 hover:scale-105 transition-transform duration-300">
              <Logo className="text-4xl" />
            </Link>
            <div className="inline-flex items-center gap-2 px-4 py-2 thin-border border-node-volt/40 bg-node-volt/10 backdrop-blur-sm mb-4">
              <span className="w-2 h-2 bg-node-volt animate-pulse" />
              <span className="text-[11px] font-heading text-node-volt uppercase tracking-[0.3em]">NØDE OS</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-heading font-bold mb-3">
              ACCESS THE <span className="text-node-volt">NØDE</span>
            </h1>
            <p className="text-muted-text text-base font-body">Performance Training Infrastructure</p>
          </div>

          <div className="flex justify-center">
            <SignIn
              appearance={{
                elements: {
                  rootBox: 'w-full max-w-full',
                  card: 'bg-transparent shadow-none border-none p-0 w-full',
                  main: 'w-full',
                  form: 'w-full',
                  formButtonPrimary: isLight
                    ? 'bg-node-volt text-black font-heading font-bold hover:bg-text-white transition-all duration-300 uppercase tracking-[0.2em] text-sm shadow-[0_10px_40px_rgba(204,255,0,0.25)] hover:shadow-[0_15px_50px_rgba(204,255,0,0.4)]'
                    : 'bg-node-volt text-black font-heading font-bold hover:bg-text-white transition-all duration-300 uppercase tracking-[0.2em] text-sm shadow-[0_10px_40px_rgba(204,255,0,0.25)] hover:shadow-[0_15px_50px_rgba(204,255,0,0.4)]',
                  formButtonPrimaryText: 'text-black font-heading',
                  formFieldInput: isLight
                    ? 'bg-white border-2 border-zinc-300 text-gray-900 focus:border-node-volt focus:ring-2 focus:ring-node-volt/20 transition-all duration-300 font-body px-4 py-3'
                    : 'bg-zinc-900 border-2 border-zinc-700 text-white focus:border-node-volt focus:ring-2 focus:ring-node-volt/20 transition-all duration-300 font-body px-4 py-3',
                  formFieldLabel: isLight
                    ? 'text-gray-900 font-body font-medium mb-2'
                    : 'text-white font-body font-medium mb-2',
                  socialButtonsBlockButton: isLight
                    ? 'bg-white border-2 border-zinc-300 text-gray-900 hover:bg-gray-50 hover:border-node-volt transition-all duration-300 font-heading font-bold text-xs uppercase tracking-[0.2em]'
                    : 'bg-white border-2 border-zinc-400 text-gray-900 hover:bg-gray-100 hover:border-node-volt transition-all duration-300 font-heading font-bold text-xs uppercase tracking-[0.2em]',
                  socialButtonsBlockButtonText: 'font-heading text-gray-900',
                  formFieldInputShowPasswordButton: 'text-node-volt hover:text-node-volt/80',
                  formFieldInputShowPasswordIcon: 'text-node-volt',
                  footerActionLink: 'text-node-volt hover:text-node-volt/80 font-heading font-bold transition-colors',
                  footerAction: isLight ? 'text-muted-text font-body' : 'text-muted-text font-body',
                  identityPreviewText: isLight ? 'text-text-white font-body' : 'text-text-white font-body',
                  identityPreviewEditButton: 'text-node-volt hover:text-node-volt/80',
                  formResendCodeLink: 'text-node-volt hover:text-node-volt/80 font-heading',
                  alertText: isLight ? 'text-muted-text font-body' : 'text-muted-text font-body',
                  formFieldErrorText: 'text-red-400 font-body text-sm',
                  formFieldSuccessText: 'text-node-volt font-body text-sm',
                  headerTitle: 'hidden',
                  headerSubtitle: 'hidden',
                },
                variables: {
                  colorPrimary: isLight ? '#0066ff' : '#ccff00',
                  colorText: isLight ? '#111827' : '#ffffff',
                  colorTextSecondary: isLight ? '#6b7280' : '#a0a0a0',
                  colorBackground: isLight ? '#ffffff' : '#0a0a0a',
                  colorInputBackground: isLight ? '#ffffff' : '#0a0a0a',
                  colorInputText: isLight ? '#111827' : '#ffffff',
                  borderRadius: '0',
                  fontFamily: 'var(--font-space-grotesk)',
                },
              }}
              afterSignInUrl="/dashboard"
              routing="path"
              path="/auth/login"
            />
          </div>

          {/* Footer */}
          <div className="mt-8 pt-8 border-t thin-border text-center">
            <p className="text-muted-text text-sm font-body mb-4">
              Don't have an account?{' '}
              <Link href="/auth/register" className="text-node-volt hover:text-node-volt/80 font-heading font-bold transition-colors">
                Join NØDE
              </Link>
            </p>
            <Link 
              href="/" 
              className="text-muted-text hover:text-node-volt text-sm font-body transition-colors"
            >
              ← Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
