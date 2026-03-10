import RegisterForm from './register-form'

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background transition-colors duration-300">
      <div className="w-full max-w-md p-8 space-y-8 bg-card/80 dark:bg-gray-800/80 backdrop-blur-md rounded-lg shadow-lg border border-border dark:border-white/10">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground dark:text-white">Create Account</h1>
          <p className="text-muted-foreground mt-2">Sign up to access exclusive content</p>
        </div>
        <RegisterForm />
      </div>
    </div>
  )
}