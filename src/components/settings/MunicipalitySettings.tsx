import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RefreshCw, Building2, Save } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

const API_URL = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:3001`;

interface MunicipalityConfig {
  name: string;
  code: string;
  province: string;
  primaryColor: string;
  logoUrl: string;
  notifications: {
    criticalAlerts: boolean;
    emailNotifications: boolean;
    soundEnabled: boolean;
  };
}

export function MunicipalitySettings() {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState<MunicipalityConfig>({
    name: '',
    code: '',
    province: '',
    primaryColor: '#1e40af',
    logoUrl: '',
    notifications: {
      criticalAlerts: true,
      emailNotifications: true,
      soundEnabled: true,
    },
  });

  useEffect(() => {
    if (profile?.municipalityId) {
      fetchMunicipalityConfig();
    } else {
      setLoading(false);
    }
  }, [profile?.municipalityId]);

  const fetchMunicipalityConfig = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/municipalities/${profile?.municipalityId}`);
      const data = await response.json();

      if (data) {
        setConfig({
          name: data.name,
          code: data.code,
          province: data.province,
          primaryColor: data.primary_color || '#1e40af',
          logoUrl: data.logo_url || '',
          notifications: {
            criticalAlerts: true,
            emailNotifications: true,
            soundEnabled: true,
          },
        });
      }
    } catch (error) {
      console.error('Error fetching municipality config:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch(`${API_URL}/api/municipalities/${profile?.municipalityId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': profile?.user_id || ''
        },
        body: JSON.stringify({
          name: config.name,
          code: config.code,
          province: config.province,
        }),
      });

      if (!response.ok) throw new Error('Failed to update');

      toast.success('Configuración guardada exitosamente');
    } catch (error) {
      console.error('Error saving config:', error);
      toast.error('Error al guardar la configuración');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!profile?.municipalityId) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-lg font-semibold mb-2">Sin Municipio Asignado</h2>
          <p className="text-muted-foreground">
            No tiene un municipio asignado para configurar.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* General Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Información del Municipio
          </CardTitle>
          <CardDescription>
            Configuración general del municipio
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nombre del Municipio</Label>
              <Input
                value={config.name}
                onChange={(e) => setConfig(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Código</Label>
              <Input
                value={config.code}
                onChange={(e) => setConfig(prev => ({ ...prev, code: e.target.value }))}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Provincia</Label>
            <Input
              value={config.province}
              onChange={(e) => setConfig(prev => ({ ...prev, province: e.target.value }))}
            />
          </div>
        </CardContent>
      </Card>

      {/* Buttons */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Guardando...' : 'Guardar Cambios'}
        </Button>
      </div>
    </div>
  );
}
