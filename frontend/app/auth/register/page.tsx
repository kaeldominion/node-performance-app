'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await register(email, password, name);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark p-6">
      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-node-volt/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="bg-panel/80 backdrop-blur-xl thin-border rounded-3xl p-10 shadow-2xl">
          {/* Logo */}
          <div className="text-center mb-10">
            <h1 className="text-5xl font-bold mb-3 font-heading">
              N<span className="text-node-volt">Ø</span>DE
            </h1>
            <p className="text-muted-text text-lg font-body">Create your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="name" className="block text-sm font-semibold text-text-white">
                Name <span className="text-muted-text font-normal">(optional)</span>
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-panel/50 thin-border rounded-xl px-4 py-3.5 text-text-white placeholder:text-muted-text/50 focus:outline-none focus:border-node-volt/50 focus:ring-2 focus:ring-node-volt/20 transition-all"
                placeholder="John Doe"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-semibold text-text-white">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-panel/50 thin-border rounded-xl px-4 py-3.5 text-text-white placeholder:text-muted-text/50 focus:outline-none focus:border-node-volt/50 focus:ring-2 focus:ring-node-volt/20 transition-all"
                placeholder="you@example.com"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-semibold text-text-white">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full bg-panel/50 thin-border rounded-xl px-4 py-3.5 text-text-white placeholder:text-muted-text/50 focus:outline-none focus:border-node-volt/50 focus:ring-2 focus:ring-node-volt/20 transition-all"
                placeholder="••••••••"
              />
              <p className="text-xs text-muted-text">Minimum 6 characters</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-node-volt text-dark font-bold py-4 rounded-xl hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-200 shadow-[0_0_20px_rgba(204,255,0,0.3)] hover:shadow-[0_0_30px_rgba(204,255,0,0.5)] font-heading"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="mt-8 text-center text-muted-text text-sm">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-node-volt font-semibold hover:text-node-volt/80 transition-colors">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
