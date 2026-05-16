// RG Alerta - Dashboard Mejorado del Centro de Monitoreo
import { useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Bell,
  Map,
  Keyboard,
  AlertTriangle,
  Siren,
  RefreshCw
} from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useAuth } from '@/hooks/useAuth';
import { useRealtimeAlerts } from '@/hooks/useRealtimeAlerts';
import { useOperatorStatus } from '@/hooks/useOperatorStatus';
import { useToast } from '@/hooks/use-toast';
import { useAudioSettings } from '@/hooks/useAudioSettings';
import { useKeyboardShortcuts, KeyboardShortcutsHelp } from '@/hooks/useKeyboardShortcuts';
import { useNearbyCameras } from '@/hooks/useNearbyCameras';
import { apiService } from '@/services/apiService';
import { SystemStatusBar } from '@/components/dashboard/SystemStatusBar';
import { EnhancedAlertCard } from '@/components/dashboard/EnhancedAlertCard';
import { EnhancedOperatorsPanel } from '@/components/dashboard/EnhancedOperatorsPanel';
import { FocusModePanel } from '@/components/dashboard/FocusModePanel';
import { IncidentMap } from '@/components/maps/IncidentMap';
import { useMunicipality } from '@/context/MunicipalityContext';
import type { Alert, MapCamera } from '@/types';
import { toast as sonnerToast } from 'sonner';

const alertTypeLabels: Record<string, string> = {
  antipanico: 'Alerta Antipánico',
  medica: 'Emergencia Médica',
  incendio: 'Incendio',
  accidente: 'Accidente',
  seguridad: 'Seguridad',
};

const severityConfig: Record<string, { variant: 'default' | 'destructive' | 'secondary'; label: string }> = {
  critica: { variant: 'destructive', label: 'CRÍTICA' },
  alta: { variant: 'destructive', label: 'Alta' },
  media: { variant: 'default', label: 'Media' },
  baja: { variant: 'secondary', label: 'Baja' },
};

function formatElapsedTime(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin > 0) return `${diffMin}m ${diffSec % 60}s`;
  return `${diffSec}s`;
}

export default function Dashboard() {
  const { hasPermission, user } = useAuth();
  const { selectedMunicipality } = useMunicipality();
  const { toast } = useToast();
  const { playAlertSound } = useAudioSettings();

  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [focusMode, setFocusMode] = useState(false);
  const [showAllCameras, setShowAllCameras] = useState(false);

  // 1. DEFINIR mapCenter dinámico con respaldo inteligente
  const mapCenter = useMemo(() => {
    const lat = Number(selectedMunicipality?.latitude);
    const lng = Number(selectedMunicipality?.longitude);

    if (lat && lng && lat !== 0) {
      return { lat, lng };
    }

    // Respaldo por nombre si la base de datos aún no devolvió coordenadas (UX de emergencia)
    const name = (selectedMunicipality?.name || '').toLowerCase();
    if (name.includes("calafate")) return { lat: -50.3408, lng: -72.2711 };
    if (name.includes("caleta olivia")) return { lat: -46.4389, lng: -67.5192 };
    if (name.includes("ushuaia")) return { lat: -54.8019, lng: -68.3030 };

    // Default: Río Gallegos
    return { lat: -51.6226, lng: -69.2181 };
  }, [selectedMunicipality]);

  // 2. USAR mapCenter DESPUÉS
  const { cameras, primaryCamera } = useNearbyCameras({
    latitude: selectedAlert?.latitude || mapCenter.lat,
    longitude: selectedAlert?.longitude || mapCenter.lng,
    limit: 5,
    showAll: showAllCameras,
    municipalityId: selectedMunicipality?.id
  });

  const mapCameras: MapCamera[] = useMemo(() =>
    cameras.map((c: any) => ({
      id: c.id,
      name: c.name,
      latitude: Number(c.latitude),
      longitude: Number(c.longitude),
      address: c.address,
      is_active: true,
      code: c.code,
      feed_url: c.feed_url
    })), [cameras]);

  const handleNewAlert = useCallback((alert: Alert) => {
    const typeLabel = alertTypeLabels[alert.type] || alert.type;
    const severity = severityConfig[alert.severity] || severityConfig.media;

    playAlertSound(alert.severity);

    toast({
      title: (
        <div className="flex items-center gap-2">
          {alert.severity === 'critica' ? (
            <Siren className="h-4 w-4 text-destructive animate-pulse" />
          ) : (
            <AlertTriangle className="h-4 w-4" />
          )}
          <span>{typeLabel}</span>
        </div>
      ) as any,
      description: (
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Badge variant={severity.variant} className="text-xs">
              {severity.label}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {new Date(alert.createdAt).toLocaleTimeString('es-AR')}
            </span>
          </div>
          {alert.address && (
            <p className="text-sm truncate">{alert.address}</p>
          )}
        </div>
      ) as any,
      variant: alert.severity === 'critica' ? 'destructive' : 'default',
      duration: alert.severity === 'critica' ? 10000 : 5000,
    });

    if (alert.severity === 'critica' && !selectedAlert) {
      setSelectedAlert(alert);
    }
  }, [toast, playAlertSound, selectedAlert]);

  const handleAlertUpdated = useCallback((alert: Alert) => {
    setSelectedAlert((prev) => (prev?.id === alert.id ? alert : prev));
  }, []);

  const { alerts, loading: alertsLoading, stats, isConnected } = useRealtimeAlerts({
    municipalityId: selectedMunicipality?.id,
    onNewAlert: (alert) => {
      if (selectedMunicipality && alert.municipalityId !== selectedMunicipality.id) return;
      handleNewAlert(alert);
    },
    onAlertUpdated: (alert) => handleAlertUpdated(alert),
  });

  const { operators, stats: operatorStats, isConnected: operatorsConnected } = useOperatorStatus();

  const activeAlerts = useMemo(() =>
    alerts.filter(a => a.status === 'activa' || a.status === 'en_atencion'),
    [alerts]
  );

  const firstCriticalAlert = useMemo(() =>
    activeAlerts.find(a => a.severity === 'critica'),
    [activeAlerts]
  );

  const handleTakeAlert = useCallback(async (alert: Alert) => {
    setSelectedAlert(alert);
    setFocusMode(true);
    if (alert.status === 'activa' && user?.id) {
      await apiService.updateAlertStatus(alert.id, 'en_atencion', user.id);
    }
  }, [user]);

  const handleTakeNextCritical = useCallback(() => {
    if (firstCriticalAlert) {
      handleTakeAlert(firstCriticalAlert);
    }
  }, [firstCriticalAlert, handleTakeAlert]);

  const handleResolveAlert = useCallback(async () => {
    if (selectedAlert && user?.id) {
      const res = await apiService.updateAlertStatus(selectedAlert.id, 'resuelta', user.id);
      if (res.success) {
        toast({
          title: 'Alerta resuelta',
          description: `La alerta ha sido marcada como resuelta y archivada.`,
        });
        setFocusMode(false);
        setSelectedAlert(null);
      } else {
        toast({
          title: 'Error',
          description: 'No se pudo actualizar el estado de la alerta.',
          variant: 'destructive'
        });
      }
    }
  }, [selectedAlert, user, toast]);

  const handleToggleMap = useCallback(() => {
    if (selectedAlert) {
      setFocusMode(!focusMode);
    }
  }, [selectedAlert, focusMode]);

  const handleEscape = useCallback(() => {
    if (focusMode) {
      setFocusMode(false);
    } else {
      setSelectedAlert(null);
    }
  }, [focusMode]);

  const shortcuts = useMemo(() => [
    { key: ' ', action: handleTakeNextCritical, description: 'Tomar alerta crítica' },
    { key: 'r', action: handleResolveAlert, description: 'Resolver alerta' },
    { key: 'm', action: handleToggleMap, description: 'Modo foco' },
    { key: 'Escape', action: handleEscape, description: 'Cerrar / Deseleccionar' },
  ], [handleTakeNextCritical, handleResolveAlert, handleToggleMap, handleEscape]);

  const handleSimulate = async () => {
    if (!selectedMunicipality) return;
    const confirm = window.confirm('¿Quieres resetear el historial y generar nuevas alertas de prueba perfectas?');
    if (!confirm) return;

    try {
      const baseUrl = `http://${window.location.hostname}:3001`;
      const res = await fetch(`${baseUrl}/api/simulation/reset-and-generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ municipalityId: selectedMunicipality.id })
      });

      if (res.ok) {
        sonnerToast.success('¡Simulación Exitosa! El sistema ha sido reseteado.');
        setTimeout(() => window.location.reload(), 800);
      } else {
        const err = await res.json();
        sonnerToast.error(err.error || 'Error en el servidor de simulación');
      }
    } catch (e) {
      sonnerToast.error('Error crítico: El servidor no responde en el puerto 3001');
    }
  };

  useKeyboardShortcuts();

  const operatorsList = useMemo(() =>
    operators.map((op: any) => ({
      id: op.id,
      name: `${op.nombre} ${op.apellido}`.trim() || 'Operador',
      initials: `${op.nombre?.[0] || ''}${op.apellido?.[0] || ''}`.toUpperCase() || 'OP',
      status: op.status as 'online' | 'busy' | 'away' | 'offline',
      currentAlertId: op.currentAlertId || undefined,
      currentAlertType: op.currentAlertId ? 'En atención' : undefined,
      alertTime: op.currentAlertId ? formatElapsedTime(op.lastHeartbeat) : undefined,
      resolvedToday: 0,
      avgResponseTime: '--:--',
    })),
    [operators]
  );

  return (
    <div className="space-y-4 h-full">
      <SystemStatusBar
        stats={stats}
        operatorStats={{ online: operatorStats.online, active: (operatorStats as any).active || 0 }}
        resolvedToday={stats.resueltas_hoy}
        avgResponseTime="2m 14s"
        isConnected={isConnected}
      />

      <div className="grid lg:grid-cols-3 gap-4 h-[calc(100vh-220px)]">
        <div className="lg:col-span-2 flex flex-col gap-4">
          <Card className="flex-1 min-h-0">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Map className="w-4 h-4 text-primary" />
                  Mapa de Incidentes
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSimulate}
                    className="h-8 text-[10px] font-bold bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100"
                  >
                    <RefreshCw className="w-3 h-3 mr-1" />
                    SIMULAR ALERTAS
                  </Button>
                  <div className="flex items-center gap-2 mr-4 bg-slate-100 p-1 rounded-lg border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-500 ml-2">VER TODAS</span>
                    <button
                      onClick={() => setShowAllCameras(!showAllCameras)}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${showAllCameras ? 'bg-indigo-600' : 'bg-slate-300'}`}
                    >
                      <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${showAllCameras ? 'translate-x-5' : 'translate-x-1'}`} />
                    </button>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {activeAlerts.length} alertas activas
                  </Badge>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Keyboard className="w-4 h-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-72" align="end">
                      <KeyboardShortcutsHelp shortcuts={shortcuts} />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-2 h-[calc(100%-60px)]">
              <IncidentMap
                alerts={activeAlerts}
                selectedAlertId={selectedAlert?.id}
                cameras={mapCameras}
                center={mapCenter}
                className="h-full rounded-lg"
              />
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-4 min-h-0">
          <Card className="flex-1 min-h-0 flex flex-col">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Bell className="w-4 h-4 text-primary" />
                  Alertas Activas
                </CardTitle>
                <Badge variant={stats.criticas > 0 ? 'destructive' : 'secondary'} className="text-xs">
                  {stats.criticas > 0 && `${stats.criticas} críticas`}
                  {stats.criticas === 0 && `${activeAlerts.length} activas`}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="flex-1 p-2 min-h-0">
              <ScrollArea className="h-full">
                <div className="space-y-2 pr-2">
                  {activeAlerts.length === 0 && !alertsLoading && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Bell className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No hay alertas activas</p>
                      <p className="text-xs mt-1">Las nuevas alertas aparecerán aquí</p>
                    </div>
                  )}
                  
                  {activeAlerts.map((alert) => (
                    <EnhancedAlertCard
                      key={alert.id}
                      alert={alert}
                      citizenName={alert.nombre ? `${alert.nombre} ${alert.apellido}` : "Ciudadano"}
                      isSelected={selectedAlert?.id === alert.id}
                      onSelect={() => setSelectedAlert(alert)}
                      onTake={() => handleTakeAlert(alert)}
                      onResolve={handleResolveAlert}
                      onViewMap={() => handleTakeAlert(alert)}
                    />
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {hasPermission('view_operators') && (
            <EnhancedOperatorsPanel
              operators={operatorsList}
              isConnected={operatorsConnected}
            />
          )}
        </div>
      </div>

      {focusMode && selectedAlert && (
        <FocusModePanel
          alert={selectedAlert}
          citizenName={selectedAlert.nombre ? `${selectedAlert.nombre} ${selectedAlert.apellido}` : "Ciudadano"}
          cameras={mapCameras}
          primaryCameraId={primaryCamera?.id}
          onClose={() => setFocusMode(false)}
          onResolve={handleResolveAlert}
        />
      )}
    </div>
  );
}
