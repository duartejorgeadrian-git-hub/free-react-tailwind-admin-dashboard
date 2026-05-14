import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  AlertTriangle,
  Search,
  Clock,
  CheckCircle2,
  Archive,
} from 'lucide-react';
import { useRealtimeAlerts } from '@/hooks/useRealtimeAlerts';
import { AlertsList } from '@/components/alerts/AlertsList';
import { AlertDetailPanel } from '@/components/alerts/AlertDetailPanel';
import type { Alert } from '@/types';

export default function Alerts() {
  const { alerts, loading } = useRealtimeAlerts();
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);

  // Evita que quede abierto el detalle si la alerta deja de estar seleccionada
  // (por cambios de status en tiempo real).
  const dismissIfNotVisible = (alert: Alert | null) => {
    if (!alert) return null;
    const isInCurrentTab = (() => {
      switch (activeTab) {
        case 'activa':
          return alert.status === 'activa';
        case 'en_atencion':
          return alert.status === 'en_atencion';
        case 'resuelta':
          return alert.status === 'resuelta';
        case 'archivada':
          return alert.status === 'archivada';
        default:
          return alert.status === 'activa';
      }
    })();

    // Si el usuario estaba viendo una tab distinta y la alerta ya no corresponde,
    // se cierra para que no “se siga viendo”.
    return isInCurrentTab ? alert : null;
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('activa');

  // Filter alerts by status and search
  const filterAlerts = (status: string) => {
    return alerts.filter((alert) => {
      const matchesStatus = alert.status === status;
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        searchQuery === '' ||
        alert.address?.toLowerCase().includes(q) ||
        alert.description?.toLowerCase().includes(q) ||
        alert.type.toLowerCase().includes(q);

      return matchesStatus && matchesSearch;
    });
  };

  const activaAlerts = filterAlerts('activa');
  const enAtencionAlerts = filterAlerts('en_atencion');
  const resueltaAlerts = filterAlerts('resuelta');
  const archivadaAlerts = filterAlerts('archivada');

  const tabCounts = {
    activa: activaAlerts.length,
    en_atencion: enAtencionAlerts.length,
    resuelta: resueltaAlerts.length,
    archivada: archivadaAlerts.length,
  };

  const getCurrentAlerts = () => {
    switch (activeTab) {
      case 'activa':
        return activaAlerts;
      case 'en_atencion':
        return enAtencionAlerts;
      case 'resuelta':
        return resueltaAlerts;
      case 'archivada':
        return archivadaAlerts;
      default:
        return activaAlerts;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Gestión de Alertas</h1>
          <p className="text-muted-foreground">Monitoreo y gestión de todas las alertas del sistema</p>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por dirección, tipo..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-destructive/5 border-destructive/20">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-destructive/10">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold text-destructive">{tabCounts.activa}</p>
              <p className="text-xs text-muted-foreground">Activas</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-amber-500/5 border-amber-500/20">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10">
              <Clock className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-600">{tabCounts.en_atencion}</p>
              <p className="text-xs text-muted-foreground">En Atención</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-green-500/5 border-green-500/20">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/10">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">{tabCounts.resuelta}</p>
              <p className="text-xs text-muted-foreground">Resueltas</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-muted/50 border-muted">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-muted">
              <Archive className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold">{tabCounts.archivada}</p>
              <p className="text-xs text-muted-foreground">Archivadas</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="activa" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            <span className="hidden sm:inline">Activas</span>
            <Badge variant="secondary" className="ml-1">
              {tabCounts.activa}
            </Badge>
          </TabsTrigger>

          <TabsTrigger value="en_atencion" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span className="hidden sm:inline">En Atención</span>
            <Badge variant="secondary" className="ml-1">
              {tabCounts.en_atencion}
            </Badge>
          </TabsTrigger>

          <TabsTrigger value="resuelta" className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            <span className="hidden sm:inline">Resueltas</span>
            <Badge variant="secondary" className="ml-1">
              {tabCounts.resuelta}
            </Badge>
          </TabsTrigger>

          <TabsTrigger value="archivada" className="flex items-center gap-2">
            <Archive className="h-4 w-4" />
            <span className="hidden sm:inline">Archivadas</span>
            <Badge variant="secondary" className="ml-1">
              {tabCounts.archivada}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          <Card>
            <CardContent className="p-0">
              <AlertsList
                alerts={getCurrentAlerts()}
                loading={loading}
                selectedAlertId={selectedAlert?.id}
                onAlertSelect={(a: Alert) => {
                  // Solo permite abrir el panel si la alerta corresponde a la tab actual.
                  setSelectedAlert(dismissIfNotVisible(a));
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Alert Detail Panel */}
      {selectedAlert && (
        <AlertDetailPanel
          alert={selectedAlert}
          onAlertUpdated={(updatedAlert: any) => {
            // Si viene null: cerrar panel para que la alerta no quede seleccionada
            if (!updatedAlert) {
              setSelectedAlert(null);
              return;
            }

            // Actualizar la selección si el panel sigue abierto
            setSelectedAlert(updatedAlert);
          }}
        />
      )}
    </div>
  );
}

