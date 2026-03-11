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
import { useRouter } from 'next/navigation'
import { updateUserProfile, deleteUser } from './actions'
import { toast } from 'sonner'

interface UserData {
  id: string
  email: string
  username: string | null
  role: string
  created_at: string | null
  email_confirmed_at: string | null
}

interface UsersTableProps {
  users: UserData[]
}

export default function UsersTable({ users: initialUsers }: UsersTableProps) {
  const [users, setUsers] = useState(initialUsers)
  const [searchTerm, setSearchTerm] = useState('')
  const [editingUser, setEditingUser] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  
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
      const result = await updateUserProfile(userId, updates)
      
      if (result.error) {
        throw new Error(result.error)
      }

      // Actualizar estado local
      setUsers(users.map(user => 
        user.id === userId ? { ...user, ...updates } : user
      ))
      
      toast.success('Usuario actualizado')
      setEditingUser(null)
      router.refresh()
    } catch (error: any) {
      console.error('Error updating user:', error)
      toast.error(`Error al actualizar usuario: ${error.message || 'Error desconocido'}`)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    setLoading(true)
    try {
      const result = await deleteUser(userId)
      
      if (result.error) {
        throw new Error(result.error)
      }

      // Actualizar estado local
      setUsers(users.filter(user => user.id !== userId))
      setDeleteConfirm(null)
      toast.success('Usuario eliminado')
      router.refresh()
    } catch (error: any) {
      console.error('Error deleting user:', error)
      toast.error(`Error al eliminar usuario: ${error.message}`)
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
        return <Shield className="h-4 w-4 text-destructive" />
      case 'user':
        return <User className="h-4 w-4 text-primary" />
      default:
        return <User className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getRoleBadge = (role: string) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium"
    switch (role) {
      case 'admin':
        return `${baseClasses} bg-destructive/10 text-destructive border border-destructive/20`
      case 'user':
        return `${baseClasses} bg-primary/10 text-primary border border-primary/20`
      default:
        return `${baseClasses} bg-muted text-muted-foreground border border-border`
    }
  }

  return (
    <div className="space-y-6">
      {/* Barra de búsqueda */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por email, username o rol..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="text-sm text-muted-foreground">
          {filteredUsers.length} de {users.length} usuarios
        </div>
      </div>

      {/* Tabla de usuarios */}
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Usuario
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Rol
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Registro
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-muted/50">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="bg-muted rounded-full p-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-foreground">
                          {user.username || 'Sin username'}
                        </div>
                        <div className="text-sm text-muted-foreground flex items-center">
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
                          <UserCheck className="h-4 w-4 text-green-500" />
                          <span className="text-sm text-green-500">Verificado</span>
                        </>
                      ) : (
                        <>
                          <UserX className="h-4 w-4 text-yellow-500" />
                          <span className="text-sm text-yellow-500">Pendiente</span>
                        </>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-1 text-sm text-muted-foreground">
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
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Editar Usuario</DialogTitle>
                            <DialogDescription>
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
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Eliminar Usuario</DialogTitle>
                            <DialogDescription>
                              ¿Estás seguro de que quieres eliminar a {user.username || user.email}?
                              Esta acción no se puede deshacer.
                            </DialogDescription>
                          </DialogHeader>
                          <DialogFooter>
                            <Button
                              variant="outline"
                              onClick={() => setDeleteConfirm(null)}
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
            <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
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
  user: UserData
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
        <Label htmlFor="username">
          Nombre de Usuario
        </Label>
        <Input
          id="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Ingresa el username"
        />
      </div>

      <div>
        <Label htmlFor="role">
          Rol
        </Label>
        <Select value={role} onValueChange={setRole}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="user">Usuario</SelectItem>
            <SelectItem value="admin">Administrador</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DialogFooter>
        <Button
          type="submit"
          disabled={loading}
        >
          {loading ? 'Guardando...' : 'Guardar Cambios'}
        </Button>
      </DialogFooter>
    </form>
  )
}
