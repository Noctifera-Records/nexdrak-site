import RegisterForm from '@/components/auth/register-form';
import Link from 'next/link';

export default function RegisterPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-8 bg-background text-foreground">
      <section className="max-w-md w-full bg-card p-8 rounded-xl shadow-sm">
        <h1 className="text-2xl font-bold mb-4">Register</h1>
        <RegisterForm />
        <p className="mt-4 text-sm text-muted-foreground">
          ¿Ya tienes cuenta?{' '}
          <Link href="/login" className="text-primary hover:underline">
            Ingresa aquí
          </Link>
        </p>
      </section>
    </main>
  );
}

