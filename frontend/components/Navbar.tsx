'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/auth/login');
  };

  return (
    <nav className="border-b border-border-dark bg-concrete-grey">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="text-2xl font-bold">
            N<span className="text-node-volt">Ø</span>DE
          </Link>

          <div className="flex items-center gap-6">
            <Link href="/programs" className="text-muted-text hover:text-text-white transition-colors">
              Programs
            </Link>
            {user && (
              <Link href="/ai/workout-builder" className="text-muted-text hover:text-text-white transition-colors">
                AI Builder
              </Link>
            )}
            {user ? (
              <>
                <span className="text-muted-text">{user.name || user.email}</span>
                <button
                  onClick={handleLogout}
                  className="text-muted-text hover:text-text-white transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link href="/auth/login" className="text-muted-text hover:text-text-white transition-colors">
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

