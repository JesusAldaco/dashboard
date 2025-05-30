'use client'

import React, { useState } from "react"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { SignInButton, SignOutButton, useUser } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"

interface Usuario {
  _id: string
  clerkId: string
  nombre: string
  email: string
  estado: 'activo' | 'bloqueado'
  fechaCreacion: number
  role: string
}

export default function UsuariosPage(){
  const { user, isSignedIn } = useUser()

  // State for Create User for
  const [newUserName, setNewUserName] = useState('')
  const [newUserEmail, setNewUserEmail] = useState('')
  const [newUserPassword, setNewUserPassword] = useState('')
  const [newUserRole, setNewUserRole] = useState('user')
  const [isCreatingUser, setIsCreatingUser] = useState(false)

  // State for filtering and search
  const [filterEstado, setFilterEstado] = useState<'activo' | 'bloqueado' | undefined>(undefined)
  const [searchQuery, setSearchQuery] = useState('')

  // State for Edit User Dialog
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<Usuario | null>(null)
  const [editedName, setEditedName] = useState('')
  const [editedEmail, setEditedEmail] = useState('')
  const [editedRole, setEditedRole] = useState('') // Estado para editar rol
  const [editedEstado, setEditedEstado] = useState<'activo' | 'bloqueado'>('activo')
  const [editError, setEditError] = useState<string | null>(null)
  const [isSevingUser, setIsSeavingUser] = useState(false)
  /* 
  Convex hook for reading user
  Asegurarse de que api.usuarios.getUsuarios ahora apunte a api.funcitons.user.getUsuarios */
  const usuarios = useQuery(api.functions.user.getAllUsers, { estado: filterEstado, busqueda: searchQuery })

  const handleCreateUser = async ( e: React.FormEvent ) => {
    e.preventDefault()
    setIsCreatingUser(true)

    if (newUserPassword.length < 8) {
      toast.error("La contraseña debe tener al menos 8 caracteres")
      setIsCreatingUser(false)
      return
    }

    try{
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          nombre: newUserName,
          email: newUserEmail,
          role: newUserRole,
          password: newUserPassword
        })
      })
      
      const result = await response.json()

      if (!response.ok){
        throw new Error(result.error || 'Error desconocido al crear usuario.')
      }

      toast.success(result.message || 'Usuario creado y credenciales enviadas por correo.')

      setNewUserName('')
      setNewUserEmail('')
      setNewUserPassword('')
      setNewUserRole('user')

    } catch (err: unknown) {
      console.error('Error en handleCreateUser (frontend): ', err);
      // Verificar si error es una instancia de Error o si tiene una propiedad 'message'
      if ( err instanceof Error ) {
        toast.error(err.message)
      } else if (typeof err === "object" && err !== null && 'message' in err && typeof (err as { message: unknown }).message === 'string') {
        toast.error((err as { message: string }).message)
      } else {
        toast.error('Error al crear usuario')
      }
    } finally {
      setIsCreatingUser(false)
    }
  }

  const handleEditUserClerk = (user: Usuario) => {
    setEditingUser(user)
    setEditedName(user.nombre)
    setEditedEmail(user.email)
    setEditedRole(user.role) // Cargar el rol actual
    setEditedEstado(user.estado) // Cargar el estado actual
    setEditError(null)
    setIsEditDialogOpen(true)
  }

  const handleSaveEditUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if(!editingUser) return

    setEditError(null)
    setIsSeavingUser(true)

    try{
      const updates: {
        nombre?: string,
        email?: string,
        role?: string,
        estado?: 'activo' | 'bloqueado'
      } = {}

      if (editedName !== editingUser.nombre) updates.nombre = editedName
      if (editedEmail !== editingUser.email) updates.email = editedEmail
      if (editedRole !== editingUser.role) updates.role = editedRole
      if (editedEstado !== editingUser.estado) updates.estado = editedEstado

      if (Object.keys(updates).length === 0){
        toast.info('No hay cambios para guardar')
        setIsEditDialogOpen(false)
        setEditingUser(null)
        return
      }

      const response = await fetch('/api/users', {
        method: 'PATCH',
        headers:{
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: editingUser._id,
          clerkId: editingUser.clerkId,
          ...updates
        })
      })

      const result = await response.json()

      if (!response.ok){
        throw new Error(result.error || 'Error desconocido al editar el usuario')
      }

      toast.success(result.message || 'Usuario editado exitosamente')

      setIsEditDialogOpen(false)
      setEditingUser(null)

    } catch (err: unknown) {
      console.error('Error capturado en handleSaveEditUser (frontend): ',err)
      if (err instanceof Error){
        setEditError(err.message)
        toast.error(err.message)
      } else if (typeof err === 'object' && err !== null && 'message' in err && typeof (err as {message: unknown}).message === 'string') {
        setEditError((err as { message: string }).message)
        toast.error((err as { message: string }).message)
      } else {
        setEditError('Error al editar usuario')
        toast.error('Error al editar usuario')
      }
    } finally {
      setIsSeavingUser(false)
    }
  }

  const handleBlockUnblock = async (userToUpdate: Usuario) => {
    const accion = userToUpdate.estado === 'activo' ? 'bloquear' : 'desbloquear'
    const nuevoEstado = userToUpdate.estado === 'activo' ? 'bloqueado' : 'activo'

    if (confirm(`¿Estas seguro de que quieres ${accion} a este usuario (${userToUpdate.nombre})?`)) {
      try {
        const response = await fetch('/api/users', {
          method: 'PATCH',
          headers:{
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            id: userToUpdate._id,
            clerkId: userToUpdate.clerkId,
            estado: nuevoEstado
          })
        })

        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.error || `Error desconocido al ${accion} usuario.`)
        }

        toast.success(result.message || `Usuario ${nuevoEstado} exsitodamente.`)
      } catch (err: unknown) {
        console.error(`Error en handleBlockUnblock (frontend)`,err)
        if (err instanceof Error) {
          toast.error(err.message)
        } else if (typeof err === 'object' && err !== null && 'message' in err && typeof (err as { message: unknown }).message === 'string'){
          toast.error((err as {message: string}).message)
        } else {
          toast.error(`Error al ${accion} usuario.`)
        }
      }
    }
  }

  const handleDeleteUser = async (userToDelete: Usuario) => {
    if (confirm(`¿Esta seguro de que quiere eliminar este usuario (${userToDelete.nombre})? Esta acción es irreversible y lo eliminara de Clerk y Convex`)){
      try {
        const response = await fetch('/api/users', {
          method: 'DELETE',
          headers:{
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            clerkId: userToDelete.clerkId,
            convexUserId: userToDelete._id
          })
        })

        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.error || `Error desconocido al eliminar usuario.`)
        }

        toast.success(result.message || `Usuario eliminado exsitodamente.`)       
      } catch (err: unknown){
        console.error(`Error en handleDeleteUser (frontend)`,err)
        if (err instanceof Error) {
          toast.error(err.message)
        } else if (typeof err === 'object' && err !== null && 'message' in err && typeof (err as { message: unknown }).message === 'string'){
          toast.error((err as {message: string}).message)
        } else {
          toast.error(`Error al eliminar usuario.`)
        }
      }
    }
  }

  if(!isSignedIn || !user){
    return(
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h2 className="text-xl font-semibold mb-4">Por favor, inicia seción para acceder al panel de administración de usuarios.</h2>
        <SignInButton mode="modal"/>
      </div>
    )
  }
  /*
  Opcional: Restringir accedo basado en rol de Clerk
  Si usas un rol en publicMetadata de Clerk, deberías obtenrlo así:
  */
  /*const userRole = user.publicMetadata?.role as string | undefined
  if (!userRole || userRole !== undefined){
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h2 className="text-xl font-semibold mb-4">Acceso denegado. No tienes los permisos necesarios.</h2>
        <SignInButton mode="modal"/>
      </div>
    )
  }*/
  // O bien, si el rol está en tu tabla Convex, puedes verificar `usuarios[0].rol` si eres el admin (y cargar el admin user).
  // La mejor forma es verificar el rol de Clerk directamente para la autorización de la página.

  return(
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gestión de usuarios</h1>
        <SignOutButton/>
      </div>
      <hr className="my-6"/>
      {/* Crear neva sección de usuario */}
      <Card>
        <CardHeader>
          <CardTitle>Crear un nuevo usuario</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateUser} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Input
              type="text"
              placeholder="Nombre"
              value={newUserName}
              onChange={(e) => setNewUserName(e.target.value)}
              required
            />
            <Input
              type="email"
              placeholder="Correo"
              value={newUserEmail}
              onChange={(e) => setNewUserEmail(e.target.value)}
              required
            />
            <Input
              type="password"
              placeholder="Contraseña Inicial"
              value={newUserPassword}
              onChange={(e) => setNewUserPassword(e.target.value)}
              required
            />
            <Select
              value={newUserRole}
              onValueChange={(value) => setNewUserRole(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder='Seleccionar Rol'/>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">Usuario</SelectItem>
                <SelectItem value="admin">Adminstrador</SelectItem>
                <SelectItem value="maestro">Maestro</SelectItem>
                <SelectItem value="estudiante">Estudiante</SelectItem>
              </SelectContent>
            </Select>
            <Button type="submit" className="col-span-full md:col-span-1" disabled={isCreatingUser}>
              {isCreatingUser ? 'Creando...' : 'Crear usuario'}
            </Button>
          </form>
        </CardContent>
      </Card>
      <hr className="my-6"/>
      {/* User List Section */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de usuarios</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex items-center gap-2">
              <Label htmlFor="filterEstado">Filtrar por Estado</Label>
              <Select
                value={filterEstado || 'all'}
                onValueChange={(value: 'activo' | 'bloqueado' | 'all') => setFilterEstado(value === 'all' ? undefined : value)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder='Todos'/>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="activo">Activo</SelectItem>
                  <SelectItem value="bloqueado">Bloqueado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2 flex-grow">
              <Label htmlFor="searchQuery">Buscar:</Label>
              <Input
                id="searchQuery"
                type="text"
                placeholder="Nombre o correo..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-grow"
              />
            </div>
          </div>
          {usuarios === undefined ? (
            <p>Cargando usuarios...</p>
          ) : usuarios.length === 0 ? (
            <p>No hay usuarios registrados.</p>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Correo</TableHead>
                    <TableHead>Rol</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Fecha de creación</TableHead>
                    <TableHead  className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usuarios.map((usuario) => (
                    <TableRow key={usuario._id}>
                      <TableCell>{usuario.nombre}</TableCell>
                      <TableCell>{usuario.email}</TableCell>
                      <TableCell>{usuario.role}</TableCell>
                      <TableCell>{usuario.estado}</TableCell>
                      <TableCell>{new Date(usuario.fechaCreacion).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right flex space-x-2 justify-end">
                        <Button variant='outline' size='sm' onClick={() => handleEditUserClerk(usuario)}>Editar</Button>
                        <Button
                          variant={usuario.estado === 'activo' ? 'destructive' : 'secondary'}
                          size='sm'
                          onClick={() => handleBlockUnblock(usuario)}
                        >
                          {usuario.estado === 'activo' ? 'bloquear' : 'desbloquear'}
                        </Button>
                        <Button variant='destructive' size='sm' onClick={() => handleDeleteUser(usuario)}>Eliminar</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      {/* Edit User Dialog */}
      { editingUser && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Editar usuario</DialogTitle>
              <DialogDescription>
                Realizar cambio en el perfil del usuario. Haz clic en guardar cuando termines.
              </DialogDescription>
            </DialogHeader>
            {editError && <p className="text-red-500 text-sm mt-2 mb-4">{editError}</p>}
            <form onSubmit={handleSaveEditUser} className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">Nombre</Label>
                <Input
                  id="name"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">Correo</Label>
                <Input
                  id="email"
                  value={editedEmail}
                  onChange={(e) => setEditedEmail(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="role" className="text-right">Rol</Label>
                <Select
                  value={editedRole}
                  onValueChange={setEditedRole}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Seleccionar rol"/>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">Usuario</SelectItem>
                    <SelectItem value="admin">Administrador</SelectItem>
                    <SelectItem value="maestro">Maestro</SelectItem>
                    <SelectItem value="estudiante">Estudiente</SelectItem>
                    {/* Asegurerce de que estos roles coincidan con los que se usa */}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="estado" className="text-right">Estado</Label>
                <Select
                  value={editedEstado}
                  onValueChange={(value: 'activo' | 'bloqueado' ) => setEditedEstado(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Seleccionar estado'/>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="activo">Activo</SelectItem>
                    <SelectItem value="bloqueado">Bloqueado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={isSevingUser}>
                  {isSevingUser ? 'Guardando...' : 'Guardar cambios'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      ) }
    </div>
  )
}