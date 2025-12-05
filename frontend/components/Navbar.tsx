'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { XPDisplay } from './gamification/XPDisplay';
import { Logo } from './Logo';

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push('/auth/login');
  };

  return (
    <nav className="border-b thin-border bg-panel">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Logo />

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-4">
            {/* Core Links */}
            <Link href="/programs" className="text-sm text-muted-text hover:text-text-white transition-colors">
              Programs
            </Link>
            <Link href="/exercises" className="text-sm text-muted-text hover:text-text-white transition-colors">
              Exercises
            </Link>
            {user && (
              <>
                <Link href="/ai/workout-builder" className="text-sm text-muted-text hover:text-text-white transition-colors">
                  AI Builder
                </Link>
                <Link href="/workouts/recommended" className="text-sm text-muted-text hover:text-text-white transition-colors">
                  Recommended
                </Link>
                <Link href="/progress" className="text-sm text-muted-text hover:text-text-white transition-colors">
                  Progress
                </Link>
              </>
            )}
            
            {/* Role-based Links */}
            {user && (user.role === 'COACH' || user.isAdmin) && (
              <Link href="/coach" className="text-sm text-muted-text hover:text-text-white transition-colors">
                Coach
              </Link>
            )}
            {user && (user.role === 'GYM_OWNER' || user.isAdmin) && (
              <Link href="/gym" className="text-sm text-muted-text hover:text-text-white transition-colors">
                Gym
              </Link>
            )}
            {user?.isAdmin && (
              <Link href="/admin" className="text-sm text-node-volt hover:text-node-volt/80 transition-colors font-semibold">
                Admin
              </Link>
            )}

            {/* User Section */}
            {user ? (
              <>
                <div className="h-6 w-px bg-border-dark mx-2" />
                <XPDisplay userId={user.id} />
                <div className="h-6 w-px bg-border-dark mx-2" />
                <span className="text-sm text-muted-text truncate max-w-[120px]">{user.name || user.email}</span>
                <button
                  onClick={handleLogout}
                  className="text-sm text-muted-text hover:text-text-white transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link href="/auth/login" className="text-sm text-muted-text hover:text-text-white transition-colors">
                Login
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center gap-3">
            {user && <XPDisplay userId={user.id} className="hidden sm:flex" />}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-muted-text hover:text-text-white transition-colors"
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t thin-border py-4 space-y-3">
            <Link href="/programs" className="block text-muted-text hover:text-text-white transition-colors" onClick={() => setMobileMenuOpen(false)}>
              Programs
            </Link>
            <Link href="/exercises" className="block text-muted-text hover:text-text-white transition-colors" onClick={() => setMobileMenuOpen(false)}>
              Exercises
            </Link>
            <Link href="/theory" className="block text-muted-text hover:text-text-white transition-colors" onClick={() => setMobileMenuOpen(false)}>
              Theory
            </Link>
            <Link href="/leaderboard" className="block text-muted-text hover:text-text-white transition-colors" onClick={() => setMobileMenuOpen(false)}>
              Leaderboard
            </Link>
            {user && (
              <>
                <Link href="/ai/workout-builder" className="block text-muted-text hover:text-text-white transition-colors" onClick={() => setMobileMenuOpen(false)}>
                  AI Builder
                </Link>
                <Link href="/workouts/recommended" className="block text-muted-text hover:text-text-white transition-colors" onClick={() => setMobileMenuOpen(false)}>
                  Recommended
                </Link>
                <Link href="/progress" className="block text-muted-text hover:text-text-white transition-colors" onClick={() => setMobileMenuOpen(false)}>
                  Progress
                </Link>
                {(user.role === 'COACH' || user.isAdmin) && (
                  <Link href="/coach" className="block text-muted-text hover:text-text-white transition-colors" onClick={() => setMobileMenuOpen(false)}>
                    Coach
                  </Link>
                )}
                {(user.role === 'GYM_OWNER' || user.isAdmin) && (
                  <Link href="/gym" className="block text-muted-text hover:text-text-white transition-colors" onClick={() => setMobileMenuOpen(false)}>
                    Gym
                  </Link>
                )}
                {user.isAdmin && (
                  <Link href="/admin" className="block text-node-volt hover:text-node-volt/80 transition-colors font-semibold" onClick={() => setMobileMenuOpen(false)}>
                    Admin
                  </Link>
                )}
                <div className="border-t thin-border pt-3 mt-3">
                  <div className="px-2 py-1 text-sm text-muted-text">{user.name || user.email}</div>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className="block w-full text-left text-sm text-muted-text hover:text-text-white transition-colors mt-2"
                  >
                    Logout
                  </button>
                </div>
              </>
            )}
            {!user && (
              <Link href="/auth/login" className="block text-muted-text hover:text-text-white transition-colors" onClick={() => setMobileMenuOpen(false)}>
                Login
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

