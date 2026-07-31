import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  try {
    // Guard: redirects URLs that leak internal error messages to the home page.
    // e.g. /You%20must%20sign%20in%20to%20access%20downloads -> decoded path contains spaces
    const pathname = request.nextUrl.pathname;
    if (/[\s\u0000-\u001F]/.test(pathname)) {
      return NextResponse.redirect(new URL('/', request.url), 308);
    }

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
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|site.webmanifest|apple-touch-icon|android-chrome|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico|woff2?|txt)$).*)',
  ],
}
