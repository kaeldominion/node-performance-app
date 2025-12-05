'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { ArrowLeft, Mail, MessageCircle, HelpCircle } from 'lucide-react';

export default function SupportPage() {
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
          href="/dashboard"
          className="inline-flex items-center gap-2 text-muted-text hover:text-node-volt transition-colors mb-8"
        >
          <ArrowLeft size={18} />
          <span>Back to Dashboard</span>
        </Link>

        <div className="mb-8">
          <h1 className="text-4xl font-heading font-bold mb-4">Contact Support</h1>
          <p className="text-muted-text text-lg">
            Need help? We're here for you. Reach out through any of the channels below.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-panel thin-border rounded-lg p-6 hover:border-node-volt transition-colors">
            <div className="flex items-center gap-3 mb-4">
              <Mail size={24} className="text-node-volt" />
              <h2 className="text-xl font-heading font-bold">Email Support</h2>
            </div>
            <p className="text-muted-text mb-4">
              Send us an email and we'll get back to you within 24 hours.
            </p>
            <a
              href="mailto:support@nodeos.app"
              className="text-node-volt hover:underline font-medium"
            >
              support@nodeos.app →
            </a>
          </div>

          <div className="bg-panel thin-border rounded-lg p-6 hover:border-node-volt transition-colors">
            <div className="flex items-center gap-3 mb-4">
              <MessageCircle size={24} className="text-node-volt" />
              <h2 className="text-xl font-heading font-bold">Live Chat</h2>
            </div>
            <p className="text-muted-text mb-4">
              Chat with our support team in real-time (coming soon).
            </p>
            <button
              disabled
              className="text-muted-text cursor-not-allowed font-medium"
            >
              Coming Soon
            </button>
          </div>
        </div>

        <div className="bg-panel thin-border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <HelpCircle size={24} className="text-node-volt" />
            <h2 className="text-xl font-heading font-bold">FAQ & Documentation</h2>
          </div>
          <p className="text-muted-text mb-4">
            Check out our documentation and frequently asked questions.
          </p>
          <Link
            href="/docs"
            className="text-node-volt hover:underline font-medium"
          >
            View Documentation →
          </Link>
        </div>
      </div>
    </div>
  );
}

