import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Pass-through proxy - Clerk middleware causes Vercel edge runtime errors
// Auth protection handled in components via useAuth hook
export function proxy(request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)).*)',
  ],
};

