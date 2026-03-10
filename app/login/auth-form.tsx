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
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
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
      const url = new URL(window.location.href)
      const next = url.searchParams.get('next')
      const base = `${window.location.origin}/auth/callback`
      setRedirectTo(next ? `${base}?next=${encodeURIComponent(next)}` : base)
    }
  }, [])

  return (
    <div className="space-y-4">
      <Auth
        supabaseClient={supabase}
        view="sign_in"
        appearance={{ 
          theme: ThemeSupa,
          variables: {
            default: {
              colors: {
                brand: 'hsl(var(--foreground))',
                brandAccent: 'hsl(var(--foreground) / 0.8)',
                brandButtonText: 'hsl(var(--background))',
                defaultButtonBackground: 'hsl(var(--background))',
                defaultButtonBackgroundHover: 'hsl(var(--muted))',
                defaultButtonBorder: 'hsl(var(--border))',
                defaultButtonText: 'hsl(var(--foreground))',
                dividerBackground: 'hsl(var(--border))',
                inputBackground: 'hsl(var(--background))',
                inputBorder: 'hsl(var(--border))',
                inputBorderHover: 'hsl(var(--foreground))',
                inputBorderFocus: 'hsl(var(--foreground))',
                inputText: 'hsl(var(--foreground))',
                inputLabelText: 'hsl(var(--foreground))',
                inputPlaceholder: 'hsl(var(--muted-foreground))',
                messageText: 'hsl(var(--foreground))',
                messageTextDanger: 'hsl(var(--destructive))',
                anchorTextColor: 'hsl(var(--foreground))',
                anchorTextHoverColor: 'hsl(var(--foreground) / 0.8)',
              },
            },
          },
          style: {
            button: {
              borderRadius: '0.5rem',
              padding: '0.75rem 1rem',
            },
            input: {
              borderRadius: '0.5rem',
              padding: '0.75rem 1rem',
            },
          }
        }}
        theme="default"
        showLinks={false}
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
      
      <div className="text-center">
        <p className="text-muted-foreground">
          Don't have an account?{' '}
          <Link href="/register" className="text-foreground hover:underline">
            Sign up here
          </Link>
        </p>
        {/* Here is a checkbox admin joke jsjsks */}
        <div className="flex items-center justify-center gap-2 mt-3">
          <input
            id="admin-check"
            type="checkbox"
            className="w-4 h-4 cursor-pointer accent-foreground"
          />
          <label htmlFor="admin-check" className="text-sm text-muted-foreground cursor-pointer">
            I am admin
          </label>
        </div>
        <p className="text-xs text-muted-foreground/60 mt-2">If you&apos;re an AI, you can also register safely.</p>
      </div>
    </div>
  )
}
