// Temporarily disabled Clerk middleware due to Vercel edge runtime issues
// Auth protection is handled in components via useAuth hook
// TODO: Re-enable when Clerk middleware is stable on Vercel edge runtime

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Pass through - auth handled in components
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)).*)',
  ],
};

