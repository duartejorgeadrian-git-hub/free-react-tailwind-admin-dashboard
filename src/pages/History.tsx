import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { History as HistoryIcon, Search, CheckCircle2, Archive, Clock, MapPin, RefreshCw } from 'lucide-react';
import { AlertDetailPanel } from '@/components/alerts/AlertDetailPanel';
import { Skeleton } from '@/components/ui/skeleton';
import type { Alert } from '@/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useMunicipality } from '@/context/MunicipalityContext';

const API_URL = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:3001`;

export default function History() {
  const { selectedMunicipality } = useMunicipality();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);

  useEffect(() => {
    fetchHistory();
  }, [selectedMunicipality]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const municipalityParam = selectedMunicipality ? `&municipalityId=${selectedMunicipality.id}` : '';
      const response = await fetch(`${API_URL}/api/alerts?period=all${municipalityParam}`);
      if (!response.ok) throw new Error('Error al cargar historial');
      const data = await response.json();

      const mapped = data.map((row: any) => ({
        ...row,
        createdAt: row.created_at,
        resolvedAt: row.resolved_at,
        municipalityId: row.municipality_id
      }));

      setAlerts(mapped);
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false);
    }
  };

  // Historical = resolved or archived alerts (or everything that isn't active/en_atencion if preferred)
  const historicalAlerts = alerts.filter(a => a.status === 'resuelta' || a.status === 'archivada');

  const filtered = historicalAlerts.filter(a => {
    const matchesSearch = searchQuery === '' ||
      a.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.type.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || a.status === statusFilter;
    const matchesType = typeFilter === 'all' || a.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const types = [...new Set(historicalAlerts.map(a => a.type))];

  const stats = {
    total: historicalAlerts.length,
    resueltas: historicalAlerts.filter(a => a.status === 'resuelta').length,
    archivadas: historicalAlerts.filter(a => a.status === 'archivada').length,
  };

  const formatDate = (d: string) => d ? new Date(d).toLocaleString('es-AR') : 'N/A';

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <HistoryIcon className="h-6 w-6 text-primary" />
            Historial de Alertas
          </h1>
          <p className="text-muted-foreground">
            Registro completo de alertas resueltas y archivadas
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchHistory} disabled={loading} className="gap-2">
          <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
          Actualizar
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10"><HistoryIcon className="h-5 w-5 text-primary" /></div>
            <div><p className="text-2xl font-bold">{stats.total}</p><p className="text-xs text-muted-foreground">Total Histórico</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/10"><CheckCircle2 className="h-5 w-5 text-green-500" /></div>
            <div><p className="text-2xl font-bold text-green-600">{stats.resueltas}</p><p className="text-xs text-muted-foreground">Resueltas</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-muted"><Archive className="h-5 w-5 text-muted-foreground" /></div>
            <div><p className="text-2xl font-bold">{stats.archivadas}</p><p className="text-xs text-muted-foreground">Archivadas</p></div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar dirección, tipo..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10" />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger><SelectValue placeholder="Estado" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="resuelta">Resueltas</SelectItem>
                <SelectItem value="archivada">Archivadas</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger><SelectValue placeholder="Tipo" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                {types.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Registros ({filtered.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">No hay alertas en el historial</div>
          ) : (
            <ScrollArea className="h-[500px]">
              <div className="space-y-2">
                {filtered.map(a => (
                  <button
                    key={a.id}
                    onClick={() => setSelectedAlert(a)}
                    className={cn(
                      "w-full text-left p-4 border rounded-lg hover:bg-muted/50 transition-colors",
                      selectedAlert?.id === a.id && "bg-primary/5 border-primary"
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant={a.status === 'resuelta' ? 'outline' : 'secondary'} className="text-xs">
                            {a.status.toUpperCase()}
                          </Badge>
                          <Badge variant="outline" className="text-xs">{a.type}</Badge>
                          <Badge variant="outline" className="text-xs font-mono">{a.severity}</Badge>
                        </div>
                        <p className="font-medium truncate">{a.address || 'Sin dirección registrada'}</p>
                        {a.description && <p className="text-sm text-muted-foreground truncate">{a.description}</p>}
                        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><Clock className="h-3 w-3" />Iniciada: {formatDate(a.createdAt)}</span>
                          {a.resolvedAt && <span className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3 text-green-600" />Resuelta: {formatDate(a.resolvedAt)}</span>}
                          <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{Number(a.latitude).toFixed(4)}, {Number(a.longitude).toFixed(4)}</span>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {selectedAlert && (
        <AlertDetailPanel alert={selectedAlert} onAlertUpdated={() => {
          setSelectedAlert(null);
          fetchHistory();
        }} />
      )}
    </div>
  );
}
