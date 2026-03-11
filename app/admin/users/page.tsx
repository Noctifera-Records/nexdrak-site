import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import UsersTable from './users-table'
import { getUsers } from './actions'

export const metadata: Metadata = {
  title: 'Admin - Users',
  robots: { index: false, follow: false },
  alternates: { canonical: '/admin/users' }
}

export default async function UsersPage() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session || session.user.role !== "admin") {
    redirect('/login');
  }

  const users = await getUsers();

  // Serialize dates for client component
  const formattedUsers = users.map((u: any) => ({
    ...u,
    created_at: u.created_at ? new Date(u.created_at).toISOString() : null,
    email_confirmed_at: u.email_confirmed_at ? 'true' : null // Simplified boolean check
  }));

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestión de Usuarios</h1>
        <div className="text-sm text-gray-400">
          Total: {formattedUsers.length} usuarios
        </div>
      </div>
      
      <UsersTable users={formattedUsers} />
    </div>
  )
}
