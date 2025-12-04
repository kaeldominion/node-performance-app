'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      router.push('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-deep-asphalt p-4">
      <div className="w-full max-w-md bg-concrete-grey border border-border-dark rounded-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">
            N<span className="text-node-volt">Ø</span>DE
          </h1>
          <p className="text-muted-text">Performance Training Platform</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-900/20 border border-red-500/50 rounded p-3 text-red-400 text-sm">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-tech-grey border border-border-dark rounded px-4 py-2 text-text-white focus:outline-none focus:border-node-volt"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-tech-grey border border-border-dark rounded px-4 py-2 text-text-white focus:outline-none focus:border-node-volt"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-node-volt text-deep-asphalt font-bold py-3 rounded hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="mt-6 text-center text-muted-text text-sm">
          Don't have an account?{' '}
          <Link href="/auth/register" className="text-node-volt hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}

