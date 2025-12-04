import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isPublicRoute = createRouteMatcher([
  '/',
  '/auth/login(.*)',
  '/auth/register(.*)',
  '/api/webhooks(.*)',
]);

export default clerkMiddleware((auth, req) => {
  // Protect all routes except public ones
  if (!isPublicRoute(req)) {
    auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)).*)',
  ],
};

