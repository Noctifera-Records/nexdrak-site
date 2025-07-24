"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Edit, 
  Trash2, 
  Search, 
  UserCheck, 
  UserX, 
  Mail,
  Calendar,
  Shield,
  User
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface User {
  id: string
  email: string
  username: string | null
  role: string
  created_at: string | null
  email_confirmed_at: string | null
}

interface UsersTableProps {
  users: User[]
}

export default function UsersTable({ users: initialUsers }: UsersTableProps) {
  const [users, setUsers] = useState(initialUsers)
  const [searchTerm, setSearchTerm] = useState('')
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  
  const supabase = createClient()
  const router = useRouter()

  // Filtrar usuarios por término de búsqueda
  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleUpdateUser = async (userId: string, updates: { username?: string, role?: string }) => {
    setLoading(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)

      if (error) throw error

      // Actualizar estado local
      setUsers(users.map(user => 
        user.id === userId ? { ...user, ...updates } : user
      ))
      
      setEditingUser(null)
      router.refresh()
    } catch (error) {
      console.error('Error updating user:', error)
      alert('Error al actualizar usuario')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    setLoading(true)
    try {
      // Primero eliminar el perfil
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId)

      if (profileError) throw profileError

      // Luego eliminar el usuario de auth (requiere permisos de admin)
      const { error: authError } = await supabase.auth.admin.deleteUser(userId)
      
      if (authError) {
        console.warn('Could not delete auth user:', authError)
        // Continuar aunque no se pueda eliminar de auth
      }

      // Actualizar estado local
      setUsers(users.filter(user => user.id !== userId))
      setDeleteConfirm(null)
      router.refresh()
    } catch (error) {
      console.error('Error deleting user:', error)
      alert('Error al eliminar usuario')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Shield className="h-4 w-4 text-red-400" />
      case 'user':
        return <User className="h-4 w-4 text-blue-400" />
      default:
        return <User className="h-4 w-4 text-gray-400" />
    }
  }

  const getRoleBadge = (role: string) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium"
    switch (role) {
      case 'admin':
        return `${baseClasses} bg-red-900/30 text-red-300 border border-red-500/30`
      case 'user':
        return `${baseClasses} bg-blue-900/30 text-blue-300 border border-blue-500/30`
      default:
        return `${baseClasses} bg-gray-900/30 text-gray-300 border border-gray-500/30`
    }
  }

  return (
    <div className="space-y-6">
      {/* Barra de búsqueda */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar por email, username o rol..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-gray-900 border-gray-700 text-white"
          />
        </div>
        <div className="text-sm text-gray-400">
          {filteredUsers.length} de {users.length} usuarios
        </div>
      </div>

      {/* Tabla de usuarios */}
      <div className="bg-gray-900 rounded-lg border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-800 border-b border-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Usuario
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Rol
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Registro
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-800/50">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="bg-gray-700 rounded-full p-2">
                        <User className="h-4 w-4 text-gray-300" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-white">
                          {user.username || 'Sin username'}
                        </div>
                        <div className="text-sm text-gray-400 flex items-center">
                          <Mail className="h-3 w-3 mr-1" />
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      {getRoleIcon(user.role)}
                      <span className={getRoleBadge(user.role)}>
                        {user.role.toUpperCase()}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      {user.email_confirmed_at ? (
                        <>
                          <UserCheck className="h-4 w-4 text-green-400" />
                          <span className="text-sm text-green-400">Verificado</span>
                        </>
                      ) : (
                        <>
                          <UserX className="h-4 w-4 text-yellow-400" />
                          <span className="text-sm text-yellow-400">Pendiente</span>
                        </>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-1 text-sm text-gray-400">
                      <Calendar className="h-3 w-3" />
                      <span>{formatDate(user.created_at)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      {/* Botón Editar */}
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingUser(user)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-gray-900 border-gray-700">
                          <DialogHeader>
                            <DialogTitle className="text-white">Editar Usuario</DialogTitle>
                            <DialogDescription className="text-gray-400">
                              Modifica la información del usuario
                            </DialogDescription>
                          </DialogHeader>
                          {editingUser && (
                            <EditUserForm
                              user={editingUser}
                              onSave={handleUpdateUser}
                              loading={loading}
                            />
                          )}
                        </DialogContent>
                      </Dialog>

                      {/* Botón Eliminar */}
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-gray-900 border-gray-700">
                          <DialogHeader>
                            <DialogTitle className="text-white">Eliminar Usuario</DialogTitle>
                            <DialogDescription className="text-gray-400">
                              ¿Estás seguro de que quieres eliminar a {user.username || user.email}?
                              Esta acción no se puede deshacer.
                            </DialogDescription>
                          </DialogHeader>
                          <DialogFooter>
                            <Button
                              variant="outline"
                              onClick={() => setDeleteConfirm(null)}
                              className="border-gray-600 text-gray-300"
                            >
                              Cancelar
                            </Button>
                            <Button
                              variant="destructive"
                              onClick={() => handleDeleteUser(user.id)}
                              disabled={loading}
                            >
                              {loading ? 'Eliminando...' : 'Eliminar'}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <User className="h-12 w-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">
              {searchTerm ? 'No se encontraron usuarios' : 'No hay usuarios registrados'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

function EditUserForm({ 
  user, 
  onSave, 
  loading 
}: { 
  user: User
  onSave: (userId: string, updates: { username?: string, role?: string }) => void
  loading: boolean 
}) {
  const [username, setUsername] = useState(user.username || '')
  const [role, setRole] = useState(user.role)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(user.id, { username, role })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="username" className="text-white">
          Nombre de Usuario
        </Label>
        <Input
          id="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="bg-gray-800 border-gray-600 text-white"
          placeholder="Ingresa el username"
        />
      </div>

      <div>
        <Label htmlFor="role" className="text-white">
          Rol
        </Label>
        <Select value={role} onValueChange={setRole}>
          <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 border-gray-600">
            <SelectItem value="user">Usuario</SelectItem>
            <SelectItem value="admin">Administrador</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DialogFooter>
        <Button
          type="submit"
          disabled={loading}
          className="bg-white text-black hover:bg-gray-200"
        >
          {loading ? 'Guardando...' : 'Guardar Cambios'}
        </Button>
      </DialogFooter>
    </form>
  )
}