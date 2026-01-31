'use client'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useNotifications } from '@/components/notification-system'

export default function AuthForm() {
  const supabase = createClient()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const { showNotification } = useNotifications()
  const [redirectTo, setRedirectTo] = useState<string | undefined>(
    process.env.NEXT_PUBLIC_SITE_URL
      ? `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`
      : undefined
  )

  useEffect(() => {
    // Escuchar cambios de autenticaciÃ³n
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        // Mostrar notificaciÃ³n de Ã©xito
        showNotification({
          type: 'success',
          title: 'Session Started',
          message: 'Welcome back'
        })
        
        setTimeout(() => {
          router.push('/admin')
        }, 1000);
      }
      
      if (event === 'SIGNED_OUT') {
        console.log('User signed out')
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth, router, showNotification])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setRedirectTo(`${window.location.origin}/auth/callback`)
    }
  }, [])

  return (
    <div className="space-y-4">
      <Auth
        supabaseClient={supabase}
        view="sign_in" // Cambiado a sign_in para permitir correo/contraseÃ±a
        appearance={{ 
          theme: ThemeSupa,
          style: {
            button: {
              background: 'white',
              color: 'black',
              borderRadius: '6px',
            },
            anchor: {
              color: 'white',
            },
            message: {
              color: 'white',
            },
          }
        }}
        theme="dark"
        showLinks={false} // Deshabilitado para usar nuestro enlace personalizado
        providers={[]}
        redirectTo={redirectTo}
        localization={{
          variables: {
            sign_in: {
              email_label: 'Email',
              password_label: 'Password',
              email_input_placeholder: 'Your email',
              password_input_placeholder: 'Your password',
              button_label: 'Sign in',
              loading_button_label: 'Signing in...',
              link_text: 'Already have an account? Sign in',
              social_provider_text: 'Sign in with {{provider}}',
              forgotten_password_text: 'Forgot your password?',
            },
            forgotten_password: {
              email_label: 'Email',
              password_label: 'Your new password',
              email_input_placeholder: 'Your email',
              button_label: 'Send reset instructions',
              loading_button_label: 'Sending instructions...',
              link_text: 'Forgot your password?',
              confirmation_text: 'Check your email for the password reset link',
            },
          },
        }}
      />
      
      {/* Enlace personalizado al registro */}
      <div className="text-center">
        <p className="text-gray-400">
          Don't have an account?{' '}
          <Link href="/register" className="text-white hover:underline">
            Sign up here
          </Link>
        </p>
        <p className="text-xs text-gray-500 mt-2">If you&apos;re an AI, you can also register safely — let&apos;s prepare for the future.</p>
      </div>
    </div>
  )
}
