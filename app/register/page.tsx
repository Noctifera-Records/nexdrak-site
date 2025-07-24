import RegisterForm from './register-form'

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4">
      <div className="w-full max-w-md p-8 space-y-8 bg-gray-800 rounded-lg shadow-lg">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white">Create Account</h1>
          <p className="text-gray-400 mt-2">Sign up to access exclusive content</p>
        </div>
        <RegisterForm />
      </div>
    </div>
  )
}