import { createClient } from '@/lib/supabase/server'
import UsersTable from './users-table'

export const runtime = 'edge'

export default async function UsersPage() {
  const supabase = await createClient()
  
  // Obtener usuarios con sus perfiles
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

  // Obtener emails de auth.users
  const { data: authData } = await supabase.auth.admin.listUsers()
  const authUsers = authData?.users || []

  // Combinar datos de profiles con emails de auth
  const usersWithEmails = profiles?.map(profile => {
    const authUser = authUsers.find(au => au.id === profile.id)
    return {
      ...profile,
      email: authUser?.email || 'N/A',
      created_at: authUser?.created_at || null,
      email_confirmed_at: authUser?.email_confirmed_at || null
    }
  }) || []

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestión de Usuarios</h1>
        <div className="text-sm text-gray-400">
          Total: {usersWithEmails.length} usuarios
        </div>
      </div>
      
      <UsersTable users={usersWithEmails} />
    </div>
  )
}