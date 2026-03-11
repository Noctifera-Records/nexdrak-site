import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  try {
    // Check for session cookie presence
    // Better Auth uses "better-auth.session_token" or "__Secure-better-auth.session_token"
    const sessionToken = request.cookies.get("better-auth.session_token") || request.cookies.get("__Secure-better-auth.session_token");

    if (!sessionToken && (request.nextUrl.pathname.startsWith('/admin') || request.nextUrl.pathname.startsWith('/account'))) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('callbackUrl', request.nextUrl.pathname);
        return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
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
  ]
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/account/:path*',
  ]
}
