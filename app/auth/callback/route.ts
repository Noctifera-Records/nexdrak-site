import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'


export async function GET(request: Request) {
  try {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    const type = searchParams.get('type')
    const next = searchParams.get('next') ?? '/'

    // Log para debugging
    console.log('Callback params:', { code: !!code, type, next })
    console.log('All search params:', Object.fromEntries(searchParams.entries()))

    if (code) {
      const supabase = await createClient()
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (!error) {
        const { data: { session } } = await supabase.auth.getSession()
        console.log('Session after exchange:', { 
          hasSession: !!session, 
          type, 
          userEmail: session?.user?.email 
        })

        const isPasswordReset = type === 'recovery' || 
                               next.includes('reset') || 
                               searchParams.get('redirect_to')?.includes('reset') ||
                               // Si hay sesión pero el usuario necesita cambiar contraseña
                               (session && session.user?.user_metadata?.password_reset)

        if (isPasswordReset) {
          console.log('Redirecting to reset password page')
          return NextResponse.redirect(`${origin}/auth/reset-password`)
        }

        if (session && next === '/') {
          console.log('Session found with default redirect, assuming password reset')
          return NextResponse.redirect(`${origin}/auth/reset-password`)
        }
        
        console.log('Redirecting to:', next)
        return NextResponse.redirect(`${origin}${next}`)
      } else {
        console.error('Error en auth callback:', error)
        return NextResponse.redirect(`${origin}/auth/auth-error?error=${encodeURIComponent(error.message)}`)
      }
    }

    return NextResponse.redirect(`${origin}/auth/auth-error?error=no_code`)
  } catch (error) {
    console.error('Error en auth callback:', error)
    return NextResponse.redirect(`${request.url.split('/auth/callback')[0]}/auth/auth-error?error=callback_error`)
  }
}
