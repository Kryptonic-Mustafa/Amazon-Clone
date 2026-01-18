// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // 1. Check if the user is visiting ANY admin page
  if (path.startsWith('/admin')) {
    
    // Exception: Allow access to the actual Login Page
    if (path === '/admin/login') {
      return NextResponse.next();
    }

    // 2. Check for the Session Cookie
    const token = request.cookies.get('admin_token')?.value;

    // 3. If NO token, force them to Login
    if (!token) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  return NextResponse.next();
}

// Configuration: Only run this middleware on paths starting with /admin
export const config = {
  matcher: ['/admin/:path*'],
};