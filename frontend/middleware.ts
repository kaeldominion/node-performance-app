import { clerkMiddleware } from '@clerk/nextjs/server';

// Simplified middleware - just use Clerk's default protection
// Public routes are handled by Clerk automatically based on SignIn/SignUp components
export default clerkMiddleware();

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)).*)',
  ],
};

