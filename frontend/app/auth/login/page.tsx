'use client';

import { SignIn } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useUser } from '@clerk/nextjs';

export default function LoginPage() {
  const router = useRouter();
  const { isSignedIn } = useUser();

  useEffect(() => {
    if (isSignedIn) {
      router.push('/dashboard');
    }
  }, [isSignedIn, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark p-6">
      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-node-volt/5 blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/5 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="bg-panel/80 backdrop-blur-xl thin-border p-10 shadow-2xl">
          {/* Logo */}
          <div className="text-center mb-10">
            <h1 className="text-5xl font-bold mb-3 font-heading">
              N<span className="text-node-volt">Ø</span>DE
            </h1>
            <p className="text-muted-text text-lg font-body">Performance Training Infrastructure</p>
          </div>

          <SignIn
            appearance={{
              elements: {
                rootBox: 'mx-auto',
                card: 'bg-transparent shadow-none border-none',
                headerTitle: 'hidden',
                headerSubtitle: 'hidden',
                socialButtonsBlockButton: 'bg-panel/50 thin-border text-text-white hover:bg-panel/80',
                formButtonPrimary: 'bg-node-volt text-dark font-heading font-bold hover:bg-text-white',
                formFieldInput: 'bg-panel/50 thin-border text-text-white',
                formFieldLabel: 'text-text-white font-body',
                footerActionLink: 'text-node-volt hover:text-node-volt/80',
                identityPreviewText: 'text-text-white',
                identityPreviewEditButton: 'text-node-volt',
              },
            }}
            afterSignInUrl="/dashboard"
          />
        </div>
      </div>
    </div>
  );
}
