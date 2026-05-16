import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
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
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);

  useEffect(() => {
    fetchHistory();
  }, [selectedMunicipality?.id]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      // CORRECCIÓN SENIOR: Garantizamos el ID correcto y eliminamos caché
      const municipalityParam = selectedMunicipality?.id ? `?municipalityId=${selectedMunicipality.id}` : '';
      const response = await fetch(`${API_URL}/api/alerts${municipalityParam}${municipalityParam ? '&' : '?'}t=${Date.now()}`);
      const data = await response.json();

      const mapped = (Array.isArray(data) ? data : []).map((row: any) => ({
        ...row,
        createdAt: row.createdAt || row.created_at,
        resolvedAt: row.resolvedAt || row.resolved_at,
        municipalityId: row.municipalityId || row.municipality_id
      }));

      setAlerts(mapped);
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false);
    }
  };

  const historicalAlerts = alerts.filter(a => a.status === 'resuelta' || a.status === 'archivada');

  const filtered = historicalAlerts.filter(a => {
    const q = searchQuery.toLowerCase();
    return searchQuery === '' ||
      a.address?.toLowerCase().includes(q) ||
      a.description?.toLowerCase().includes(q) ||
      a.type.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <HistoryIcon className="h-6 w-6 text-primary" />
            Historial de Alertas
          </h1>
          <p className="text-muted-foreground">Registro completo de alertas resueltas y archivadas</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchHistory} disabled={loading} className="gap-2 shadow-sm">
          <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} /> Actualizar Datos
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-slate-50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 text-primary"><HistoryIcon className="h-5 w-5" /></div>
            <div><p className="text-2xl font-bold">{historicalAlerts.length}</p><p className="text-[10px] uppercase font-bold text-muted-foreground">Total Histórico</p></div>
          </CardContent>
        </Card>
        <Card className="bg-emerald-50 border-emerald-100">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-100 text-emerald-600"><CheckCircle2 className="h-5 w-5" /></div>
            <div><p className="text-2xl font-bold text-emerald-700">{historicalAlerts.filter(a => a.status === 'resuelta').length}</p><p className="text-[10px] uppercase font-bold text-emerald-600">Resueltas</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-muted text-muted-foreground"><Archive className="h-5 w-5" /></div>
            <div><p className="text-2xl font-bold">{historicalAlerts.filter(a => a.status === 'archivada').length}</p><p className="text-[10px] uppercase font-bold text-muted-foreground">Archivadas</p></div>
          </CardContent>
        </Card>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Buscar en el historial..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10 h-12 text-lg shadow-sm" />
      </div>

      <Card>
        <CardHeader className="border-b bg-muted/10 py-3"><CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Registros Localizados ({filtered.length})</CardTitle></CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 space-y-4">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground bg-slate-50/50">
               <HistoryIcon className="h-12 w-12 mx-auto mb-4 opacity-10" />
               <p className="text-lg font-medium">No se encontraron registros</p>
               <p className="text-sm">Las alertas resueltas aparecerán aquí automáticamente</p>
            </div>
          ) : (
            <ScrollArea className="h-[600px]">
              <div className="divide-y divide-slate-100">
                {filtered.map(a => (
                  <button key={a.id} onClick={() => setSelectedAlert(a)} className="w-full text-left p-5 hover:bg-slate-50 transition-all group flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className="bg-emerald-500 hover:bg-emerald-600 border-none px-2 py-0 h-5 text-[10px]">{a.status.toUpperCase()}</Badge>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{a.type}</span>
                        <div className="w-1 h-1 rounded-full bg-slate-300 mx-1" />
                        <span className="text-[10px] font-mono text-slate-500">ID: {a.id.slice(0,8)}</span>
                      </div>
                      <p className="font-bold text-slate-800 text-base mb-1 truncate">{a.address || 'Ubicación Desconocida'}</p>
                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-indigo-400" />{new Date(a.createdAt).toLocaleString('es-AR')}</span>
                        {a.resolvedAt && <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />{new Date(a.resolvedAt).toLocaleString('es-AR')}</span>}
                      </div>
                    </div>
                    <div className="flex items-center self-stretch ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="sm" className="font-bold text-indigo-600">VER DETALLES</Button>
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
