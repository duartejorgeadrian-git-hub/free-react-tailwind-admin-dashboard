import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart3, Download, AlertTriangle, CheckCircle2, Clock, TrendingUp, Shield } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { useMunicipality } from '@/context/MunicipalityContext';

const API_URL = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:3001`;

export default function Reports() {
  const { hasPermission } = useAuth();
  const { activeMunicipality } = useMunicipality();
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'7' | '30' | '90' | 'all'>('30');
  const [alerts, setAlerts] = useState<Array<{ status: string; type: string; severity: string; created_at: string; resolved_at: string | null }>>([]);

  useEffect(() => {
    fetchData();
  }, [period, activeMunicipality]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const municipalityParam = activeMunicipality ? `&municipalityId=${activeMunicipality.id}` : '';
      const response = await fetch(`${API_URL}/api/alerts?period=${period}${municipalityParam}`);
      const data = await response.json();
      setAlerts(data || []);
    } catch (e) {
      console.error(e);
      toast.error('Error al cargar reportes');
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    total: alerts.length,
    activas: alerts.filter(a => a.status === 'activa').length,
    en_atencion: alerts.filter(a => a.status === 'en_atencion').length,
    resueltas: alerts.filter(a => a.status === 'resuelta').length,
    criticas: alerts.filter(a => a.severity === 'critica').length,
  };

  const byType = alerts.reduce((acc, a) => {
    acc[a.type] = (acc[a.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const bySeverity = alerts.reduce((acc, a) => {
    acc[a.severity] = (acc[a.severity] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Avg resolution time (minutes)
  const resolved = alerts.filter(a => a.resolved_at);
  const avgResolutionMin = resolved.length > 0
    ? Math.round(resolved.reduce((sum, a) => sum + (new Date(a.resolved_at!).getTime() - new Date(a.created_at).getTime()), 0) / resolved.length / 60000)
    : 0;

  const handleExport = () => {
    const rows: (string | number)[][] = [
      ['Métrica', 'Valor'],
      ['Total alertas', stats.total],
      ['Activas', stats.activas],
      ['En atención', stats.en_atencion],
      ['Resueltas', stats.resueltas],
      ['Críticas', stats.criticas],
      ['Tiempo promedio resolución (min)', avgResolutionMin],
      [''],
      ['Por tipo', ''],
      ...Object.entries(byType).map(([k, v]) => [k, v] as (string | number)[]),
      [''],
      ['Por severidad', ''],
      ...Object.entries(bySeverity).map(([k, v]) => [k, v] as (string | number)[]),
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `reporte_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    toast.success('Reporte exportado');
  };

  if (!hasPermission('view_audit')) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-lg font-semibold mb-2">Acceso Restringido</h2>
            <p className="text-muted-foreground">No tiene permisos para ver reportes.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const maxType = Math.max(...Object.values(byType), 1);
  const maxSev = Math.max(...Object.values(bySeverity), 1);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-primary" />
            Reportes y Estadísticas
          </h1>
          <p className="text-muted-foreground">Análisis del sistema de monitoreo</p>
        </div>
        <div className="flex gap-2">
          <Select value={period} onValueChange={(v) => setPeriod(v as typeof period)}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Últimos 7 días</SelectItem>
              <SelectItem value="30">Últimos 30 días</SelectItem>
              <SelectItem value="90">Últimos 90 días</SelectItem>
              <SelectItem value="all">Todo el período</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleExport} disabled={loading}>
            <Download className="h-4 w-4 mr-2" />Exportar
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1"><BarChart3 className="h-4 w-4 text-primary" /><span className="text-xs text-muted-foreground">Total</span></div>
                <p className="text-2xl font-bold">{stats.total}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1"><AlertTriangle className="h-4 w-4 text-destructive" /><span className="text-xs text-muted-foreground">Activas</span></div>
                <p className="text-2xl font-bold text-destructive">{stats.activas}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1"><Clock className="h-4 w-4 text-amber-500" /><span className="text-xs text-muted-foreground">En atención</span></div>
                <p className="text-2xl font-bold text-amber-600">{stats.en_atencion}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1"><CheckCircle2 className="h-4 w-4 text-green-500" /><span className="text-xs text-muted-foreground">Resueltas</span></div>
                <p className="text-2xl font-bold text-green-600">{stats.resueltas}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1"><TrendingUp className="h-4 w-4 text-primary" /><span className="text-xs text-muted-foreground">Tiempo prom.</span></div>
                <p className="text-2xl font-bold">{avgResolutionMin}m</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Por Tipo de Alerta</CardTitle>
                <CardDescription>Distribución de incidentes</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {Object.entries(byType).length === 0 ? (
                  <p className="text-sm text-muted-foreground">Sin datos</p>
                ) : Object.entries(byType).map(([type, count]) => (
                  <div key={type}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="capitalize">{type}</span>
                      <span className="font-medium">{count}</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: `${(count / maxType) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Por Severidad</CardTitle>
                <CardDescription>Nivel de criticidad</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {Object.entries(bySeverity).length === 0 ? (
                  <p className="text-sm text-muted-foreground">Sin datos</p>
                ) : Object.entries(bySeverity).map(([sev, count]) => (
                  <div key={sev}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="capitalize flex items-center gap-2">
                        <Badge variant={sev === 'critica' ? 'destructive' : 'outline'} className="text-[10px]">{sev}</Badge>
                      </span>
                      <span className="font-medium">{count}</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className={`h-full ${sev === 'critica' ? 'bg-destructive' : 'bg-primary'}`} style={{ width: `${(count / maxSev) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
