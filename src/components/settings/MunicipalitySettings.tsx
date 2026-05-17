import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  RefreshCw,
  Building2,
  Save,
  Palette,
  PhoneCall,
  MapPin,
  Settings2,
  Video,
  ShieldCheck,
  Server,
  HardDrive
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useMunicipality } from '@/context/MunicipalityContext';
import { toast } from 'sonner';

const rawUrl = import.meta.env.VITE_API_URL || '';
const API_URL = (rawUrl.split(' ')[0] || `http://${window.location.hostname}:3001`).trim();

interface MunicipalityConfig {
  name: string;
  code: string;
  province: string;
  primaryColor: string;
  logoUrl: string;
  emergencyPolice: string;
  emergencyFire: string;
  emergencyMedical: string;
  geofenceRadius: number;
  sosAudioDuration: number;
  dssV8Url: string;
  dssV8ApiKey: string;
  videoSourceType: 'simulated' | 'dss_v8' | 'nvr_direct' | 'milestone';
  nvrHost: string;
  nvrUser: string;
  nvrPassword: string;
  nvrRtspPort: number;
}

export function MunicipalitySettings() {
  const { profile, role } = useAuth();
  const { selectedMunicipality } = useMunicipality();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const targetMunicipalityId = (role === 'superadmin' || role === 'admin')
    ? selectedMunicipality?.id
    : (profile?.municipalityId || (profile as any)?.municipality_id);

  const [config, setConfig] = useState<MunicipalityConfig>({
    name: '',
    code: '',
    province: '',
    primaryColor: '#1e40af',
    logoUrl: '',
    emergencyPolice: '101',
    emergencyFire: '100',
    emergencyMedical: '107',
    geofenceRadius: 5000,
    sosAudioDuration: 10,
    dssV8Url: '',
    dssV8ApiKey: '',
    videoSourceType: 'simulated',
    nvrHost: '',
    nvrUser: '',
    nvrPassword: '',
    nvrRtspPort: 554,
  });

  useEffect(() => {
    if (targetMunicipalityId) {
      fetchMunicipalityConfig();
    } else {
      setLoading(false);
    }
  }, [targetMunicipalityId]);

  const fetchMunicipalityConfig = async () => {
    if (!targetMunicipalityId) return;
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/municipalities/${targetMunicipalityId}`);
      const data = await response.json();

      if (data) {
        setConfig({
          name: data.name || '',
          code: data.code || '',
          province: data.province || '',
          primaryColor: data.primary_color || '#1e40af',
          logoUrl: data.logo_url || '',
          emergencyPolice: data.emergency_police || '101',
          emergencyFire: data.emergency_fire || '100',
          emergencyMedical: data.emergency_medical || '107',
          geofenceRadius: data.geofence_radius || 5000,
          sosAudioDuration: data.sos_audio_duration || 10,
          dssV8Url: data.dss_v8_url || '',
          dssV8ApiKey: data.dss_v8_api_key || '',
          videoSourceType: data.video_source_type || 'simulated',
          nvrHost: data.nvr_host || '',
          nvrUser: data.nvr_user || '',
          nvrPassword: data.nvr_password || '',
          nvrRtspPort: data.nvr_rtsp_port || 554,
        });
      }
    } catch (error) {
      console.error('Error fetching municipality config:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!targetMunicipalityId) return;
    setSaving(true);
    try {
      const response = await fetch(`${API_URL}/api/tenants/${targetMunicipalityId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': profile?.user_id || ''
        },
        body: JSON.stringify({
          name: config.name,
          code: config.code,
          province: config.province,
          isActive: true,
          primaryColor: config.primaryColor,
          logoUrl: config.logoUrl,
          emergencyPolice: config.emergencyPolice,
          emergencyFire: config.emergencyFire,
          emergencyMedical: config.emergencyMedical,
          geofenceRadius: config.geofenceRadius,
          sosAudioDuration: config.sosAudioDuration,
          dssV8Url: config.dssV8Url,
          dssV8ApiKey: config.dssV8ApiKey,
          videoSourceType: config.videoSourceType,
          nvrHost: config.nvrHost,
          nvrUser: config.nvrUser,
          nvrPassword: config.nvrPassword,
          nvrRtspPort: config.nvrRtspPort,
        }),
      });

      if (!response.ok) throw new Error('Failed to update');
      toast.success('Configuración municipal actualizada correctamente');
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

  if (!targetMunicipalityId) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Building2 className="h-16 w-16 mx-auto text-muted-foreground mb-6 opacity-20" />
          <h2 className="text-xl font-bold mb-2">Seleccione un Municipio</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Como SuperAdmin, utilice el selector de la barra superior para elegir qué municipio desea configurar.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Centro de Control Municipal</h2>
          <p className="text-muted-foreground">Personaliza la identidad y protocolos de tu jurisdicción</p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="shadow-lg">
          {saving ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
          {saving ? 'Guardando...' : 'Guardar Cambios'}
        </Button>
      </div>

      <Tabs defaultValue="identity" className="w-full">
        <TabsList className="grid grid-cols-4 w-full h-12">
          <TabsTrigger value="identity" className="gap-2"><Palette className="h-4 w-4" /> Identidad</TabsTrigger>
          <TabsTrigger value="emergency" className="gap-2"><PhoneCall className="h-4 w-4" /> Emergencia</TabsTrigger>
          <TabsTrigger value="operation" className="gap-2"><Settings2 className="h-4 w-4" /> Operación</TabsTrigger>
          <TabsTrigger value="integration" className="gap-2"><Video className="h-4 w-4" /> Video & APIs</TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <TabsContent value="identity">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Imagen Institucional</CardTitle>
                <CardDescription>Configura cómo se verá la app para tus ciudadanos</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Color Primario (Hexadecimal)</Label>
                    <div className="flex gap-3">
                      <Input
                        type="color"
                        className="w-12 h-10 p-1"
                        value={config.primaryColor}
                        onChange={(e) => setConfig(prev => ({ ...prev, primaryColor: e.target.value }))}
                      />
                      <Input
                        placeholder="#1e40af"
                        value={config.primaryColor}
                        onChange={(e) => setConfig(prev => ({ ...prev, primaryColor: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>URL del Logo / Escudo Municipal</Label>
                    <Input
                      placeholder="https://ejemplo.gob.ar/logo.png"
                      value={config.logoUrl}
                      onChange={(e) => setConfig(prev => ({ ...prev, logoUrl: e.target.value }))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="emergency">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Protocolos de Despacho</CardTitle>
                <CardDescription>Números directos que disparará la App SOS</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2"><ShieldCheck className="h-3 w-3 text-blue-600" /> Policía</Label>
                    <Input
                      value={config.emergencyPolice}
                      onChange={(e) => setConfig(prev => ({ ...prev, emergencyPolice: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2"><ShieldCheck className="h-3 w-3 text-red-600" /> Bomberos</Label>
                    <Input
                      value={config.emergencyFire}
                      onChange={(e) => setConfig(prev => ({ ...prev, emergencyFire: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2"><ShieldCheck className="h-3 w-3 text-green-600" /> Salud/SAME</Label>
                    <Input
                      value={config.emergencyMedical}
                      onChange={(e) => setConfig(prev => ({ ...prev, emergencyMedical: e.target.value }))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="operation">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Parámetros Operativos</CardTitle>
                <CardDescription>Límites de acción y captura de evidencia</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2"><MapPin className="h-3 w-3" /> Radio de Cobertura (Metros)</Label>
                    <Input
                      type="number"
                      value={config.geofenceRadius}
                      onChange={(e) => setConfig(prev => ({ ...prev, geofenceRadius: parseInt(e.target.value) }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Duración Captura Audio (Segundos)</Label>
                    <Input
                      type="number"
                      value={config.sosAudioDuration}
                      onChange={(e) => setConfig(prev => ({ ...prev, sosAudioDuration: parseInt(e.target.value) }))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="integration">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Video className="h-5 w-5 text-primary" />
                    Fuente de Video Principal
                  </CardTitle>
                  <CardDescription>Selecciona cómo el Centro de Monitoreo recibirá las señales de video</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Label>Tipo de Sistema</Label>
                    <Select
                      value={config.videoSourceType}
                      onValueChange={(v: any) => setConfig(prev => ({ ...prev, videoSourceType: v }))}
                    >
                      <SelectTrigger className="w-full md:w-[300px]">
                        <SelectValue placeholder="Seleccionar fuente" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="simulated">Modo Simulación (Demo)</SelectItem>
                        <SelectItem value="dss_v8">Dahua DSS Pro V8 (Recomendado)</SelectItem>
                        <SelectItem value="nvr_direct">Conexión Directa NVR/DVR</SelectItem>
                        <SelectItem value="milestone">Milestone XProtect</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {config.videoSourceType === 'dss_v8' && (
                <Card className="border-blue-200 bg-blue-50/30 animate-in fade-in slide-in-from-top-2">
                  <CardHeader>
                    <CardTitle className="text-md flex items-center gap-2 text-blue-800">
                      <Server className="h-4 w-4" /> Configuración Dahua DSS V8
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>URL Servidor DSS (con Puerto)</Label>
                      <Input
                        placeholder="https://10.10.80.83:443"
                        value={config.dssV8Url}
                        onChange={(e) => setConfig(prev => ({ ...prev, dssV8Url: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>API Key / Token de Integración</Label>
                      <Input
                        type="password"
                        placeholder="Token generado por DSS API Tool"
                        value={config.dssV8ApiKey}
                        onChange={(e) => setConfig(prev => ({ ...prev, dssV8ApiKey: e.target.value }))}
                      />
                    </div>
                  </CardContent>
                </Card>
              )}

              {config.videoSourceType === 'nvr_direct' && (
                <Card className="border-amber-200 bg-amber-50/30 animate-in fade-in slide-in-from-top-2">
                  <CardHeader>
                    <CardTitle className="text-md flex items-center gap-2 text-amber-800">
                      <HardDrive className="h-4 w-4" /> Configuración Directa NVR/DVR/XVR
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>IP Pública / Host DNS</Label>
                      <Input
                        placeholder="muni-gallegos.ddns.net"
                        value={config.nvrHost}
                        onChange={(e) => setConfig(prev => ({ ...prev, nvrHost: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Puerto RTSP (Default 554)</Label>
                      <Input
                        type="number"
                        value={config.nvrRtspPort}
                        onChange={(e) => setConfig(prev => ({ ...prev, nvrRtspPort: parseInt(e.target.value) }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Usuario del Equipo</Label>
                      <Input
                        placeholder="admin"
                        value={config.nvrUser}
                        onChange={(e) => setConfig(prev => ({ ...prev, nvrUser: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Contraseña</Label>
                      <Input
                        type="password"
                        value={config.nvrPassword}
                        onChange={(e) => setConfig(prev => ({ ...prev, nvrPassword: e.target.value }))}
                      />
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
