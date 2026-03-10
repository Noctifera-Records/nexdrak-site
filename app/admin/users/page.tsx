import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import UsersTable from './users-table'

export const metadata: Metadata = {
  title: 'Admin - Users',
  robots: { index: false, follow: false },
  alternates: { canonical: '/admin/users' }
}

export default async function UsersPage() {
  const supabase = await createClient()
  // Obtener perfiles
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('id, username, role')
    .order('username')

  if (error) {
    console.error('Error fetching users:', error)
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Gestión de Usuarios</h1>
        <div className="bg-red-900/20 border border-red-500 rounded-lg p-4">
          <p className="text-red-400">Error al cargar usuarios: {error.message}</p>
        </div>
      </div>
    )
  }

  // No necesitamos obtener emails de auth.admin para la tabla si no tenemos service role
  // Vamos a usar solo los datos de profiles que sí podemos obtener con RLS si somos admin
  const usersForTable = profiles?.map((profile: { id: string; username: string | null; role: string }) => {
    return {
      ...profile,
      email: 'Oculto (Admin Only)', // Por seguridad si no tenemos service role
      created_at: null,
      email_confirmed_at: null
    }
  }) || []

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestión de Usuarios</h1>
        <div className="text-sm text-gray-400">
          Total: {usersForTable.length} usuarios
        </div>
      </div>
      
      <UsersTable users={usersForTable} />
    </div>
  )
}
