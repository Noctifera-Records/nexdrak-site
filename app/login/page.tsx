import LoginForm from '@/components/auth/login-form';
import Link from 'next/link';

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-8 bg-background text-foreground">
      <section className="max-w-md w-full bg-card p-8 rounded-xl shadow-sm">
        <h1 className="text-2xl font-bold mb-4">Login</h1>
        <LoginForm />
        <p className="mt-4 text-sm text-muted-foreground">
          ¿No tienes cuenta?{' '}
          <Link href="/register" className="text-primary hover:underline">
            Regístrate aquí
          </Link>
        </p>
      </section>
    </main>
  );
}

