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
            {user?.isAdmin && (
              <Link href="/admin" className="text-sm text-node-volt hover:text-node-volt/80 transition-colors font-semibold">
                Admin
              </Link>
            )}

            {/* Theme Toggle - Always visible */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-panel/50 hover:bg-panel thin-border text-node-volt hover:text-node-volt/80 transition-colors flex items-center justify-center"
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* User Section */}
            {user ? (
              <>
                <div className="h-6 w-px bg-border-dark mx-2" />
                <XPDisplay userId={user.id} />
                <div className="h-6 w-px bg-border-dark mx-2" />
                <NotificationBell />
                <div className="h-6 w-px bg-border-dark mx-2" />
                <UserMenu user={user} onLogout={handleLogout} />
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
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-panel/50 hover:bg-panel thin-border text-node-volt hover:text-node-volt/80 transition-colors flex items-center justify-center"
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
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
            {user && (
              <Link href="/dashboard" className="block text-muted-text hover:text-text-white transition-colors" onClick={() => setMobileMenuOpen(false)}>
                Dashboard
              </Link>
            )}
            <Link
              href="/ai/workout-builder"
              className="flex items-center gap-2 text-node-volt font-bold hover:text-node-volt/80 transition-colors px-3 py-2 rounded-lg bg-node-volt/10 border border-node-volt/30 mb-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Icons.AI_BUILDER size={18} />
              AI Builder
            </Link>
            <Link href="/workouts" className="block text-muted-text hover:text-text-white transition-colors" onClick={() => setMobileMenuOpen(false)}>
              Workouts
            </Link>
            {user && (
              <>
                {user.isAdmin && (
                  <Link href="/admin" className="block text-node-volt hover:text-node-volt/80 transition-colors font-semibold" onClick={() => setMobileMenuOpen(false)}>
                    Admin
                  </Link>
                )}
                <div className="border-t thin-border pt-3 mt-3">
                  <Link
                    href="/account/settings"
                    className="block text-muted-text hover:text-text-white transition-colors px-2 py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Account Settings
                  </Link>
                  <button
                    onClick={toggleTheme}
                    className="flex items-center gap-2 w-full text-left text-sm text-muted-text hover:text-text-white transition-colors mt-2 px-2"
                  >
                    {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                    Switch to {theme === 'dark' ? 'Light' : 'Dark'} Mode
                  </button>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className="block w-full text-left text-sm text-muted-text hover:text-text-white transition-colors mt-2 px-2"
                  >
                    Logout
                  </button>
                </div>
              </>
            )}
            {!user && (
              <>
                <button
                  onClick={() => {
                    toggleTheme();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-2 w-full text-left text-sm text-muted-text hover:text-text-white transition-colors px-2"
                >
                  {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                  Switch to {theme === 'dark' ? 'Light' : 'Dark'} Mode
                </button>
                <Link href="/auth/login" className="block text-muted-text hover:text-text-white transition-colors" onClick={() => setMobileMenuOpen(false)}>
                  Login
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

