import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Settings as SettingsIcon, 
  Users,
  Building2,
  Shield,
  Palette
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { UserManagement } from '@/components/settings/UserManagement';
import { TenantManagement } from '@/components/settings/TenantManagement';
import { MunicipalitySettings } from '@/components/settings/MunicipalitySettings';

export default function Settings() {
  const { hasPermission, hasAnyRole, role: _role } = useAuth();
  const [activeTab, setActiveTab] = useState('users');

  const canManageUsers = hasPermission('manage_users');
  const canManageTenants = hasPermission('manage_tenants');
  const canManageConfig = hasPermission('manage_config');
  const isSuperadmin = hasAnyRole(['superadmin']);

  // Set default tab based on permission
  useEffect(() => {
    if (canManageUsers) {
      setActiveTab('users');
    } else if (canManageTenants) {
      setActiveTab('tenants');
    } else if (canManageConfig) {
      setActiveTab('municipality');
    }
  }, [canManageUsers, canManageTenants, canManageConfig]);

  if (!canManageUsers && !canManageTenants && !canManageConfig) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-lg font-semibold mb-2">Acceso Restringido</h2>
            <p className="text-muted-foreground">
              No tiene permisos para acceder a la configuración del sistema.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <SettingsIcon className="h-6 w-6 text-primary" />
          Configuración del Sistema
        </h1>
        <p className="text-muted-foreground">
          Administración de usuarios, tenants y configuración general
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          {canManageUsers && (
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Usuarios
            </TabsTrigger>
          )}
          {isSuperadmin && (
            <TabsTrigger value="tenants" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Tenants
            </TabsTrigger>
          )}
          {canManageConfig && (
            <TabsTrigger value="municipality" className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Municipio
            </TabsTrigger>
          )}
        </TabsList>

        {canManageUsers && (
          <TabsContent value="users">
            <UserManagement />
          </TabsContent>
        )}

        {isSuperadmin && (
          <TabsContent value="tenants">
            <TenantManagement />
          </TabsContent>
        )}

        {canManageConfig && (
          <TabsContent value="municipality">
            <MunicipalitySettings />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
