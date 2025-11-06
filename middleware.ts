import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;

  // --- Case 1: User is NOT logged in ---
  if (!token) {
    // If trying to access any protected page, redirect to landing page
    if (pathname.startsWith('/dashboard') || pathname.startsWith('/onboarding')) {
      return NextResponse.redirect(new URL('/', req.url));
    }
    // Otherwise, allow access to public pages (like the landing page itself)
    return NextResponse.next();
  }

  // --- Case 2: User IS logged in ---
  const onboardingCompleted = token.onboardingCompleted as boolean;

  // If onboarding is not complete
  if (!onboardingCompleted) {
    // If they are not already on the onboarding path, redirect them there.
    if (!pathname.startsWith('/onboarding')) {
      return NextResponse.redirect(new URL('/onboarding', req.url));
    }
    // If they are on the onboarding path, let them be.
    return NextResponse.next();
  }

  // If onboarding IS complete
  if (onboardingCompleted) {
    // If they are on the landing page or trying to access onboarding again, 
    // redirect them to the dashboard.
    if (pathname === '/' || pathname.startsWith('/onboarding')) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
  }

  // --- Default Case ---
  // For any other case (e.g., logged-in user on the dashboard), allow the request.
  return NextResponse.next();
}

// Configure the middleware to run on specific paths
export const config = {
  matcher: [
    '/', // The landing page
    '/dashboard/:path*', // All pages under the dashboard
    '/onboarding/:path*', // All pages under onboarding
  ],
};
