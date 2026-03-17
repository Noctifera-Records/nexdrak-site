import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  try {
    // Check for session cookie presence
    // Better Auth uses "better-auth.session_token" or "__Secure-better-auth.session_token"
    const sessionToken = request.cookies.get("better-auth.session_token") || request.cookies.get("__Secure-better-auth.session_token");

    const protectedPaths = ['/admin', '/account', '/downloads'];
    const isProtected = protectedPaths.some(path => request.nextUrl.pathname.startsWith(path));

    if (!sessionToken && isProtected) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('callbackUrl', request.nextUrl.pathname);
        return NextResponse.redirect(loginUrl);
    }

    // Add header to help with Cloudflare rate limiting for authenticated users
    const response = NextResponse.next();
    if (sessionToken) {
      response.headers.set('x-authenticated-user', 'true');
    }
    return response;
  } catch (error) {
    console.error('Middleware Error:', error);
    // In case of error, allow the request to proceed to avoid breaking the site
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/account/:path*',
    '/downloads/:path*',
  ]
}
