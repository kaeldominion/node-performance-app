'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useRouter } from 'next/navigation';
import { XPDisplay } from './gamification/XPDisplay';
import { Logo } from './Logo';
import { Icons } from '@/lib/iconMapping';
import { Moon, Sun } from 'lucide-react';
import { UserMenu } from './UserMenu';
import { NotificationBell } from './notifications/NotificationBell';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
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
            {/* Core Links - Focused on primary features */}
            {user && (
              <Link href="/dashboard" className="text-sm text-muted-text hover:text-text-white transition-colors">
                Dashboard
              </Link>
            )}
            <Link
              href="/ai/workout-builder"
              className="relative text-sm font-bold text-node-volt hover:text-node-volt/80 transition-colors flex items-center gap-2 px-3 py-1.5 rounded-lg bg-node-volt/10 border border-node-volt/30"
            >
              <Icons.AI_BUILDER size={18} />
              AI Builder
            </Link>
            <Link href="/workouts" className="text-sm text-muted-text hover:text-text-white transition-colors">
              Workouts
            </Link>
            {user && (
              <Link href="/exercises" className="text-sm text-muted-text hover:text-text-white transition-colors flex items-center gap-1">
                <Icons.EXERCISE_LIBRARY size={16} />
                Exercises
              </Link>
            )}
            {(user?.role === 'COACH' || user?.role === 'SUPERADMIN') && (
              <Link href="/coach" className="text-sm text-node-volt hover:text-node-volt/80 transition-colors font-semibold">
                Coach
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
                <div className="flex items-center gap-2">
                  <NotificationBell />
                  {/* Theme Toggle - Next to notifications and user menu */}
                  <button
                    onClick={toggleTheme}
                    className="p-2 rounded-lg bg-panel/50 hover:bg-panel thin-border text-node-volt hover:text-node-volt/80 transition-colors flex items-center justify-center"
                    title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                    aria-label="Toggle theme"
                  >
                    {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                  </button>
                  <UserMenu user={user} onLogout={handleLogout} />
                </div>
              </>
            ) : (
              <>
                {/* Theme Toggle - Always visible, even when not logged in */}
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-lg bg-panel/50 hover:bg-panel thin-border text-node-volt hover:text-node-volt/80 transition-colors flex items-center justify-center"
                  title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                  aria-label="Toggle theme"
                >
                  {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                </button>
                <Link href="/auth/login" className="text-sm text-muted-text hover:text-text-white transition-colors">
                  Login
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center gap-2">
            {user && (
              <>
                <XPDisplay userId={user.id} className="hidden sm:flex" />
                <NotificationBell />
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-lg bg-panel/50 hover:bg-panel thin-border text-node-volt hover:text-node-volt/80 transition-colors flex items-center justify-center"
                  title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                  aria-label="Toggle theme"
                >
                  {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                </button>
                <UserMenu user={user} onLogout={handleLogout} />
              </>
            )}
            {!user && (
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg bg-panel/50 hover:bg-panel thin-border text-node-volt hover:text-node-volt/80 transition-colors flex items-center justify-center"
                title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
              </button>
            )}
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
          <div className="lg:hidden border-t thin-border py-4 space-y-2">
            {/* Navigation Links */}
            {user && (
              <Link href="/dashboard" className="block px-4 py-2 text-muted-text hover:text-text-white hover:bg-panel/50 transition-colors rounded" onClick={() => setMobileMenuOpen(false)}>
                Dashboard
              </Link>
            )}
            <Link
              href="/ai/workout-builder"
              className="flex items-center gap-2 text-node-volt font-bold hover:text-node-volt/80 transition-colors px-4 py-2 rounded-lg bg-node-volt/10 border border-node-volt/30 mx-4"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Icons.AI_BUILDER size={18} />
              AI Builder
            </Link>
            <Link href="/workouts" className="block px-4 py-2 text-muted-text hover:text-text-white hover:bg-panel/50 transition-colors rounded" onClick={() => setMobileMenuOpen(false)}>
              Workouts
            </Link>
            {user && (
              <Link href="/exercises" className="flex items-center gap-2 px-4 py-2 text-muted-text hover:text-text-white hover:bg-panel/50 transition-colors rounded" onClick={() => setMobileMenuOpen(false)}>
                <Icons.EXERCISE_LIBRARY size={16} />
                Exercises
              </Link>
            )}
            {(user?.role === 'COACH' || user?.role === 'SUPERADMIN') && (
              <Link href="/coach" className="block px-4 py-2 text-node-volt hover:text-node-volt/80 hover:bg-panel/50 transition-colors font-semibold rounded" onClick={() => setMobileMenuOpen(false)}>
                Coach
              </Link>
            )}
            {user?.isAdmin && (
              <Link href="/admin" className="block px-4 py-2 text-node-volt hover:text-node-volt/80 hover:bg-panel/50 transition-colors font-semibold rounded" onClick={() => setMobileMenuOpen(false)}>
                Admin
              </Link>
            )}
            
            {/* User Account Section */}
            {user && (
              <div className="border-t thin-border pt-3 mt-3 px-4 space-y-2">
                <Link
                  href="/account/settings"
                  className="block py-2 text-muted-text hover:text-text-white transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Account Settings
                </Link>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="block w-full text-left py-2 text-muted-text hover:text-text-white transition-colors"
                >
                  Logout
                </button>
              </div>
            )}
            
            {/* Login for non-authenticated users */}
            {!user && (
              <div className="px-4">
                <Link href="/auth/login" className="block py-2 text-muted-text hover:text-text-white transition-colors" onClick={() => setMobileMenuOpen(false)}>
                  Login
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

