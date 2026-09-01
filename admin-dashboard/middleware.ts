// middleware.ts (project root)
// Install: npm install @clerk/nextjs
//
// This is the FIRST layer of protection: it makes sure a visitor is
// signed in at all before /admin/* ever loads. The SECOND layer (are they
// actually on the admin allow-list, not just any signed-in customer) is
// checked separately in app/admin/layout.tsx via requireAdmin().

import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isAdminRoute = createRouteMatcher(['/admin(.*)']);

export default clerkMiddleware(async (auth, req) => {
  if (isAdminRoute(req)) {
    await auth.protect(); // redirects to sign-in if not authenticated
  }
});

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};
