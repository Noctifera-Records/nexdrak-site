import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  const response = NextResponse.next()

  // Only initialize Supabase for protected routes
  if (pathname.startsWith('/admin') || pathname.startsWith('/account')) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              request.cookies.set(name, value)
              response.cookies.set(name, value, options)
            })
          },
        },
      }
    )

    await supabase.auth.getUser()
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match only protected routes that require session refresh
     */
    '/admin/:path*',
    '/account/:path*',
  ]
}