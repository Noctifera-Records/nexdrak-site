import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// Configuración para rutas dinámicas
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
        // Verificar si hay una sesión y si es para recovery
        const { data: { session } } = await supabase.auth.getSession()
        console.log('Session after exchange:', { 
          hasSession: !!session, 
          type, 
          userEmail: session?.user?.email 
        })

        // Detectar si es un enlace de restablecimiento de contraseña
        const isPasswordReset = type === 'recovery' || 
                               next.includes('reset') || 
                               searchParams.get('redirect_to')?.includes('reset') ||
                               // Si hay sesión pero el usuario necesita cambiar contraseña
                               (session && session.user?.user_metadata?.password_reset)

        if (isPasswordReset) {
          console.log('Redirecting to reset password page')
          return NextResponse.redirect(`${origin}/auth/reset-password`)
        }

        // TEMPORAL: Si hay una sesión válida después del callback y no hay next específico,
        // probablemente es un enlace de recovery
        if (session && next === '/') {
          console.log('Session found with default redirect, assuming password reset')
          return NextResponse.redirect(`${origin}/auth/reset-password`)
        }
        
        // Para otros casos (confirmación de email, etc.), redirigir normalmente
        console.log('Redirecting to:', next)
        return NextResponse.redirect(`${origin}${next}`)
      } else {
        console.error('Error en auth callback:', error)
        return NextResponse.redirect(`${origin}/auth/auth-error?error=${encodeURIComponent(error.message)}`)
      }
    }

    // Si no hay código, redirigir a error
    return NextResponse.redirect(`${origin}/auth/auth-error?error=no_code`)
  } catch (error) {
    console.error('Error en auth callback:', error)
    return NextResponse.redirect(`${request.url.split('/auth/callback')[0]}/auth/auth-error?error=callback_error`)
  }
}
