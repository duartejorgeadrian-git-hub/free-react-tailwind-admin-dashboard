import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Building2, 
  Plus,
  Edit,
  Trash2,
  MapPin,
  Users,
  CheckCircle2,
  AlertCircle,
  ChevronDown
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

// Mapeo de Provincias y Ciudades de Argentina
const locationData: Record<string, string[]> = {
  "Santa Cruz": ["Rio Gallegos", "El Calafate", "Caleta Olivia", "Puerto Deseado", "Las Heras", "Rio Turbio"],
  "Chubut": ["Comodoro Rivadavia", "Trelew", "Puerto Madryn", "Rawson", "Esquel"],
  "Tierra del Fuego": ["Ushuaia", "Rio Grande", "Tolhuin"],
  "Buenos Aires": ["La Plata", "Mar del Plata", "Bahia Blanca", "Lanus", "Quilmes", "Pilar"],
  "Cordoba": ["Cordoba Capital", "Villa Carlos Paz", "Rio Cuarto", "San Francisco"],
  "Santa Fe": ["Rosario", "Santa Fe Capital", "Rafaela", "Venado Tuerto"],
  "Mendoza": ["Mendoza Capital", "San Rafael", "Godoy Cruz"],
  "Neuquen": ["Neuquen Capital", "San Martin de los Andes", "Cutral Co"],
  "Rio Negro": ["Viedma", "Bariloche", "General Roca", "Cipolletti"]
};

interface Tenant {
  id: string;
  name: string;
  code: string;
  province?: string;
  isActive: boolean;
  contactEmail?: string | null;
  contactPhone?: string | null;
  address?: string | null;
  primaryColor?: string | null;
  logoUrl?: string | null;
  municipalityCount: number;
  userCount: number;
  alertCount?: number;
}

const API_URL = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:3001`;

export function TenantManagement() {
  const { user: currentUser } = useAuth();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    province: 'Santa Cruz',
    contactEmail: '',
    contactPhone: '',
    address: '',
    primaryColor: '#1e40af',
    isActive: true,
  });

  useEffect(() => {
    fetchTenants();
  }, []);

  const fetchTenants = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/tenants`);
      if (!response.ok) throw new Error('Error al cargar tenants');
      const data = await response.json();
      setTenants(data);
    } catch (error) {
      console.error('Error fetching tenants:', error);
      toast.error('Error al cargar tenants del servidor local');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTenant = async () => {
    try {
      const response = await fetch(`${API_URL}/api/tenants`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUser?.id || ''
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Error al crear tenant');

      toast.success(`Tenant "${formData.name}" creado exitosamente`);
      setIsCreating(false);
      resetForm();
      fetchTenants();
    } catch (error: any) {
      console.error('Error creating tenant:', error);
      toast.error(error?.message || 'Error al crear tenant');
    }
  };

  const handleUpdateTenant = async () => {
    if (!editingTenant) return;

    try {
      const response = await fetch(`${API_URL}/api/tenants/${editingTenant.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUser?.id || ''
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Error al actualizar tenant');

      toast.success(`Tenant "${formData.name}" actualizado`);
      setEditingTenant(null);
      resetForm();
      fetchTenants();
    } catch (error: any) {
      console.error('Error updating tenant:', error);
      toast.error(error?.message || 'Error al actualizar tenant');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      contactEmail: '',
      contactPhone: '',
      address: '',
      primaryColor: '#1e40af',
      isActive: true,
    });
  };

  const openEditDialog = (tenant: Tenant) => {
    setFormData({
      name: tenant.name,
      code: tenant.code,
      contactEmail: tenant.contactEmail || '',
      contactPhone: tenant.contactPhone || '',
      address: tenant.address || '',
      primaryColor: tenant.primaryColor || '#1e40af',
      isActive: tenant.isActive,
    });
    setEditingTenant(tenant);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Gestión de Tenants
              </CardTitle>
              <CardDescription>
                Administre los tenants (ciudades/municipios) del sistema
              </CardDescription>
            </div>
            <Button onClick={() => setIsCreating(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Tenant
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="p-4 border rounded-lg">
                  <Skeleton className="h-6 w-1/3 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          ) : tenants.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No hay tenants configurados
            </div>
          ) : (
            <ScrollArea className="h-[500px]">
              <div className="space-y-4">
                {tenants.map((tenant) => (
                  <div 
                    key={tenant.id}
                    className="p-4 border rounded-lg hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div 
                          className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold"
                          style={{ backgroundColor: tenant.primaryColor || '#1e40af' }}
                        >
                          {tenant.code.substring(0, 2)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{tenant.name}</h3>
                            <Badge variant="outline" className="text-xs">
                              {tenant.code}
                            </Badge>
                            {tenant.isActive ? (
                              <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Activo
                              </Badge>
                            ) : (
                              <Badge variant="secondary">Inactivo</Badge>
                            )}
                            <span className="flex items-center gap-1">
                              <AlertCircle className="h-3 w-3" />
                              {tenant.alertCount || 0} alertas
                            </span>
                          </div>
                          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {tenant.municipalityCount} municipios
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {tenant.userCount} usuarios
                            </span>
                            <span className="flex items-center gap-1">
                              <AlertCircle className="h-3 w-3" />
                              {tenant.alertCount || 0} alertas
                            </span>
                          </div>
                          {tenant.contactEmail && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {tenant.contactEmail}
                            </p>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(tenant)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={isCreating || !!editingTenant} onOpenChange={() => {
        setIsCreating(false);
        setEditingTenant(null);
        resetForm();
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {isCreating ? 'Nuevo Tenant' : 'Editar Tenant'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Provincia</Label>
                <Select
                  value={formData.province}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, province: value, name: '' }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione Provincia" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(locationData).sort().map(prov => (
                      <SelectItem key={prov} value={prov}>{prov}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Ciudad (Nombre Tenant)</Label>
                <Select
                  value={formData.name}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, name: value }))}
                  disabled={!formData.province}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione Ciudad" />
                  </SelectTrigger>
                  <SelectContent>
                    {formData.province && locationData[formData.province]?.sort().map(city => (
                      <SelectItem key={city} value={city}>{city}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label>Código Identificador</Label>
                <Input
                  value={formData.code}
                  onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                  placeholder="Ej: RG001 o RIO_GALLEGOS"
                  className="uppercase"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Email de Contacto</Label>
              <Input
                type="email"
                value={formData.contactEmail}
                onChange={(e) => setFormData(prev => ({ ...prev, contactEmail: e.target.value }))}
                placeholder="contacto@municipio.gob.ar"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Teléfono</Label>
              <Input
                value={formData.contactPhone}
                onChange={(e) => setFormData(prev => ({ ...prev, contactPhone: e.target.value }))}
                placeholder="+54 2966 ..."
              />
            </div>
            
            <div className="space-y-2">
              <Label>Dirección</Label>
              <Input
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                placeholder="Av. Principal 123"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Color Primario</Label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={formData.primaryColor}
                    onChange={(e) => setFormData(prev => ({ ...prev, primaryColor: e.target.value }))}
                    className="w-10 h-10 rounded border cursor-pointer"
                  />
                  <Input
                    value={formData.primaryColor}
                    onChange={(e) => setFormData(prev => ({ ...prev, primaryColor: e.target.value }))}
                    className="flex-1"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Estado</Label>
                <div className="flex items-center gap-2 h-10">
                  <Switch
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                  />
                  <span className="text-sm">
                    {formData.isActive ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsCreating(false);
              setEditingTenant(null);
              resetForm();
            }}>
              Cancelar
            </Button>
            <Button onClick={isCreating ? handleCreateTenant : handleUpdateTenant}>
              {isCreating ? 'Crear Tenant' : 'Guardar Cambios'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
