'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { ArrowLeft, CreditCard, Sparkles } from 'lucide-react';

export default function SubscriptionPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
      return;
    }
  }, [user, authLoading]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="text-muted-text">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-dark">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link
          href="/account/settings"
          className="inline-flex items-center gap-2 text-muted-text hover:text-node-volt transition-colors mb-8"
        >
          <ArrowLeft size={18} />
          <span>Back to Settings</span>
        </Link>

        <div className="text-center py-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-node-volt/20 rounded-full mb-6">
            <Sparkles size={40} className="text-node-volt" />
          </div>
          <h1 className="text-4xl font-heading font-bold mb-4">Subscription Management</h1>
          <p className="text-muted-text text-lg mb-8 max-w-2xl mx-auto">
            Subscription management is coming soon. You'll be able to upgrade your plan, manage billing, and access premium features here.
          </p>
          <div className="bg-panel thin-border rounded-lg p-8 max-w-md mx-auto">
            <div className="text-node-volt font-heading font-bold text-xl mb-2">
              FREE Plan
            </div>
            <p className="text-muted-text text-sm">
              Your current subscription tier. Upgrade options coming soon.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

