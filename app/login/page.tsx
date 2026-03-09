import AuthForm from './auth-form'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md p-8 space-y-8 bg-gray-800/80 backdrop-blur-md rounded-lg shadow-lg border border-white/10">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white">Login</h1>
        </div>
        <AuthForm />
      </div>
    </div>
  )
}
