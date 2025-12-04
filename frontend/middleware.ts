import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Simple middleware that doesn't use Clerk (temporary fix)
// We'll handle auth in the components instead
export function middleware(request: NextRequest) {
  // Just pass through for now - auth will be handled by components
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)).*)',
  ],
};

