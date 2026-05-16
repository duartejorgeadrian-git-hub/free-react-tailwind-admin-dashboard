import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Users, 
  Search,
  Shield,
  Edit,
  Trash2,
  UserPlus,
  Loader2
} from 'lucide-react';
import { useAuth, type AppRole } from '@/hooks/useAuth';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { apiService } from '@/services/apiService';

interface UserWithRole {
  id: string;
  username: string;
  nombre: string;
  apellido: string;
  isActive: boolean;
  role: AppRole | null;
  email: string | null;
  dni?: string;
  telefono?: string;
}

const roleLabels: Record<string, string> = {
  operador: 'Operador',
  supervisor: 'Supervisor',
  auditor: 'Auditor',
  director: 'Director',
  admin_municipal: 'Admin Municipal',
  superadmin: 'Super Administrador',
  soporte: 'Soporte Técnico',
};

const roleDescriptions: Record<string, string> = {
  operador: 'Visualiza alertas y perfiles de ciudadanos',
  supervisor: 'Gestiona alertas, operadores y puede ver auditoría',
  auditor: 'Acceso de solo lectura con exportación de expedientes',
  director: 'Gestión completa del centro de monitoreo',
  admin_municipal: 'Administración total del municipio',
  superadmin: 'Control total del sistema y todos los tenants',
  soporte: 'Acceso de soporte técnico al sistema',
};

// Se usa apiService para evitar problemas de IP mal formada
export function UserManagement() {
  const { hasAnyRole, user: currentUser, refreshProfile } = useAuth();
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  // Estado para Diálogo de Edición
  const [editingUser, setEditingUser] = useState<UserWithRole | null>(null);
  const [editFormData, setEditFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    role: 'operador' as AppRole
  });

  // Estado para Diálogo de Creación
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    nombre: '',
    apellido: '',
    dni: '',
    email: '',
    telefono: '',
    role: 'operador' as AppRole
  });

  const isSuperadmin = hasAnyRole(['superadmin', 'admin_municipal']);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await apiService.getUsers();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Usamos currentUser?.id para la auditoría en el backend
      const rawUrl = import.meta.env.VITE_API_URL || '';
      const API_URL = (rawUrl.split(' ')[0] || `http://${window.location.hostname}:3001`).trim();

      const response = await fetch(`${API_URL}/api/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUser?.id || ''
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Error al crear usuario');

      toast.success('Usuario creado correctamente');
      setIsCreateDialogOpen(false);
      setFormData({
        username: '', password: '', nombre: '', apellido: '',
        dni: '', email: '', telefono: '', role: 'operador'
      });
      fetchUsers();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;

    try {
      const res = await apiService.updateUser(editingUser.id, editFormData, currentUser?.id || '');

      if (!res.success) throw new Error(res.error || 'Error al actualizar usuario');

      toast.success(`Usuario actualizado correctamente`);

      // Si el usuario editado es el mismo que está logueado, actualizamos su sesión local
      if (editingUser.id === currentUser?.id) {
        await refreshProfile();
        // Forzamos una recarga de la página para que el Header lea el localStorage actualizado
        window.location.reload();
      }

      setEditingUser(null);
      fetchUsers();
    } catch (error: any) {
      console.error('Error updating user:', error);
      toast.error(error.message);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('¿Está seguro de que desea eliminar este usuario? Esta acción no se puede deshacer.')) {
      return;
    }

    const res = await apiService.deleteUser(userId, currentUser?.id || '');
    if (res.success) {
      toast.success('Usuario eliminado correctamente');
      fetchUsers();
    } else {
      toast.error(res.error || 'Error al eliminar usuario');
    }
  };

  const filteredUsers = users.filter(user => {
    const searchLower = searchQuery.toLowerCase();
    const username = user.username || '';
    const nombre = user.nombre || '';
    const apellido = user.apellido || '';

    const matchesSearch = searchQuery === '' ||
      username.toLowerCase().includes(searchLower) ||
      nombre.toLowerCase().includes(searchLower) ||
      apellido.toLowerCase().includes(searchLower);
    
    const matchesRole = roleFilter === 'all' || 
      (roleFilter === 'none' && !user.role) ||
      user.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  const availableRoles: AppRole[] = hasAnyRole(['superadmin'])
    ? ['operador', 'supervisor', 'auditor', 'director', 'admin_municipal', 'superadmin', 'soporte']
    : ['operador', 'supervisor', 'auditor'];

  const getInitials = (nombre?: string, apellido?: string) => {
    const n = nombre?.[0] || '';
    const a = apellido?.[0] || '';
    return (n + a).toUpperCase() || '?';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Gestión de Usuarios
              </CardTitle>
              <CardDescription>
                Administre usuarios y asigne roles del sistema
              </CardDescription>
            </div>
            {isSuperadmin && (
              <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2">
                <UserPlus className="h-4 w-4" />
                Nuevo Usuario
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre o email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrar por rol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los roles</SelectItem>
                <SelectItem value="none">Sin rol asignado</SelectItem>
                {Object.entries(roleLabels).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                  <Skeleton className="h-8 w-24" />
                </div>
              ))}
            </div>
          ) : (
            <ScrollArea className="h-[500px]">
              <div className="space-y-2">
                {filteredUsers.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    No se encontraron usuarios
                  </div>
                ) : (
                  filteredUsers.map((user) => (
                    <div 
                      key={user.id}
                      className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/30 transition-colors"
                    >
                      <Avatar>
                        <AvatarFallback>
                          {getInitials(user.nombre, user.apellido)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium truncate">
                            {user.nombre} {user.apellido}
                          </p>
                          {!user.isActive && user.isActive !== undefined && (
                            <Badge variant="outline" className="text-muted-foreground">
                              Inactivo
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          @{user.username} {user.email && `| ${user.email}`}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        {user.role ? (
                          <Badge variant="secondary" className="flex items-center gap-1">
                            <Shield className="h-3 w-3" />
                            {roleLabels[user.role]}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-muted-foreground">
                            Sin rol
                          </Badge>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingUser(user);
                            setEditFormData({
                              nombre: user.nombre || '',
                              apellido: user.apellido || '',
                              email: user.email || '',
                              role: user.role || 'operador'
                            });
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        {user.id !== currentUser?.id && user.role !== 'superadmin' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => handleDeleteUser(user.id)}
                            title="Eliminar usuario"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* DIALOGO: EDITAR USUARIO */}
      <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Usuario</DialogTitle>
            <DialogDescription>
              Modifique los datos del perfil y el rol asignado.
            </DialogDescription>
          </DialogHeader>
          {editingUser && (
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-nombre">Nombre</Label>
                  <Input
                    id="edit-nombre"
                    value={editFormData.nombre}
                    onChange={(e) => setEditFormData({...editFormData, nombre: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-apellido">Apellido</Label>
                  <Input
                    id="edit-apellido"
                    value={editFormData.apellido}
                    onChange={(e) => setEditFormData({...editFormData, apellido: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-email">Correo Electrónico</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editFormData.email}
                  onChange={(e) => setEditFormData({...editFormData, email: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label>Rol del Sistema</Label>
                <Select
                  value={editFormData.role}
                  onValueChange={(v) => setEditFormData({...editFormData, role: v as AppRole})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {availableRoles.map((role) => (
                      <SelectItem key={role} value={role}>
                        {roleLabels[role]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {roleDescriptions[editFormData.role]}
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingUser(null)}>
              Cancelar
            </Button>
            <Button onClick={handleUpdateUser}>
              Guardar Cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DIALOGO: CREAR USUARIO */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Crear Nuevo Usuario</DialogTitle>
            <DialogDescription>
              Complete los datos para dar de alta un nuevo miembro del equipo.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateUser} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre</Label>
                <Input
                  id="nombre"
                  value={formData.nombre}
                  onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="apellido">Apellido</Label>
                <Input
                  id="apellido"
                  value={formData.apellido}
                  onChange={(e) => setFormData({...formData, apellido: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dni">DNI</Label>
                <Input
                  id="dni"
                  value={formData.dni}
                  onChange={(e) => setFormData({...formData, dni: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="username">Nombre de Usuario (Login)</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña Provisional</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  required
                />
              </div>
              <div className="col-span-2 space-y-2">
                <Label>Rol del Sistema</Label>
                <Select
                  value={formData.role}
                  onValueChange={(v) => setFormData({...formData, role: v as AppRole})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {availableRoles.map((role) => (
                      <SelectItem key={role} value={role}>
                        {roleLabels[role]} - {roleDescriptions[role]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Crear Usuario
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
