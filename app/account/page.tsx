import AccountForm from './account-form'

export default function AccountPage() {
  return (
    <div className="min-h-screen bg-black px-4 py-24">
      <div className="max-w-2xl mx-auto">
        <div className="bg-gray-800 rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white">My Account</h1>
            <p className="text-gray-400 mt-2">Manage your personal information</p>
          </div>
          <AccountForm />
        </div>
      </div>
    </div>
  )
}