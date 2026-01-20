import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  // Paths that require authentication
  const protectedPaths = ['/dashboard'];
  
  // Paths that are for guests only (redirect to dashboard if logged in)
  const guestPaths = ['/login', '/register'];

  const isProtected = protectedPaths.some((path) => pathname.startsWith(path));
  const isGuest = guestPaths.some((path) => pathname.startsWith(path));

  if (isProtected && !token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isGuest && token) {
    // Ideally we would verify the token here, but for performance in middleware
    // we often just check existence. In a real world app, we might do a stateless check if it's a JWT.
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/register'],
};
